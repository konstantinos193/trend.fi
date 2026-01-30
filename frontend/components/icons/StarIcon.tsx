interface IconProps {
  className?: string;
  title?: string;
}

export default function StarIcon({ className, title = "Star highlight" }: IconProps) {
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
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5-4.8-4.6 6.6-.9L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}
