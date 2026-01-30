const productLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Markets", href: "/markets" },
  { label: "Radar", href: "#radar" },
  { label: "Leaderboard", href: "#leaderboard" },
];
const resourceLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Top Traders", href: "#top-traders" },
  { label: "News", href: "#news" },
  { label: "Community", href: "#community" },
  { label: "Contact", href: "mailto:team@trend.fi" },
];

export default function MobileFooter() {
  return (
    <footer className="mobile-footer">
      <div className="mobile-footer__brand">
        <img src="/logo-icon.svg" alt="TrendFi" className="mobile-footer__logo" />
        <p>
          Trade attention markets on Solana. Real-time trend signals powered by Google
          Trends data and on-chain oracle verification.
        </p>
      </div>
      <div className="mobile-footer__links">
        <div>
          <h4>Product</h4>
          {productLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <h4>Resources</h4>
          {resourceLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="mobile-footer__bottom">
        <p>
          © 2026 TrendFi. Built on{" "}
          <span className="mobile-footer__solana">
            <img src="/solana-mark.svg" alt="Solana" className="mobile-footer__solana-logo" />
            Solana
          </span>
          .
        </p>
        <div className="mobile-footer__socials">
          <a href="https://discord.com" target="_blank" rel="noreferrer">Discord</a>
          <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
