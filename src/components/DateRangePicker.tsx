"use client";

import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  selected: number;
  onChange: (days: number) => void;
  options?: number[];
}

export default function DateRangePicker({
  selected,
  onChange,
  options = [7, 14, 30],
}: DateRangePickerProps) {
  const labels: Record<number, string> = {
    7: "7 days",
    14: "14 days",
    30: "30 days",
    60: "60 days",
    90: "90 days",
  };

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {options.map((days) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            selected === days
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-card-foreground"
          )}
        >
          {labels[days] || `${days}d`}
        </button>
      ))}
    </div>
  );
}
