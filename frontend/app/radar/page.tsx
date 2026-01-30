import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RadarContent from "@/components/radar/RadarContent";
import MobileRadarPage from "@/components/mobile/radar/MobileRadarPage";
import { getLatestTrends } from "@/lib/trends";

export const revalidate = 300;

export default async function RadarPage() {
  const trends = await getLatestTrends(24);

  return (
    <>
      <div className="radar-page radar-desktop">
        <Navbar />
        <main className="dashboard__main">
          <RadarContent trends={trends} />
        </main>
        <Footer />
      </div>
      <div className="radar-mobile">
        <MobileRadarPage trends={trends} />
      </div>
    </>
  );
}
