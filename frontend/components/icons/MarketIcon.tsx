import React from "react";
import { IconProps } from "./MomentumIcon";

export function MarketIcon({ size = 48, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Market icon"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="marketRise" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#9bffe5" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="44" height="44" rx="10" fill="rgba(16,185,129,0.12)" stroke="rgba(248,250,252,0.2)" strokeWidth="2" />
      <path
        d="M18 42v-18l8-4 6 10 10-10 6 14 6-6"
        stroke="url(#marketRise)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="42" r="3.5" fill="#020617" stroke="#a855f7" strokeWidth="1.5" />
      <circle cx="42" cy="26" r="3.5" fill="#020617" stroke="#9bffe5" strokeWidth="1.5" />
      <circle cx="56" cy="20" r="3" fill="#020617" stroke="#9bffe5" strokeWidth="1.5" />
    </svg>
  );
}
