const events = [
  { title: "Live Data Drop", time: "Today 18:00", type: "Live" },
  { title: "Solana AMA", time: "Tomorrow 09:00", type: "Event" },
  { title: "Hackathon", time: "Friday 21:00", type: "Build" },
];

const stats = [
  { label: "Rooms", value: "18" },
  { label: "Online", value: "247" },
];

export default function MobileCommunityPulse() {
  return (
    <section id="community" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Community</h2>
          <p className="mobile-section__subtitle">Events and chat</p>
        </div>
        <span className="mobile-pill">Live</span>
      </div>
      <div className="mobile-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="mobile-stat-card">
            <span className="mobile-metric">{stat.value}</span>
            <span className="mobile-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="mobile-list">
        {events.map((event) => (
          <article key={event.title} className="mobile-card">
            <div className="mobile-card__row">
              <div>
                <p className="mobile-card__title">{event.title}</p>
                <p className="mobile-card__text">{event.time}</p>
              </div>
              <span className="mobile-tag mobile-tag--hot">{event.type}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
