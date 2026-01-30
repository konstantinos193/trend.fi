import Link from "next/link";
import { TrendSnapshot } from "@/lib/trends";
import { getTrendHref } from "@/lib/trendRouting";

interface TrendingCarouselProps {
  trends: TrendSnapshot[];
}

export default function TrendingCarousel({ trends }: TrendingCarouselProps) {
  return (
    <div className="trending-carousel">
      {trends.map((trend, index) => {
        const isHot = trend.momentum > 0.7;
        
        const trendHref = getTrendHref(trend.topic);

        return (
          <Link
            key={trend.topic}
            href={trendHref}
            className="carousel-card"
            style={{ animationDelay: `${index * 0.05}s` }}
            aria-label={`View trend details for ${trend.topic}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
                {trend.region}
              </span>
              {isHot && (
                <span className="text-xs font-mono text-cyan uppercase">Hot</span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mt-2">{trend.topic}</h3>
            
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-xl font-mono font-semibold ${isHot ? 'text-cyan' : 'text-slate-200'}`}>
                {trend.momentum.toFixed(3)}
              </span>
              <span className={`text-sm font-mono ${trend.velocity > 0 ? 'text-cyan' : 'text-magenta'}`}>
                {trend.velocity > 0 ? '↑' : '↓'} {Math.abs(trend.velocity).toFixed(2)}
              </span>
            </div>
            
            <div className="sparkline">
              <span style={{ width: `${Math.min(100, trend.momentum * 95)}%` }} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
