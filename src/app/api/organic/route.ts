import { getMedia, getMediaInsights } from "@/lib/instagram-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const media = await getMedia(limit);

    // Fetch insights for each media item (batch)
    const mediaWithInsights = await Promise.all(
      media.map(async (item) => {
        const insights = await getMediaInsights(item.id);
        const insightsMap: Record<string, number> = {};
        for (const insight of insights) {
          insightsMap[insight.name] = insight.values[0]?.value || 0;
        }
        return {
          ...item,
          insights: {
            impressions: insightsMap.impressions || 0,
            reach: insightsMap.reach || 0,
            saved: insightsMap.saved || 0,
            shares: insightsMap.shares || 0,
          },
        };
      })
    );

    return Response.json({ media: mediaWithInsights });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
