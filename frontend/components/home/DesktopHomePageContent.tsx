"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CommunityPulse from "@/components/CommunityPulse";
import HowItWorks from "@/components/HowItWorks";
import NewsFeed from "@/components/NewsFeed";
import PricingGrid from "@/components/PricingGrid";
import TrendGrid from "@/components/TrendGrid";
import TrendLeaderboard from "@/components/TrendLeaderboard";
import TrendRadar from "@/components/TrendRadar";
import TrendingCarousel from "@/components/TrendingCarousel";
import WalletPanel from "@/components/wallet/WalletPanel";
import UserHighlights from "@/components/UserHighlights";
import StatsBar from "@/components/StatsBar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { TrendSnapshot } from "@/lib/trends";

interface DesktopHomePageContentProps {
  trends: TrendSnapshot[];
}

export default function DesktopHomePageContent({ trends }: DesktopHomePageContentProps) {
  const carouselTrends = trends.slice(0, 6);

  return (
    <DashboardLayout>
      <HeroSection />
      {/* Stats Bar - Quick metrics at top */}
      <StatsBar trends={trends} />

      {/* Main Dashboard Grid - 2 column layout */}
      <div className="dashboard__grid">
        {/* Left Column - Main content */}
        <div className="dashboard__col dashboard__col--main">
          {/* Trending Carousel */}
          <section id="trending" className="dash-card animate-in">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Trending Now</h2>
                <p className="dash-card__subtitle">Hot topics with rising momentum</p>
              </div>
              <span className="live-mark">Updated 5m</span>
            </div>
            <TrendingCarousel trends={carouselTrends} />
          </section>

          {/* Live Radar */}
          <section id="radar" className="dash-card animate-in delay-1">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Live Radar</h2>
                <p className="dash-card__subtitle">Signal strength by region, updated every 5 min</p>
              </div>
              <span className="small-badge">updated 5m</span>
            </div>
            <TrendRadar trends={trends} />
          </section>

          {/* Momentum Stream */}
          <section id="markets" className="dash-card animate-in delay-2">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Momentum Stream</h2>
                <p className="dash-card__subtitle">All active trends sorted by recency</p>
              </div>
              <span className="small-badge">stream</span>
            </div>
            <TrendGrid
              trends={trends.map((trend) => ({
                topic: trend.topic,
                momentum: trend.momentum,
                raw_score: trend.raw_score,
                velocity: trend.velocity,
                region: trend.region,
                timestamp: trend.timestamp,
              }))}
            />
          </section>

          {/* How It Works */}
          <HowItWorks />
        </div>

        {/* Right Column - Sidebar content */}
        <div className="dashboard__col dashboard__col--aside">
          {/* Wallet Panel */}
          <section id="wallet" className="dash-card animate-in">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Wallet</h2>
                <p className="dash-card__subtitle">Connect to trade</p>
              </div>
              <span className="small-badge">Phantom</span>
            </div>
            <WalletPanel />
          </section>

          {/* Leaderboard */}
          <section id="leaderboard" className="dash-card animate-in delay-1">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Leaderboard</h2>
                <p className="dash-card__subtitle">Top breakout candidates</p>
              </div>
              <span className="small-badge">alpha</span>
            </div>
            <TrendLeaderboard trends={trends} />
          </section>

          {/* User Highlights */}
          <UserHighlights />

          {/* News Feed */}
          <NewsFeed />

          {/* Community Pulse */}
          <CommunityPulse />
        </div>
      </div>

      {/* Pricing Section - Full width */}
      <PricingGrid />

      {/* Footer */}
      <Footer />
    </DashboardLayout>
  );
}
