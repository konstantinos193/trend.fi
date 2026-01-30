import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LeaderboardContent from "@/components/leaderboard/LeaderboardContent";
import MobileLeaderboardPage from "@/components/mobile/leaderboard/MobileLeaderboardPage";
import { getLatestTrends } from "@/lib/trends";

export const revalidate = 300;

export default async function LeaderboardPage() {
  const trends = await getLatestTrends(24);

  return (
    <>
      <div className="leaderboard-shell leaderboard-desktop">
        <Navbar />
        <main className="dashboard__main">
          <LeaderboardContent trends={trends} />
        </main>
        <Footer />
      </div>
      <div className="leaderboard-mobile">
        <MobileLeaderboardPage trends={trends} />
      </div>
    </>
  );
}
