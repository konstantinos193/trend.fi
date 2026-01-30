import { TrendSnapshot } from "@/lib/trends";
import MobileCommunityPulse from "./MobileCommunityPulse";
import MobileDashboardLayout from "./MobileDashboardLayout";
import MobileFooter from "./MobileFooter";
import MobileHeroSection from "./MobileHeroSection";
import MobileHowItWorks from "./MobileHowItWorks";
import MobileNewsFeed from "./MobileNewsFeed";
import MobilePricingGrid from "./MobilePricingGrid";
import MobileStatsBar from "./MobileStatsBar";
import MobileTrendGrid from "./MobileTrendGrid";
import MobileTrendLeaderboard from "./MobileTrendLeaderboard";
import MobileTrendRadar from "./MobileTrendRadar";
import MobileTrendingCarousel from "./MobileTrendingCarousel";
import MobileUserHighlights from "./MobileUserHighlights";
import MobileWalletPanel from "./MobileWalletPanel";

interface MobileHomePageProps {
  trends: TrendSnapshot[];
}

export default function MobileHomePage({ trends }: MobileHomePageProps) {
  const carouselTrends = trends.slice(0, 6);

  return (
    <MobileDashboardLayout>
      <MobileHeroSection />
      <MobileStatsBar trends={trends} />
      <MobileTrendingCarousel trends={carouselTrends} />
      <MobileTrendRadar trends={trends} />
      <MobileTrendGrid trends={trends} />
      <MobileHowItWorks />
      <MobileWalletPanel />
      <MobileTrendLeaderboard trends={trends} />
      <MobileUserHighlights />
      <MobileNewsFeed />
      <MobileCommunityPulse />
      <MobilePricingGrid />
      <MobileFooter />
    </MobileDashboardLayout>
  );
}
