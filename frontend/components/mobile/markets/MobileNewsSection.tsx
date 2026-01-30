const items = [
  {
    tag: "Market",
    title: "Momentum Build-Up Detected",
    detail: "3 regions showing accelerated growth",
    time: "1h ago",
  },
  {
    tag: "Signal",
    title: "Volatility Spike",
    detail: "Mid-cap topics trending upward",
    time: "3h ago",
  },
  {
    tag: "Research",
    title: "Weekly Trend Brief",
    detail: "Top movers and breakout watchlist",
    time: "1d ago",
  },
];

export default function MobileNewsSection() {
  return (
    <section id="news" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Market News</h2>
          <p className="mobile-section__subtitle">Latest updates</p>
        </div>
        <span className="mobile-pill">Feed</span>
      </div>
      <div className="mobile-list">
        {items.map((item) => (
          <article key={item.title} className="mobile-card">
            <div className="mobile-card__row">
              <span className="mobile-tag">{item.tag}</span>
              <span className="mobile-time">{item.time}</span>
            </div>
            <p className="mobile-card__title">{item.title}</p>
            <p className="mobile-card__text">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
