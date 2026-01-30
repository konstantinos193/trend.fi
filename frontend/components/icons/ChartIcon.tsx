interface IconProps {
  className?: string;
  title?: string;
}

export default function ChartIcon({ className, title = "Trend chart" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="1em"
      height="1em"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M4 4v16h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="7" y="12" width="2.5" height="6" rx="0.5" fill="currentColor" />
      <rect x="11" y="9" width="2.5" height="9" rx="0.5" fill="currentColor" />
      <rect x="15" y="7" width="2.5" height="11" rx="0.5" fill="currentColor" />
      <path
        d="M7 10l3-2 3 1 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
