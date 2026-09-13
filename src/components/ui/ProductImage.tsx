"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Object-contain/cover handled by className on the wrapping layout. */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

/** next/image with the mockup's on-error fallback (broken-image placeholder). */
export function ProductImage({
  src,
  alt,
  className = "",
  style,
  fill,
  width,
  height,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-3.5-3.5L9 20" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={style}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}