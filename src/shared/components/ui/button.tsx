import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-stegmaier-blue text-white shadow-sm hover:bg-stegmaier-blue-dark hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-stegmaier-blue/20 active:translate-y-0 active:shadow-sm",
        secondary: "bg-transparent text-stegmaier-blue border border-stegmaier-blue hover:bg-stegmaier-blue hover:text-white focus-visible:ring-stegmaier-blue/20",
        outline: "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/20",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/20",
        link: "text-stegmaier-blue underline-offset-4 hover:underline hover:text-stegmaier-blue-dark",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-destructive/20",
        success: "bg-success text-white shadow-sm hover:bg-success/90 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-success/20",
        warning: "bg-warning text-white shadow-sm hover:bg-warning/90 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-warning/20"
      },
      size: {
        sm: "h-8 px-3 text-xs has-[>svg]:px-2.5",
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        lg: "h-12 px-6 py-3 has-[>svg]:px-4",
        xl: "h-14 px-8 py-4 text-base has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-7",
        "icon-lg": "size-11"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants }
