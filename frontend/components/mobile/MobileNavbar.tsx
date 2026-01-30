import Link from "next/link";

const navLinks = [
  { label: "Trending", href: "#trending" },
  { label: "Radar", href: "/radar" },
  { label: "Markets", href: "/markets" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Wallet", href: "#wallet" },
  { label: "Pricing", href: "#pricing" },
];

export default function MobileNavbar() {
  return (
    <header className="mobile-navbar">
      <div className="mobile-navbar__row">
        <Link href="/" className="mobile-navbar__brand">
          <img src="/logo-icon.svg" alt="TrendFi" className="mobile-navbar__logo" />
          <span className="mobile-navbar__title">TrendFi</span>
        </Link>
        <a href="#wallet" className="btn-cta btn-cta--compact">
          <span>Join</span>
        </a>
      </div>
      <nav className="mobile-navbar__nav" aria-label="Primary">
        {navLinks.map((link) => (
          <Link key={link.label} href={link.href} className="mobile-navbar__link">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
