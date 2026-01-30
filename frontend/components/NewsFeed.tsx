const newsItems = [
  { 
    tag: "Market",
    title: "Electric Racing Trend Spike", 
    detail: "+19% momentum across Europe",
    time: "2h ago"
  },
  { 
    tag: "Protocol",
    title: "Oracle Upgrade Complete", 
    detail: "Latency now at 4 minutes",
    time: "5h ago"
  },
  { 
    tag: "Community",
    title: "Builder Roundtable Recap", 
    detail: "Hedging attention volatility",
    time: "1d ago"
  },
];

export default function NewsFeed() {
  return (
    <section id="news" className="dash-card animate-in delay-3">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">News</h2>
          <p className="dash-card__subtitle">Latest updates</p>
        </div>
        <span className="small-badge">Feed</span>
      </div>
      
      <div className="space-y-3">
        {newsItems.map((item) => (
          <article 
            key={item.title} 
            className="leaderboard-card group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wide text-cyan">
                {item.tag}
              </span>
              <span className="text-xs font-mono text-slate-500">{item.time}</span>
            </div>
            
            <h3 className="text-sm font-semibold text-white group-hover:text-cyan transition-colors">
              {item.title}
            </h3>
            
            <p className="text-xs text-slate-400 mt-1">
              {item.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
