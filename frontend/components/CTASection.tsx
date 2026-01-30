export default function CTASection() {
  return (
    <section className="cta-panel card-surface mt-8 animate-in delay-5">
      <h2>Ready to trade hype?</h2>
      <p className="text-slate-400 mt-2 mb-6">
        Join TrendFi to mint attention futures and share boost credits across the network.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button className="btn-cta">
          <span>Join Now</span>
        </button>
        <button className="theme-toggle">View Plans</button>
      </div>
    </section>
  );
}
