const IG_BASE = "https://graph.facebook.com/v21.0";

function getIgToken() {
  return process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || "";
}

function getIgAccountId() {
  return process.env.IG_BUSINESS_ACCOUNT_ID || process.env.INSTAGRAM_ACCOUNT_ID || "";
}

async function igFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${IG_BASE}${path}`);
  url.searchParams.set("access_token", getIgToken());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Instagram API error ${res.status}: ${JSON.stringify(error)}`);
  }
  return res.json();
}

// ---- Types ----
export interface IgMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  permalink: string;
}

export interface IgMediaInsight {
  name: string;
  period: string;
  values: Array<{ value: number }>;
  title: string;
  id: string;
}

export interface IgProfile {
  id: string;
  name: string;
  username: string;
  followers_count: number;
  media_count: number;
  profile_picture_url?: string;
}

export interface IgAccountInsight {
  name: string;
  period: string;
  values: Array<{ value: number; end_time: string }>;
  title: string;
  id: string;
}

// ---- API Functions ----

export async function getProfile(): Promise<IgProfile> {
  const accountId = getIgAccountId();
  return igFetch<IgProfile>(`/${accountId}`, {
    fields: "name,username,followers_count,media_count,profile_picture_url",
  });
}

export async function getMedia(limit: number = 25): Promise<IgMedia[]> {
  const accountId = getIgAccountId();
  const res = await igFetch<{ data: IgMedia[] }>(`/${accountId}/media`, {
    fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
    limit: String(limit),
  });
  return res.data;
}

export async function getMediaInsights(
  mediaId: string
): Promise<IgMediaInsight[]> {
  try {
    const res = await igFetch<{ data: IgMediaInsight[] }>(
      `/${mediaId}/insights`,
      {
        metric: "impressions,reach,saved,shares",
      }
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function getAccountInsights(
  period: "day" | "week" | "days_28" = "day",
  days: number = 30
): Promise<IgAccountInsight[]> {
  const accountId = getIgAccountId();
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86400;

  const res = await igFetch<{ data: IgAccountInsight[] }>(
    `/${accountId}/insights`,
    {
      metric: "reach,follower_count,profile_views,accounts_engaged",
      period,
      since: String(since),
      until: String(until),
    }
  );
  return res.data;
}

export async function getFollowerDemographics(): Promise<IgAccountInsight[]> {
  const accountId = getIgAccountId();
  try {
    const res = await igFetch<{ data: IgAccountInsight[] }>(
      `/${accountId}/insights`,
      {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
      }
    );
    return res.data;
  } catch {
    return [];
  }
}
