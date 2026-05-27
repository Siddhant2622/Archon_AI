"use client";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "cyan" | "violet";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  pulse?: boolean;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  danger: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
  info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
  neutral: "bg-white/5 text-text-secondary border-white/10",
  cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
  violet: "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-accent-emerald",
  warning: "bg-accent-amber",
  danger: "bg-accent-rose",
  info: "bg-accent-cyan",
  neutral: "bg-text-muted",
  cyan: "bg-accent-cyan",
  violet: "bg-accent-violet",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  pulse = false,
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${dotColors[variant]}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
