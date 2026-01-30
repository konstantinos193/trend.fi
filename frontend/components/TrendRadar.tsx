import { TrendSnapshot } from "@/lib/trends";

interface TrendRadarProps {
  trends: TrendSnapshot[];
}

export default function TrendRadar({ trends }: TrendRadarProps) {
  const displayTrends = trends.slice(0, 6);

  return (
    <div className="live-radar">
      <div className="radar-beam" />
      <div className="pulse-ring" />
      
      <div className="radar-grid">
        {displayTrends.map((trend, index) => {
          const isHot = trend.momentum > 0.7;
          
          return (
            <div 
              key={trend.topic} 
              className="radar-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
                  {trend.region}
                </span>
                {isHot && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              
              <p className="font-semibold text-white">{trend.topic}</p>
              
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-lg font-mono font-semibold ${isHot ? 'text-cyan' : 'text-slate-300'}`}>
                  {trend.momentum.toFixed(3)}
                </span>
                <span className="text-xs text-slate-500 font-mono">momentum</span>
              </div>
              
              <div className="mt-1">
                <span className={`text-sm font-mono ${trend.velocity > 0 ? 'text-cyan' : 'text-magenta'}`}>
                  {trend.velocity > 0 ? '↑' : '↓'} {Math.abs(trend.velocity).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
