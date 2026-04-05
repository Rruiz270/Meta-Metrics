"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/KpiCard";
import SpendChart from "@/components/SpendChart";
import DateRangePicker from "@/components/DateRangePicker";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Megaphone,
} from "lucide-react";

interface AdsData {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    spend: string;
    impressions: string;
    reach: string;
    clicks: string;
  }>;
  dailySpend: Array<{
    date_start: string;
    spend: string;
    impressions: string;
    reach: string;
  }>;
}

interface ProfileData {
  profile: {
    followers_count: number;
    media_count: number;
    name: string;
    username: string;
  };
}

export default function OverviewPage() {
  const [days, setDays] = useState(30);
  const [adsData, setAdsData] = useState<AdsData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/ads?days=${days}`).then((r) => r.json()),
      fetch(`/api/profile?days=${days}`).then((r) => r.json()),
    ])
      .then(([ads, profile]) => {
        if (ads.error) throw new Error(ads.error);
        if (profile.error) throw new Error(profile.error);
        setAdsData(ads);
        setProfileData(profile);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Error Loading Data
        </h2>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Make sure your Meta API tokens are configured in your environment
          variables.
        </p>
      </div>
    );
  }

  // Aggregate totals
  const totalSpend =
    adsData?.campaigns.reduce((sum, c) => sum + parseFloat(c.spend), 0) || 0;
  const totalImpressions =
    adsData?.campaigns.reduce(
      (sum, c) => sum + parseInt(c.impressions, 10),
      0
    ) || 0;
  const totalReach =
    adsData?.campaigns.reduce((sum, c) => sum + parseInt(c.reach, 10), 0) || 0;
  const totalClicks =
    adsData?.campaigns.reduce((sum, c) => sum + parseInt(c.clicks, 10), 0) || 0;
  const activeCampaigns =
    adsData?.campaigns.filter((c) => c.status === "ACTIVE").length || 0;
  const followers = profileData?.profile.followers_count || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            @{profileData?.profile.username || "institutoi10"} dashboard
          </p>
        </div>
        <DateRangePicker selected={days} onChange={setDays} />
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Followers"
          value={formatNumber(followers)}
          icon={Users}
        />
        <KpiCard
          title="Total Spend"
          value={formatCurrency(totalSpend)}
          icon={DollarSign}
        />
        <KpiCard
          title="Impressions"
          value={formatNumber(totalImpressions)}
          icon={Eye}
        />
        <KpiCard
          title="Reach"
          value={formatNumber(totalReach)}
          icon={Eye}
        />
        <KpiCard
          title="Clicks"
          value={formatNumber(totalClicks)}
          icon={MousePointerClick}
        />
        <KpiCard
          title="Active Campaigns"
          value={String(activeCampaigns)}
          icon={Megaphone}
        />
      </div>

      {/* Spend Chart */}
      {adsData?.dailySpend && adsData.dailySpend.length > 0 && (
        <SpendChart data={adsData.dailySpend} title="Daily Ad Spend" />
      )}

      {/* Active Campaigns Summary */}
      {adsData?.campaigns && adsData.campaigns.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-card-foreground">
            Active Campaigns
          </h3>
          <div className="space-y-3">
            {adsData.campaigns
              .filter((c) => c.status === "ACTIVE")
              .slice(0, 5)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                  <span className="font-medium text-card-foreground">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Spend: {formatCurrency(parseFloat(c.spend))}</span>
                    <span>
                      Reach: {formatNumber(parseInt(c.reach, 10))}
                    </span>
                    <span>
                      Clicks: {formatNumber(parseInt(c.clicks, 10))}
                    </span>
                  </div>
                </div>
              ))}
            {activeCampaigns === 0 && (
              <p className="text-sm text-muted-foreground">
                No active campaigns
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
