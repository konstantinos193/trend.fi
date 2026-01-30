import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MobileWalletPage from "@/components/mobile/wallet/MobileWalletPage";
import WalletContent from "@/components/wallet/WalletContent";

export default function WalletPage() {
  return (
    <>
      <div className="wallet-page wallet-desktop">
        <Navbar />
        <main className="dashboard__main">
          <WalletContent />
        </main>
        <Footer />
      </div>
      <div className="wallet-mobile">
        <MobileWalletPage />
      </div>
    </>
  );
}
