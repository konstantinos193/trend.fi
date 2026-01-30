import StarIcon from "@/components/icons/StarIcon";
import BoltIcon from "@/components/icons/BoltIcon";
import TargetIcon from "@/components/icons/TargetIcon";

const leaders = [
  { name: "Nora Trendline", stat: "+18.3%", tagline: "Long on energy virality", icon: StarIcon },
  { name: "Juno Pulse", stat: "12.1x", tagline: "Shipping attention arbitrage", icon: BoltIcon },
  { name: "Atlas Bloom", stat: "8.4x", tagline: "Momentum trader", icon: TargetIcon },
];

export default function MobileUserHighlights() {
  return (
    <section id="top-traders" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Top Traders</h2>
          <p className="mobile-section__subtitle">This week's leaders</p>
        </div>
        <span className="mobile-pill">Weekly</span>
      </div>
      <div className="mobile-list">
        {leaders.map((leader) => {
          const Icon = leader.icon;

          return (
            <article key={leader.name} className="mobile-card">
              <div className="mobile-card__row">
                <span className="mobile-avatar">
                  <Icon className="h-6 w-6 text-cyan" />
                </span>
                <div>
                  <p className="mobile-card__title">{leader.name}</p>
                  <p className="mobile-card__text">{leader.tagline}</p>
                </div>
                <span className="mobile-metric">{leader.stat}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
