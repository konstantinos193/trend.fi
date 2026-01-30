import MobileDashboardLayout from "../MobileDashboardLayout";
import MobileFooter from "../MobileFooter";
import MobileWalletPanel from "../MobileWalletPanel";
import MobileOnchainOverview from "./MobileOnchainOverview";

export default function MobileWalletPage() {
  return (
    <MobileDashboardLayout>
      <MobileWalletPanel />
      <MobileOnchainOverview />
      <MobileFooter />
    </MobileDashboardLayout>
  );
}
