import { getCampaigns, getCampaignInsights, getDailySpend } from "@/lib/meta-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = searchParams.get("since");
    const until = searchParams.get("until");

    const timeRange =
      since && until
        ? { since, until }
        : (() => {
            const u = new Date();
            const s = new Date();
            s.setDate(s.getDate() - days);
            return {
              since: s.toISOString().split("T")[0],
              until: u.toISOString().split("T")[0],
            };
          })();

    const [campaigns, insights, dailySpend] = await Promise.all([
      getCampaigns(),
      getCampaignInsights(timeRange),
      getDailySpend(days),
    ]);

    // Merge campaign info with insights
    const insightsMap = new Map(
      insights.map((i) => [i.campaign_id, i])
    );

    const merged = campaigns.map((c) => {
      const insight = insightsMap.get(c.id);
      return {
        ...c,
        spend: insight?.spend || "0",
        impressions: insight?.impressions || "0",
        reach: insight?.reach || "0",
        clicks: insight?.clicks || "0",
        ctr: insight?.ctr || "0",
        cpc: insight?.cpc || "0",
        cpm: insight?.cpm || "0",
        actions: insight?.actions || [],
      };
    });

    return Response.json({
      campaigns: merged,
      dailySpend,
      timeRange,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
