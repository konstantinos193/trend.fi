import RealTimeCharts from "./RealTimeCharts";
import MomentumTables from "./MomentumTables";
import NewsSection from "./NewsSection";
import { TrendSnapshot } from "@/lib/trends";

interface MarketsContentProps {
  trends: TrendSnapshot[];
}

export default function MarketsContent({ trends }: MarketsContentProps) {
  return (
    <section className="markets space-y-6">
      <section id="overview" className="dash-card animate-in page-hero page-hero--markets">
        <div className="dash-card__header">
          <div>
            <h1 className="dash-card__title">Markets</h1>
            <p className="dash-card__subtitle">Live trend momentum and real-time signals</p>
          </div>
          <span className="small-badge">Live</span>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Track the strongest trend moves as they form, compare momentum shifts, and follow fresh
          signals across regions.
        </p>
      </section>

      <div className="dashboard__grid">
        <div className="dashboard__col dashboard__col--main">
          <RealTimeCharts trends={trends} />
          <MomentumTables trends={trends} />
        </div>
        <div className="dashboard__col dashboard__col--aside">
          <NewsSection />
        </div>
      </div>
    </section>
  );
}
