"use client";

import Image from "next/image";
import { cn } from "cn";

interface SonarLogoProps {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  className?: string;
  decorative?: boolean;
  /** "light" pins the light-surface artwork (for use on a light chip regardless of theme). */
  tone?: "auto" | "light";
}

const FULL_DIMENSIONS = {
  sm: { width: 112, height: 28 },
  md: { width: 144, height: 36 },
  lg: { width: 184, height: 46 },
};

const MARK_DIMENSIONS = {
  sm: 28,
  md: 34,
  lg: 44,
};

/**
 * Renders the authoritative SONAR brand logo from public/brand/ without
 * altering symbol geometry, proportions, or teal color identity.
 */
export function SonarLogo({
  variant = "full",
  size = "md",
  className,
  decorative = false,
  tone = "auto",
}: SonarLogoProps) {
  const altText = decorative ? "" : "SONAR";

  if (variant === "mark") {
    const dim = MARK_DIMENSIONS[size];
    return (
      <Image
        src="/brand/sonar-mark.png"
        alt={altText}
        width={dim}
        height={dim}
        priority
        className={cn("shrink-0 object-contain", className)}
        aria-hidden={decorative || undefined}
      />
    );
  }

  const { width, height } = FULL_DIMENSIONS[size];

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/brand/sonar-logo-light.png"
        alt={altText}
        width={width}
        height={height}
        priority
        className={cn(
          "block h-auto w-auto object-contain",
          tone === "auto" && "dark:hidden"
        )}
        style={{ height: `${height}px`, width: "auto" }}
        aria-hidden={decorative || undefined}
      />
      {tone === "auto" ? (
        <Image
          src="/brand/sonar-logo-dark.png"
          alt={altText}
          width={width}
          height={height}
          priority
          className="hidden h-auto w-auto object-contain dark:block"
          style={{ height: `${height}px`, width: "auto" }}
          aria-hidden={decorative || undefined}
        />
      ) : null}
    </span>
  );
}
