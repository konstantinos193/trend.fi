"use client";

import { useEffect, useState } from "react";
import MobileHomePage from "@/components/mobile/MobileHomePage";
import DesktopHomePageContent from "@/components/home/DesktopHomePageContent";
import { TrendSnapshot } from "@/lib/trends";

const MOBILE_QUERY = "(max-width: 1024px)";

interface ResponsiveHomePageProps {
  trends: TrendSnapshot[];
}

export default function ResponsiveHomePage({ trends }: ResponsiveHomePageProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isMobile ? <MobileHomePage trends={trends} /> : <DesktopHomePageContent trends={trends} />;
}
