import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TIME_RANGES, BMI_CATEGORIES } from "./constants"
import type { WeightEntry } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
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
