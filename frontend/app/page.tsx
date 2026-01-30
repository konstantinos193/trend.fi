import ResponsiveHomePage from "@/components/home/ResponsiveHomePage";
import { getLatestTrends } from "@/lib/trends";

export const revalidate = 300;

export default async function HomePage() {
  const trends = await getLatestTrends(12);

  return (
    <ResponsiveHomePage trends={trends} />
  );
}
