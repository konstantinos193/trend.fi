import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getLatestTrends } from "@/lib/trends";
import { getTrendHref } from "@/lib/trendRouting";

const staticRoutes = ["/", "/markets", "/radar", "/leaderboard", "/wallet", "/community", "/news"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "hourly" : "daily",
    priority: route === "/" ? 1 : 0.8,
  }));

  const trends = await getLatestTrends(50);
  const trendEntries: MetadataRoute.Sitemap = trends.map((trend) => ({
    url: `${siteConfig.url}${getTrendHref(trend.topic)}`,
    lastModified: trend.timestamp ? new Date(trend.timestamp) : now,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  return [...staticEntries, ...trendEntries];
}
