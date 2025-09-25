import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: {
    width: 120,
    height: 32,
    className: "h-8 w-auto"
  },
  md: {
    width: 160,
    height: 42,
    className: "h-10 w-auto"
  },
  lg: {
    width: 200,
    height: 54,
    className: "h-14 w-auto"
  },
  xl: {
    width: 240,
    height: 64,
    className: "h-16 w-auto"
  }
};

export function Logo({
  variant = "default",
  size = "md",
  className
}: LogoProps) {
  const { width, height, className: sizeClassName } = sizeMap[size];
  const logoSrc = variant === "white"
    ? "/images/stegmaier-logo-white.png"
    : "/images/stegmaier-logo.png";

  return (
    <Image
      src={logoSrc}
      alt="Stegmaier Management"
      width={width}
      height={height}
      priority
      className={cn(
        sizeClassName,
        "object-contain",
        className
      )}
    />
  );
}

// Responsive Logo component that adapts to screen size
export function ResponsiveLogo({
  variant = "default",
  className
}: Omit<LogoProps, "size">) {
  const logoSrc = variant === "white"
    ? "/images/stegmaier-logo-white.png"
    : "/images/stegmaier-logo.png";

  return (
    <Image
      src={logoSrc}
      alt="Stegmaier Management"
      width={200}
      height={54}
      priority
      className={cn(
        "h-6 w-auto sm:h-8 md:h-10 lg:h-12",
        "object-contain",
        className
      )}
    />
  );
}

// Simple text-only logo for minimal usage
export function LogoText({ className }: { className?: string }) {
  return (
    <span className={cn(
      "text-2xl font-bold",
      "bg-gradient-to-r from-stegmaier-blue to-stegmaier-blue-dark",
      "bg-clip-text text-transparent",
      className
    )}>
      Stegmaier
    </span>
  );
}