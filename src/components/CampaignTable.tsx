"use client";

import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  daily_budget_display?: number;
  budget_remaining_display?: number;
  estimated_spend_today?: number;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  ctr: string;
  cpc: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-success/10 text-success",
    PAUSED: "bg-warning/10 text-warning",
    DELETED: "bg-destructive/10 text-destructive",
    ARCHIVED: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Campaigns
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Campaign
              </th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                Budget
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                Spend
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                Impressions
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                Reach
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                Clicks
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                CTR
              </th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                CPC
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.map((c) => {
              const insightsSpend = parseFloat(c.spend);
              const estimatedSpend = c.estimated_spend_today || 0;
              const displaySpend = insightsSpend > 0 ? insightsSpend : estimatedSpend;
              const isEstimated = insightsSpend === 0 && estimatedSpend > 0;

              return (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-card-foreground">
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {c.daily_budget_display
                      ? `${formatCurrency(c.daily_budget_display)}/day`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    <span className={isEstimated ? "text-warning" : ""}>
                      {formatCurrency(displaySpend)}
                      {isEstimated && (
                        <span className="ml-1 text-xs text-warning">~est</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {formatNumber(parseInt(c.impressions, 10))}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {formatNumber(parseInt(c.reach, 10))}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {formatNumber(parseInt(c.clicks, 10))}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {formatPercent(parseFloat(c.ctr))}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {formatCurrency(parseFloat(c.cpc))}
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No campaigns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
