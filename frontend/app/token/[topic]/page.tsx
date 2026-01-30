import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TokenContent from "@/components/token/TokenContent";
import MobileTokenPage from "@/components/mobile/token/MobileTokenPage";
import { getLatestTrends, getTrendByTopic } from "@/lib/trends";
import { notFound } from "next/navigation";

export const revalidate = 300;

interface TokenPageProps {
  params: {
    topic: string;
  };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const rawTopic = params?.topic;

  if (!rawTopic) {
    notFound();
  }

  const topic = decodeURIComponent(rawTopic.replace(/\+/g, " "));
  const [trend, trends] = await Promise.all([
    getTrendByTopic(topic),
    getLatestTrends(18),
  ]);

  if (!trend) {
    notFound();
  }

  return (
    <>
      <div className="token-page token-desktop">
        <Navbar />
        <main className="dashboard__main">
          <TokenContent trend={trend} trends={trends} />
        </main>
        <Footer />
      </div>
      <div className="token-mobile">
        <MobileTokenPage trend={trend} trends={trends} />
      </div>
    </>
  );
}
