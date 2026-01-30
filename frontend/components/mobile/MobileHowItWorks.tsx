const steps = [
  {
    number: "01",
    title: "Signal Ingestion",
    detail: "Google Trends + social velocity fed into Supabase every 5 minutes.",
  },
  {
    number: "02",
    title: "Attention Markets",
    detail: "Solana-based attention derivatives minted and boosted per trend.",
  },
  {
    number: "03",
    title: "Oracle Settlement",
    detail: "Momentum snapshots secured by a Solana oracle relayer.",
  },
];

export default function MobileHowItWorks() {
  return (
    <section id="how-it-works" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">How It Works</h2>
          <p className="mobile-section__subtitle">Three steps to trade attention</p>
        </div>
        <span className="mobile-pill">Playbook</span>
      </div>
      <div className="mobile-list">
        {steps.map((step) => (
          <article key={step.title} className="mobile-card">
            <div className="mobile-card__row">
              <span className="mobile-step">{step.number}</span>
              <p className="mobile-card__title">{step.title}</p>
            </div>
            <p className="mobile-card__text">{step.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
