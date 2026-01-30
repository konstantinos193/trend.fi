import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NewsFeed from "@/components/NewsFeed";
import MobileDashboardLayout from "@/components/mobile/MobileDashboardLayout";
import MobileFooter from "@/components/mobile/MobileFooter";
import MobileNewsFeed from "@/components/mobile/MobileNewsFeed";

export default function NewsPage() {
  return (
    <>
      <div className="news-page news-desktop">
        <Navbar />
        <main className="dashboard__main">
          <div className="dashboard__content">
            <NewsFeed />
          </div>
        </main>
        <Footer />
      </div>
      <div className="news-mobile">
        <MobileDashboardLayout>
          <MobileNewsFeed />
          <MobileFooter />
        </MobileDashboardLayout>
      </div>
    </>
  );
}
