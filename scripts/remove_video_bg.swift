import Foundation
import AVFoundation
import CoreImage
import CoreVideo

enum RemoveBGError: Error {
  case usage
  case noVideoTrack
  case cannotAddWriterInput
  case cannotAddPixelBufferAdaptor
  case failedToStartReading
  case failedToStartWriting
  case missingImageBuffer
  case writerFailed(String)
}

func averageBackgroundColor(for image: CIImage, context: CIContext) -> CIVector {
  let extent = image.extent
  let sampleRects = [
    CGRect(x: extent.minX, y: extent.minY, width: 24, height: 24),
    CGRect(x: extent.maxX - 24, y: extent.minY, width: 24, height: 24),
    CGRect(x: extent.minX, y: extent.maxY - 24, width: 24, height: 24),
    CGRect(x: extent.maxX - 24, y: extent.maxY - 24, width: 24, height: 24),
  ]

  var total = SIMD3<Double>(repeating: 0)

  for rect in sampleRects {
    let cropped = image.cropped(to: rect)
    guard
      let filter = CIFilter(name: "CIAreaAverage"),
      let outputImage = {
        filter.setValue(cropped, forKey: kCIInputImageKey)
        filter.setValue(CIVector(cgRect: cropped.extent), forKey: kCIInputExtentKey)
        return filter.outputImage
      }()
    else {
      continue
    }

    var pixel = [UInt8](repeating: 0, count: 4)
    context.render(
      outputImage,
      toBitmap: &pixel,
      rowBytes: 4,
      bounds: CGRect(x: 0, y: 0, width: 1, height: 1),
      format: .RGBA8,
      colorSpace: CGColorSpaceCreateDeviceRGB()
    )

    total += SIMD3<Double>(
      Double(pixel[0]) / 255.0,
      Double(pixel[1]) / 255.0,
      Double(pixel[2]) / 255.0
    )
  }

  let averaged = total / Double(sampleRects.count)
  return CIVector(x: averaged.x, y: averaged.y, z: averaged.z, w: 1)
}

struct RemoveVideoBackground {
  static func run() throws {
    let args = CommandLine.arguments
    guard args.count == 3 else {
      throw RemoveBGError.usage
    }

    let inputURL = URL(fileURLWithPath: args[1])
    let outputURL = URL(fileURLWithPath: args[2])

    let asset = AVURLAsset(url: inputURL)
    guard let videoTrack = asset.tracks(withMediaType: .video).first else {
      throw RemoveBGError.noVideoTrack
    }

    let bgReader = try AVAssetReader(asset: asset)
    let bgReaderOutput = AVAssetReaderTrackOutput(
      track: videoTrack,
      outputSettings: [
        kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)
      ]
    )
    bgReaderOutput.alwaysCopiesSampleData = false
    bgReader.add(bgReaderOutput)

    guard bgReader.startReading() else {
      throw RemoveBGError.failedToStartReading
    }
    guard let firstSample = bgReaderOutput.copyNextSampleBuffer(),
          let firstBuffer = CMSampleBufferGetImageBuffer(firstSample) else {
      throw RemoveBGError.missingImageBuffer
    }
    bgReader.cancelReading()

    let reader = try AVAssetReader(asset: asset)
    let readerOutput = AVAssetReaderTrackOutput(
      track: videoTrack,
      outputSettings: [
        kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)
      ]
    )
    readerOutput.alwaysCopiesSampleData = false
    reader.add(readerOutput)

    let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mov)
    let naturalSize = videoTrack.naturalSize
    let transform = videoTrack.preferredTransform

    let writerInput = AVAssetWriterInput(
      mediaType: .video,
      outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.hevcWithAlpha,
        AVVideoWidthKey: naturalSize.width,
        AVVideoHeightKey: naturalSize.height,
        AVVideoCompressionPropertiesKey: [
          AVVideoAverageBitRateKey: 2_500_000
        ]
      ]
    )
    writerInput.transform = transform
    writerInput.expectsMediaDataInRealTime = false

    guard writer.canAdd(writerInput) else {
      throw RemoveBGError.cannotAddWriterInput
    }
    writer.add(writerInput)

    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
      assetWriterInput: writerInput,
      sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA),
        kCVPixelBufferWidthKey as String: naturalSize.width,
        kCVPixelBufferHeightKey as String: naturalSize.height
      ]
    )

    let ciContext = CIContext(options: [
      .cacheIntermediates: false
    ])

    let inputImage = CIImage(cvPixelBuffer: firstBuffer)
    let bgColor = averageBackgroundColor(for: inputImage, context: ciContext)

    let kernelSource = """
    kernel vec4 removeBG(__sample s, vec3 bg, float low, float high) {
      float dist = distance(s.rgb, bg);
      float alpha = smoothstep(low, high, dist);
      return vec4(s.rgb, alpha);
    }
    """
    let kernel = CIColorKernel(source: kernelSource)!

    try? FileManager.default.removeItem(at: outputURL)

    guard reader.startReading() else {
      throw RemoveBGError.failedToStartReading
    }
    guard writer.startWriting() else {
      throw RemoveBGError.failedToStartWriting
    }
    writer.startSession(atSourceTime: .zero)

    var frameIndex = 0
    while reader.status == .reading {
      guard writerInput.isReadyForMoreMediaData else {
        Thread.sleep(forTimeInterval: 0.01)
        continue
      }

      guard let sampleBuffer = readerOutput.copyNextSampleBuffer() else {
        break
      }

      guard let sourceBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
        throw RemoveBGError.missingImageBuffer
      }

      let timestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
      let sourceImage = CIImage(cvPixelBuffer: sourceBuffer)
      let maskedImage = kernel.apply(
        extent: sourceImage.extent,
        arguments: [sourceImage, bgColor, 0.028, 0.11]
      )!

      guard let pool = adaptor.pixelBufferPool else {
        throw RemoveBGError.cannotAddPixelBufferAdaptor
      }

      var targetBuffer: CVPixelBuffer?
      CVPixelBufferPoolCreatePixelBuffer(nil, pool, &targetBuffer)
      guard let targetBuffer else {
        throw RemoveBGError.cannotAddPixelBufferAdaptor
      }

      ciContext.render(maskedImage, to: targetBuffer)
      adaptor.append(targetBuffer, withPresentationTime: timestamp)
      frameIndex += 1
    }

    writerInput.markAsFinished()

    let semaphore = DispatchSemaphore(value: 0)
    writer.finishWriting {
      semaphore.signal()
    }
    semaphore.wait()

    if writer.status == .failed {
      throw RemoveBGError.writerFailed(writer.error?.localizedDescription ?? "unknown writer failure")
    }

    let output: [String: Any] = [
      "status": writer.status.rawValue,
      "readerStatus": reader.status.rawValue,
      "frames": frameIndex,
      "output": outputURL.path,
      "error": writer.error?.localizedDescription ?? ""
    ]
    if let data = try? JSONSerialization.data(withJSONObject: output, options: [.prettyPrinted]),
       let text = String(data: data, encoding: .utf8) {
      print(text)
    }
  }
}

do {
  try RemoveVideoBackground.run()
} catch RemoveBGError.usage {
  fputs("Usage: swift remove_video_bg.swift <input.mp4> <output.mov>\n", stderr)
  exit(2)
} catch {
  fputs("Error: \(error)\n", stderr)
  exit(1)
}
