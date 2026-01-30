import StarIcon from "@/components/icons/StarIcon";
import BoltIcon from "@/components/icons/BoltIcon";
import TargetIcon from "@/components/icons/TargetIcon";

const leaders = [
  { name: "Nora Trendline", stat: "+18.3%", tagline: "Long on energy virality", icon: StarIcon },
  { name: "Juno Pulse", stat: "12.1x", tagline: "Shipping attention arbitrage", icon: BoltIcon },
  { name: "Atlas Bloom", stat: "8.4x", tagline: "Momentum trader", icon: TargetIcon },
];

export default function UserHighlights() {
  return (
    <section id="top-traders" className="dash-card animate-in delay-2">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">Top Traders</h2>
          <p className="dash-card__subtitle">This week's leaders</p>
        </div>
        <span className="small-badge">weekly</span>
      </div>
      
      <div className="leaderboard">
        {leaders.map((leader) => {
          const Icon = leader.icon;

          return (
            <article 
              key={leader.name} 
              className="leaderboard-card"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-7 w-7 text-cyan" />
                <div className="flex-1">
                  <strong className="text-sm">{leader.name}</strong>
                  <p className="text-xs text-slate-500">{leader.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-cyan">{leader.stat}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
