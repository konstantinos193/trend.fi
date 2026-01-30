import { TrendSnapshot } from "@/lib/trends";
import MobileDashboardLayout from "../MobileDashboardLayout";
import MobileFooter from "../MobileFooter";
import MobileNewsFeed from "../MobileNewsFeed";
import MobileTrendGrid from "../MobileTrendGrid";
import MobileTrendRadar from "../MobileTrendRadar";
import MobileRadarHero from "./MobileRadarHero";

interface MobileRadarPageProps {
  trends: TrendSnapshot[];
}

export default function MobileRadarPage({ trends }: MobileRadarPageProps) {
  return (
    <MobileDashboardLayout>
      <MobileRadarHero />
      <MobileTrendRadar trends={trends} />
      <MobileTrendGrid trends={trends} />
      <MobileNewsFeed />
      <MobileFooter />
    </MobileDashboardLayout>
  );
}
