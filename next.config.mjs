/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [320, 375, 425, 640, 768],
  },
};

export default nextConfig;
