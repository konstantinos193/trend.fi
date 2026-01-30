import TrendBlob from "./TrendBlob";

const stats = [
  { label: "Oracle Sync", value: "5m" },
  { label: "Hybrid AMM", value: "Active" },
  { label: "Chain", value: "Solana" },
];

export default function BrandBanner() {
  return (
    <section className="brand-banner animate-in">
      <div className="brand-banner__visual">
        <TrendBlob />
        <span className="brand-banner__badge">Attention Derivatives</span>
      </div>

      <div className="brand-banner__copy">
        <p className="brand-banner__eyebrow">Reality-Native Hype</p>
        <h3>Trade viral momentum before it goes mainstream</h3>
        <p>
          TrendFi turns social signals into tradeable assets. Normalized Google + social 
          velocity, oracle-anchored momentum, and Solana-scalable markets — all in one 
          ambient interface.
        </p>
        
        <div className="brand-banner__stats">
          {stats.map((stat) => (
            <span key={stat.label}>
              <strong className="text-cyan">{stat.value}</strong> {stat.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
