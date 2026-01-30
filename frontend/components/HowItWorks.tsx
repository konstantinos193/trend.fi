const steps = [
  { 
    number: "01",
    title: "Signal Ingestion", 
    detail: "Google Trends + social velocity fed into Supabase every 5 minutes." 
  },
  { 
    number: "02",
    title: "Attention Markets", 
    detail: "Solana-based attention derivatives minted and boosted per trend." 
  },
  { 
    number: "03",
    title: "Oracle Settlement", 
    detail: "Momentum snapshots secured by a Solana oracle relayer." 
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="dash-card animate-in delay-3">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">How It Works</h2>
          <p className="dash-card__subtitle">Three steps to trade attention</p>
        </div>
        <span className="small-badge">Playbook</span>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article key={step.title} className="leaderboard-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan/10 text-cyan text-sm font-mono font-bold">
                {step.number}
              </span>
              <p className="text-sm font-semibold text-white">{step.title}</p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {step.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
