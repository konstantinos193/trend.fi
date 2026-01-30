export default function Footer() {
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

  return (
    <footer className="footer">
      <div className="footer__grid">
        {/* Brand Column */}
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo-icon.svg" alt="TrendFi" className="footer__logo-icon" />
            <span className="footer__logo-text">TrendFi</span>
          </div>
          <p className="footer__tagline">
            Trade attention markets on Solana. Real-time trend signals powered by 
            Google Trends data and on-chain oracle verification.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="footer__col-title">Product</h4>
          <ul className="footer__links">
            {productLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="footer__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resource Links */}
        <div>
          <h4 className="footer__col-title">Resources</h4>
          <ul className="footer__links">
            {resourceLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="footer__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="footer__col-title">Stay Updated</h4>
          <p className="text-sm text-slate-400 mb-3">
            Get notified about new features and premium drops.
          </p>
          <div className="footer__newsletter">
            <input 
              type="email" 
              placeholder="your@email.com"
              className="footer__input"
            />
            <button className="theme-toggle">Go</button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="footer__bottom">
        <p className="footer__copy">
          © 2026 TrendFi. Built on{" "}
          <span className="footer__solana">
            <img src="/solana-mark.svg" alt="Solana" className="footer__solana-logo" />
            Solana
          </span>
          . Powered by attention.
        </p>
        <div className="footer__socials">
          <a className="footer__social" href="https://discord.com" target="_blank" rel="noreferrer">Discord</a>
          <a className="footer__social" href="https://x.com" target="_blank" rel="noreferrer">X</a>
          <a className="footer__social" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
