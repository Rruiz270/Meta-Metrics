import { getProfile, getAccountInsights } from "@/lib/instagram-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const [profile, insights] = await Promise.all([
      getProfile(),
      getAccountInsights("day", days),
    ]);

    // Transform insights into time-series or single-value data
    const insightsByMetric: Record<
      string,
      Array<{ date: string; value: number }>
    > = {};
    const totals: Record<string, number> = {};

    for (const metric of insights) {
      if (metric.values && metric.values.length > 0) {
        // Time-series metric
        insightsByMetric[metric.name] = metric.values.map((v) => ({
          date: v.end_time.split("T")[0],
          value: v.value,
        }));
      } else if (metric.total_value) {
        // Total-value metric (profile_views, accounts_engaged)
        totals[metric.name] = metric.total_value.value;
      }
    }

    return Response.json({
      profile,
      insights: insightsByMetric,
      totals,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
