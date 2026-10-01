import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export const soles = (n: number) => `S/ ${n.toLocaleString("en-US")}`
