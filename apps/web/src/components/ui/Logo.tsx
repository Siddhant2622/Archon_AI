"use client";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
}

const sizes = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
};

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export default function Logo({
  className = "",
  size = "md",
  showText = true,
  animated = true,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`${sizes[size]} transition-transform duration-500 ${
            animated ? "group-hover:rotate-180" : ""
          }`}
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L2 7l10 5 10-5-10-5z"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17l10 5 10-5"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          <path
            d="M2 12l10 5 10-5"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-accent-cyan rounded-full" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-text-primary tracking-tight`}>
          Archon
          <span className="gradient-text-cyan ml-0.5">AI</span>
        </span>
      )}
    </div>
  );
}
