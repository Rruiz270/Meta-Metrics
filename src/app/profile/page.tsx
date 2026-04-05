"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/KpiCard";
import FollowerChart from "@/components/FollowerChart";
import DateRangePicker from "@/components/DateRangePicker";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatNumber } from "@/lib/utils";
import { Users, Eye, UserPlus, ImageIcon } from "lucide-react";

interface ProfileResponse {
  profile: {
    id: string;
    name: string;
    username: string;
    followers_count: number;
    media_count: number;
  };
  insights: Record<string, Array<{ date: string; value: number }>>;
  totals: Record<string, number>;
}

export default function ProfilePage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/profile?days=${days}`)
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
          Error Loading Profile
        </h2>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
      </div>
    );
  }

  const profile = data?.profile;
  const insights = data?.insights || {};
  const totals = data?.totals || {};

  // Time-series totals
  const totalReach =
    insights.reach?.reduce((sum, d) => sum + d.value, 0) || 0;

  // Single-value totals from API
  const totalProfileViews = totals.profile_views || 0;
  const totalEngaged = totals.accounts_engaged || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Growth</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            @{profile?.username || "institutoi10"} - {profile?.name}
          </p>
        </div>
        <DateRangePicker
          selected={days}
          onChange={setDays}
          options={[7, 14, 30, 60, 90]}
        />
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Followers"
          value={formatNumber(profile?.followers_count || 0)}
          icon={Users}
        />
        <KpiCard
          title="Total Posts"
          value={formatNumber(profile?.media_count || 0)}
          icon={ImageIcon}
        />
        <KpiCard
          title="Profile Views"
          value={formatNumber(totalProfileViews)}
          icon={UserPlus}
        />
        <KpiCard
          title="Accounts Engaged"
          value={formatNumber(totalEngaged)}
          icon={Eye}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {insights.reach && insights.reach.length > 0 && (
          <FollowerChart
            data={insights.reach}
            title="Daily Reach"
            color="#3b82f6"
            dataLabel="Reach"
          />
        )}

        {insights.follower_count && insights.follower_count.length > 0 && (
          <FollowerChart
            data={insights.follower_count}
            title="Follower Count"
            color="#22c55e"
            dataLabel="Followers"
          />
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          Period Summary ({days} days)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Reach</p>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              {formatNumber(totalReach)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Profile Views</p>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              {formatNumber(totalProfileViews)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Accounts Engaged</p>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              {formatNumber(totalEngaged)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
