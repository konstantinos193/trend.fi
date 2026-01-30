import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileDashboardLayout from "@/components/mobile/MobileDashboardLayout";
import MobileFooter from "@/components/mobile/MobileFooter";

export default function NotFound() {
  return (
    <>
      <div className="notfound-desktop">
        <Navbar />
        <main className="notfound-shell">
          <section className="notfound-card">
            <p className="notfound-eyebrow">Signal Lost</p>
            <h1 className="notfound-title">404 — Page not found</h1>
            <p className="notfound-subtitle">
              The trend you are searching for has slipped off the radar. Head back to
              the main feed or explore what is moving now.
            </p>
            <div className="notfound-actions">
              <Link href="/" className="btn-primary">
                Return home
              </Link>
              <Link href="/markets" className="btn-secondary">
                View markets
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <div className="notfound-mobile">
        <MobileDashboardLayout>
          <section className="notfound-card notfound-card--mobile">
            <p className="notfound-eyebrow">Signal Lost</p>
            <h1 className="notfound-title">404</h1>
            <p className="notfound-subtitle">
              This page is not on the radar. Jump back to the feed and keep trading
              attention.
            </p>
            <div className="notfound-actions">
              <Link href="/" className="btn-primary">
                Return home
              </Link>
              <Link href="/markets" className="btn-secondary">
                View markets
              </Link>
            </div>
          </section>
          <MobileFooter />
        </MobileDashboardLayout>
      </div>
    </>
  );
}
