import React from "react";
import { IconProps } from "./MomentumIcon";

export function OracleIcon({ size = 48, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Oracle icon"
      fill="none"
      {...props}
    >
      <defs>
        <radialGradient id="oracleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9bffe5" stopOpacity="0.6" />
          <stop offset="80%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#oracleGlow)" stroke="rgba(248,250,252,0.2)" strokeWidth="2" />
      <circle cx="32" cy="32" r="10" fill="rgba(168,85,247,0.3)" />
      <path
        d="M32 18v28M18 32h28M24.5 24.5l15 15M24.5 39.5l15-15"
        stroke="#f8fafc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="4" fill="#020617" stroke="#a855f7" strokeWidth="2" />
      <circle cx="44" cy="20" r="3" fill="#020617" stroke="#9bffe5" strokeWidth="1.5" />
      <circle cx="20" cy="44" r="3" fill="#020617" stroke="#9bffe5" strokeWidth="1.5" />
    </svg>
  );
}
