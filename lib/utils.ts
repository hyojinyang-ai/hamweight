import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TIME_RANGES, BMI_CATEGORIES } from "./constants"
import type { WeightEntry } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (heightCm <= 0 || weightKg <= 0 || weightKg > 300 || heightCm > 300) return null
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  if (bmi < 5 || bmi > 100) return null
  return bmi
}

export function getBMICategory(bmi: number) {
  if (bmi < BMI_CATEGORIES.underweight.max) return BMI_CATEGORIES.underweight
  if (bmi < BMI_CATEGORIES.normal.max) return BMI_CATEGORIES.normal
  if (bmi < BMI_CATEGORIES.overweight.max) return BMI_CATEGORIES.overweight
  return BMI_CATEGORIES.obese
}

export function kgToLb(kg: number): number {
  return kg * 2.20462
}

export function lbToKg(lb: number): number {
  return lb / 2.20462
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54
}

export function getTimeOfDay(): WeightEntry["timeOfDay"] {
  const hour = new Date().getHours()

  if (hour >= TIME_RANGES.morning.start && hour <= TIME_RANGES.morning.end) {
    return "morning"
  }
  if (hour >= TIME_RANGES.lunch.start && hour <= TIME_RANGES.lunch.end) {
    return "lunch"
  }
  if (hour >= TIME_RANGES.afternoon.start && hour <= TIME_RANGES.afternoon.end) {
    return "afternoon"
  }
  return "evening"
}

export function formatWeight(kg: number, unit: "metric" | "imperial"): string {
  if (unit === "imperial") {
    return `${kgToLb(kg).toFixed(1)} lb`
  }
  return `${kg.toFixed(1)} kg`
}

export function formatWeightChange(deltaKg: number, unit: "metric" | "imperial"): string {
  const convertedDelta = unit === "imperial" ? kgToLb(deltaKg) : deltaKg
  const roundedDelta = Number(convertedDelta.toFixed(1))
  const sign = roundedDelta > 0 ? "+" : roundedDelta < 0 ? "-" : ""
  const label = unit === "imperial" ? "lb" : "kg"

  return `${sign}${Math.abs(roundedDelta).toFixed(1)} ${label}`
}

export function getWeightChangeDirection(
  deltaKg: number,
  unit: "metric" | "imperial"
): "increase" | "decrease" | "same" {
  const convertedDelta = unit === "imperial" ? kgToLb(deltaKg) : deltaKg
  const roundedDelta = Number(convertedDelta.toFixed(1))

  if (roundedDelta > 0) return "increase"
  if (roundedDelta < 0) return "decrease"
  return "same"
}

export function getWeightChangeByEntryId(entries: WeightEntry[]): Map<string, number | null> {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return sortedEntries.reduce((changes, entry, index) => {
    const previousEntry = sortedEntries[index - 1]
    changes.set(entry.id, previousEntry ? entry.weight - previousEntry.weight : null)
    return changes
  }, new Map<string, number | null>())
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1.slice(0, 10) === date2.slice(0, 10)
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
