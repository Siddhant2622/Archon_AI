"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "elevated";
  hover?: boolean;
  glow?: "none" | "cyan" | "violet" | "emerald";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const variantClasses = {
  default: "card",
  glass: "card-glass",
  elevated: "card shadow-2xl",
};

const glowClasses = {
  none: "",
  cyan: "glow-cyan",
  violet: "glow-violet",
  emerald: "glow-emerald",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  variant = "default",
  hover = true,
  glow = "none",
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${glowClasses[glow]}
        ${paddingClasses[padding]}
        ${hover ? "" : "!transform-none hover:!shadow-none hover:!border-[rgba(255,255,255,0.06)]"}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ===== Card Sub-components ===== */

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-bold text-text-primary ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-text-secondary mt-1 ${className}`}>
      {children}
    </p>
  );
}
