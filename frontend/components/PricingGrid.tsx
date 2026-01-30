const plans = [
  { 
    name: "Starter", 
    price: "$0", 
    period: "/mo",
    perks: ["Basic trends", "Web3 leaderboard", "Community chat"],
    cta: "Get Started",
    ctaHref: "#wallet",
    featured: false
  },
  { 
    name: "Momentum", 
    price: "$29", 
    period: "/mo",
    perks: ["Advanced signals", "Priority oracle data", "Boosted markets", "API access"],
    cta: "Upgrade",
    ctaHref: "#wallet",
    featured: true
  },
  { 
    name: "Pro Suite", 
    price: "$79", 
    period: "/mo",
    perks: ["Dedicated analyst", "Premium charts", "Sponsorship priority", "Custom alerts"],
    cta: "Contact",
    ctaHref: "mailto:team@trend.fi",
    featured: false
  },
];

export default function PricingGrid() {
  return (
    <section id="pricing" className="dash-card mt-8 animate-in delay-4">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">Pricing</h2>
          <p className="dash-card__subtitle">Choose your tier</p>
        </div>
        <span className="small-badge">Plans</span>
      </div>
      
      <div className="pricing-grid">
        {plans.map((plan) => (
          <article 
            key={plan.name} 
            className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`}
          >
            <div className="pricing-card__header">
              <p className="pricing-card__name">{plan.name}</p>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">{plan.price}</span>
                <span className="pricing-card__period">{plan.period}</span>
              </div>
            </div>
            
            <ul className="pricing-card__perks">
              {plan.perks.map((perk) => (
                <li key={perk} className="pricing-card__perk">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>
            
            <a
              href={plan.ctaHref}
              className={plan.featured ? 'btn-cta w-full' : 'theme-toggle w-full'}
            >
              <span>{plan.cta}</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
