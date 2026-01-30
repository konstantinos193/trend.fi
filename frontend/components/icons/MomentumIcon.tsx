import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function MomentumIcon({ size = 48, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Momentum icon"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="momentumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9bffe5" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="12" stroke="url(#momentumGradient)" strokeWidth="2" />
      <path
        d="M16 40l8-12 8 6 12-16 8 12"
        stroke="#f8fafc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="28" r="5" fill="#020617" stroke="url(#momentumGradient)" strokeWidth="2" />
      <circle cx="48" cy="20" r="4" fill="#020617" stroke="#9bffe5" strokeWidth="1.5" />
      <circle cx="24" cy="32" r="3" fill="#020617" stroke="#a855f7" strokeWidth="1.5" />
    </svg>
  );
}
