import TrendCard, { TrendCardProps } from "./TrendCard";
import ChartIcon from "@/components/icons/ChartIcon";

interface TrendGridProps {
  trends: TrendCardProps[];
}

export default function TrendGrid({ trends }: TrendGridProps) {
  if (!trends.length) {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-black/20">
        <ChartIcon className="h-10 w-10 text-cyan/80 mx-auto mb-4" />
        <p className="text-slate-400 font-medium">No trends available right now.</p>
        <p className="text-sm text-slate-500 mt-1">Check back in a few minutes for fresh data.</p>
      </div>
    );
  }

  return (
    <div className="trend-grid">
      {trends.map((trend, index) => (
        <div 
          key={`${trend.topic}-${trend.timestamp}`}
          style={{ animationDelay: `${index * 0.05}s` }}
          className="animate-in"
        >
          <TrendCard {...trend} />
        </div>
      ))}
    </div>
  );
}
