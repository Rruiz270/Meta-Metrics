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

    // Transform insights into time-series data
    const insightsByMetric: Record<
      string,
      Array<{ date: string; value: number }>
    > = {};

    for (const metric of insights) {
      insightsByMetric[metric.name] = metric.values.map((v) => ({
        date: v.end_time.split("T")[0],
        value: v.value,
      }));
    }

    return Response.json({
      profile,
      insights: insightsByMetric,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
