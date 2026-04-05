const META_BASE = "https://graph.facebook.com/v21.0";

function getToken() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN is not set");
  return token;
}

function getAdAccountId() {
  return process.env.AD_ACCOUNT_ID || "act_1322343969715932";
}

function getPageId() {
  return process.env.FACEBOOK_PAGE_ID || "1141691095686856";
}

async function metaFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${META_BASE}${path}`);
  url.searchParams.set("access_token", getToken());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Meta API error ${res.status}: ${JSON.stringify(error)}`
    );
  }
  return res.json();
}

// ---- Campaign Types ----
export interface Campaign {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  budget_remaining?: string;
  lifetime_budget?: string;
  objective?: string;
}

export interface CampaignInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

export interface CampaignsResponse {
  data: Campaign[];
  paging?: { cursors: { after: string }; next?: string };
}

export interface InsightsResponse {
  data: CampaignInsight[];
  paging?: { cursors: { after: string }; next?: string };
}

// ---- API Functions ----

export async function getCampaigns(): Promise<Campaign[]> {
  const adAccountId = getAdAccountId();
  const res = await metaFetch<CampaignsResponse>(
    `/${adAccountId}/campaigns`,
    {
      fields: "name,status,daily_budget,lifetime_budget,budget_remaining,objective",
      limit: "100",
    }
  );
  return res.data;
}

export async function getCampaignInsights(
  timeRange?: { since: string; until: string }
): Promise<CampaignInsight[]> {
  const adAccountId = getAdAccountId();
  const params: Record<string, string> = {
    fields: "campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpc,cpm,actions",
    level: "campaign",
    limit: "100",
  };
  if (timeRange) {
    params.time_range = JSON.stringify(timeRange);
  }
  const res = await metaFetch<InsightsResponse>(
    `/${adAccountId}/insights`,
    params
  );
  return res.data;
}

export async function getAccountInsights(
  timeRange?: { since: string; until: string }
): Promise<CampaignInsight[]> {
  const adAccountId = getAdAccountId();
  const params: Record<string, string> = {
    fields: "spend,impressions,reach,clicks,ctr,cpc,cpm,actions",
  };
  if (timeRange) {
    params.time_range = JSON.stringify(timeRange);
  }
  const res = await metaFetch<InsightsResponse>(
    `/${adAccountId}/insights`,
    params
  );
  return res.data;
}

export async function getDailySpend(
  days: number = 30
): Promise<CampaignInsight[]> {
  const adAccountId = getAdAccountId();
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const res = await metaFetch<InsightsResponse>(
    `/${adAccountId}/insights`,
    {
      fields: "spend,impressions,reach,clicks",
      time_range: JSON.stringify({
        since: since.toISOString().split("T")[0],
        until: until.toISOString().split("T")[0],
      }),
      time_increment: "1",
      limit: "100",
    }
  );
  return res.data;
}

export async function getPageInfo() {
  const pageId = getPageId();
  return metaFetch<{ id: string; name: string; followers_count: number }>(
    `/${pageId}`,
    { fields: "name,followers_count" }
  );
}

export async function checkTokenStatus(): Promise<{
  isValid: boolean;
  expiresAt?: string;
  scopes?: string[];
}> {
  try {
    const appId = process.env.META_APP_ID || "";
    const res = await metaFetch<{
      data: {
        is_valid: boolean;
        expires_at: number;
        scopes: string[];
      };
    }>(`/debug_token`, {
      input_token: getToken(),
      access_token: `${appId}|${process.env.META_APP_SECRET || ""}`,
    });
    return {
      isValid: res.data.is_valid,
      expiresAt: res.data.expires_at
        ? new Date(res.data.expires_at * 1000).toISOString()
        : undefined,
      scopes: res.data.scopes,
    };
  } catch {
    return { isValid: false };
  }
}
