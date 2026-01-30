const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    perks: ["Basic trends", "Web3 leaderboard", "Community chat"],
    cta: "Get Started",
    ctaHref: "#wallet",
  },
  {
    name: "Momentum",
    price: "$29",
    period: "/mo",
    perks: ["Advanced signals", "Priority oracle data", "Boosted markets", "API access"],
    cta: "Upgrade",
    ctaHref: "#wallet",
  },
  {
    name: "Pro Suite",
    price: "$79",
    period: "/mo",
    perks: ["Dedicated analyst", "Premium charts", "Sponsorship priority", "Custom alerts"],
    cta: "Contact",
    ctaHref: "mailto:team@trend.fi",
  },
];

export default function MobilePricingGrid() {
  return (
    <section id="pricing" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Pricing</h2>
          <p className="mobile-section__subtitle">Choose your tier</p>
        </div>
        <span className="mobile-pill">Plans</span>
      </div>
      <div className="mobile-list">
        {plans.map((plan) => (
          <article key={plan.name} className="mobile-card">
            <div className="mobile-card__row">
              <div>
                <p className="mobile-card__title">{plan.name}</p>
                <p className="mobile-card__text">
                  {plan.price}
                  <span className="mobile-price__period">{plan.period}</span>
                </p>
              </div>
              <a className="theme-toggle" href={plan.ctaHref}>
                {plan.cta}
              </a>
            </div>
            <ul className="mobile-perks">
              {plan.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
