import { TrendSnapshot } from "@/lib/trends";
import MobileDashboardLayout from "../MobileDashboardLayout";
import MobileFooter from "../MobileFooter";
import MobileNewsFeed from "../MobileNewsFeed";
import MobileTrendGrid from "../MobileTrendGrid";
import MobileTrendLeaderboard from "../MobileTrendLeaderboard";
import MobileLeaderboardHero from "./MobileLeaderboardHero";

interface MobileLeaderboardPageProps {
  trends: TrendSnapshot[];
}

export default function MobileLeaderboardPage({ trends }: MobileLeaderboardPageProps) {
  return (
    <MobileDashboardLayout>
      <MobileLeaderboardHero />
      <MobileTrendLeaderboard trends={trends} />
      <MobileTrendGrid trends={trends} />
      <MobileNewsFeed />
      <MobileFooter />
    </MobileDashboardLayout>
  );
}
