import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MarketsContent from "@/components/markets/MarketsContent";
import MobileMarketsPage from "@/components/mobile/markets/MobileMarketsPage";
import { getLatestTrends } from "@/lib/trends";

export const revalidate = 300;

export default async function MarketsPage() {
  const trends = await getLatestTrends(24);

  return (
    <>
      <div className="markets-page markets-desktop">
        <Navbar />
        <main className="dashboard__main">
          <MarketsContent trends={trends} />
        </main>
        <Footer />
      </div>
      <div className="markets-mobile">
        <MobileMarketsPage trends={trends} />
      </div>
    </>
  );
}
