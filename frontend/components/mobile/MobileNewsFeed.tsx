const newsItems = [
  {
    tag: "Market",
    title: "Electric Racing Trend Spike",
    detail: "+19% momentum across Europe",
    time: "2h ago",
  },
  {
    tag: "Protocol",
    title: "Oracle Upgrade Complete",
    detail: "Latency now at 4 minutes",
    time: "5h ago",
  },
  {
    tag: "Community",
    title: "Builder Roundtable Recap",
    detail: "Hedging attention volatility",
    time: "1d ago",
  },
];

export default function MobileNewsFeed() {
  return (
    <section id="news" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">News</h2>
          <p className="mobile-section__subtitle">Latest updates</p>
        </div>
        <span className="mobile-pill">Feed</span>
      </div>
      <div className="mobile-list">
        {newsItems.map((item) => (
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
