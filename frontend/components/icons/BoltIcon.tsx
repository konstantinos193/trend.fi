interface IconProps {
  className?: string;
  title?: string;
}

export default function BoltIcon({ className, title = "Lightning highlight" }: IconProps) {
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
        d="M13 2 3 14h7l-1 8 12-14h-7l1-6z"
        fill="currentColor"
      />
    </svg>
  );
}
