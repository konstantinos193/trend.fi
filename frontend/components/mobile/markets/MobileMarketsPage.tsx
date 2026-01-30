import { TrendSnapshot } from "@/lib/trends";
import MobileDashboardLayout from "../MobileDashboardLayout";
import MobileFooter from "../MobileFooter";
import MobileMarketsHero from "./MobileMarketsHero";
import MobileMomentumTables from "./MobileMomentumTables";
import MobileNewsSection from "./MobileNewsSection";
import MobileRealTimeCharts from "./MobileRealTimeCharts";

interface MobileMarketsPageProps {
  trends: TrendSnapshot[];
}

export default function MobileMarketsPage({ trends }: MobileMarketsPageProps) {
  return (
    <MobileDashboardLayout>
      <MobileMarketsHero />
      <MobileRealTimeCharts trends={trends} />
      <MobileMomentumTables trends={trends} />
      <MobileNewsSection />
      <MobileFooter />
    </MobileDashboardLayout>
  );
}
