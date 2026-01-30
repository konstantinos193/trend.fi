const events = [
  { title: "Live Data Drop", time: "Today 18:00", type: "Live" },
  { title: "Solana AMA", time: "Tomorrow 09:00", type: "Event" },
  { title: "Hackathon", time: "Friday 21:00", type: "Build" },
];

const stats = [
  { label: "Rooms", value: "18" },
  { label: "Online", value: "247" },
];

export default function CommunityPulse() {
  return (
    <section id="community" className="dash-card animate-in delay-4">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">Community</h2>
          <p className="dash-card__subtitle">Events & chat</p>
        </div>
        <span className="small-badge">Live</span>
      </div>
      
      {/* Quick Stats */}
      <div className="flex gap-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1 text-center p-3 rounded-lg bg-black/30">
            <p className="text-lg font-mono font-semibold text-cyan">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Events List */}
      <div className="space-y-2">
        {events.map((event) => (
          <div 
            key={event.title} 
            className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-slate-800/50 hover:border-cyan-500/30 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-white">{event.title}</p>
              <p className="text-xs text-slate-500">{event.time}</p>
            </div>
            <span className="text-xs font-mono uppercase tracking-wide text-cyan">
              {event.type}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
