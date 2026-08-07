import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, pattern, step, ...props }, ref) => {
    const inferredInputMode =
      inputMode ??
      (type === "number"
        ? step && `${step}` !== "1"
          ? "decimal"
          : "numeric"
        : undefined)

    const inferredPattern =
      pattern ??
      (type === "number"
        ? inferredInputMode === "decimal"
          ? "[0-9]*[.,]?[0-9]*"
          : "[0-9]*"
        : undefined)

    return (
      <input
        type={type}
        inputMode={inferredInputMode}
        pattern={inferredPattern}
        step={step}
        className={cn(
          "flex h-11 w-full min-w-0 max-w-full rounded-full bg-background px-4 py-2 text-sm [border:var(--neo-border)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:[border-color:hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
