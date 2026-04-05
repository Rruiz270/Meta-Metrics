"use client";

import { useEffect, useState } from "react";
import CampaignTable from "@/components/CampaignTable";
import SpendChart from "@/components/SpendChart";
import DateRangePicker from "@/components/DateRangePicker";
import KpiCard from "@/components/KpiCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { DollarSign, Eye, MousePointerClick, Target } from "lucide-react";

interface CampaignData {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
}

interface AdsResponse {
  campaigns: CampaignData[];
  dailySpend: Array<{
    date_start: string;
    spend: string;
    impressions: string;
    reach: string;
  }>;
}

export default function AdsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/ads?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Error Loading Ads Data
        </h2>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
      </div>
    );
  }

  const campaigns = data?.campaigns || [];
  const totalSpend = campaigns.reduce(
    (sum, c) => sum + parseFloat(c.spend),
    0
  );
  const totalImpressions = campaigns.reduce(
    (sum, c) => sum + parseInt(c.impressions, 10),
    0
  );
  const totalClicks = campaigns.reduce(
    (sum, c) => sum + parseInt(c.clicks, 10),
    0
  );
  const avgCtr =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Campaigns & Ads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ad performance across all campaigns
          </p>
        </div>
        <DateRangePicker
          selected={days}
          onChange={setDays}
          options={[7, 14, 30, 60]}
        />
      </div>

      {/* KPI Summary */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          title="Clicks"
          value={formatNumber(totalClicks)}
          icon={MousePointerClick}
        />
        <KpiCard
          title="Avg CTR"
          value={formatPercent(avgCtr)}
          icon={Target}
        />
      </div>

      {/* Daily Spend Chart */}
      {data?.dailySpend && data.dailySpend.length > 0 && (
        <div className="mb-8">
          <SpendChart data={data.dailySpend} title={`Daily Spend (Last ${days} days)`} />
        </div>
      )}

      {/* Campaigns Table */}
      <CampaignTable campaigns={campaigns} />
    </div>
  );
}
