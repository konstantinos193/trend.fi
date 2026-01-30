type MedalRank = 1 | 2 | 3;

interface MedalIconProps {
  rank: MedalRank;
  className?: string;
  title?: string;
}

const medalStyles: Record<MedalRank, { medal: string; ribbonLeft: string; ribbonRight: string; text: string }> = {
  1: {
    medal: "#f4d35e",
    ribbonLeft: "#38bdf8",
    ribbonRight: "#22c55e",
    text: "#0f172a",
  },
  2: {
    medal: "#cbd5f5",
    ribbonLeft: "#94a3b8",
    ribbonRight: "#64748b",
    text: "#0f172a",
  },
  3: {
    medal: "#d1a26f",
    ribbonLeft: "#f97316",
    ribbonRight: "#f59e0b",
    text: "#0f172a",
  },
};

const defaultTitles: Record<MedalRank, string> = {
  1: "First place",
  2: "Second place",
  3: "Third place",
};

export default function MedalIcon({ rank, className, title }: MedalIconProps) {
  const colors = medalStyles[rank];

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="1em"
      height="1em"
      role="img"
      aria-label={title ?? defaultTitles[rank]}
    >
      <title>{title ?? defaultTitles[rank]}</title>
      <path d="M6 2h5l1.5 6-3.5 2L6 2z" fill={colors.ribbonLeft} />
      <path d="M18 2h-5l-1.5 6 3.5 2L18 2z" fill={colors.ribbonRight} />
      <circle cx="12" cy="16" r="6" fill={colors.medal} />
      <circle cx="12" cy="16" r="5.2" fill="none" stroke="rgba(15, 23, 42, 0.35)" strokeWidth="0.6" />
      <text
        x="12"
        y="18.7"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill={colors.text}
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
      >
        {rank}
      </text>
    </svg>
  );
}
