import { ReactNode } from "react";
import MobileNavbar from "./MobileNavbar";

interface MobileDashboardLayoutProps {
  children: ReactNode;
}

export default function MobileDashboardLayout({ children }: MobileDashboardLayoutProps) {
  return (
    <div className="mobile-shell">
      <MobileNavbar />
      <main className="mobile-main">{children}</main>
    </div>
  );
}
