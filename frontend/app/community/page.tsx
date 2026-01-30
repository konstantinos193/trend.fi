import CommunityPulse from "@/components/CommunityPulse";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MobileCommunityPulse from "@/components/mobile/MobileCommunityPulse";
import MobileDashboardLayout from "@/components/mobile/MobileDashboardLayout";
import MobileFooter from "@/components/mobile/MobileFooter";

export default function CommunityPage() {
  return (
    <>
      <div className="community-page community-desktop">
        <Navbar />
        <main className="dashboard__main">
          <div className="dashboard__content">
            <CommunityPulse />
          </div>
        </main>
        <Footer />
      </div>
      <div className="community-mobile">
        <MobileDashboardLayout>
          <MobileCommunityPulse />
          <MobileFooter />
        </MobileDashboardLayout>
      </div>
    </>
  );
}
