"use client";

import { PLATFORM_CHART_COLORS, PLATFORM_LABELS } from "@/lib/chart-config";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  type TooltipContentProps,
} from "recharts";

interface PlatformDataPoint {
  platform: string;
  count: number;
}

interface PlatformChartProps {
  data: PlatformDataPoint[];
}

//
function CustomTooltip({
  active,
  payload,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  if (!item) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-popover-foreground">
        {PLATFORM_LABELS[item.name ?? ""] ?? item.name}
      </p>
      <p className="text-sm text-muted-foreground">
        {item.value} post{(item.value as number) !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function PlatformChart({ data }: PlatformChartProps) {
  if (data.length === 0) {
    return (
      <div className=" flex h-70 items-center justify-center">
        <div className=" text-sm text-muted-foreground">No posts yet</div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.platform,
    value: d.count,
  }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <PieChart
        // responsive prop (Recharts 3.3+) — React 19 safe alternative
        // to ResponsiveContainer. Uses CSS sizing, not displayName check.
        responsive
        width={400} // Fallback width if responsive prop fails (never shown)
        height={280}
      >
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          animationDuration={600}
          animationBegin={0}
          // In v3, stroke="none" replaces the removed blendStroke prop
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={PLATFORM_CHART_COLORS[entry.name] ?? "#6b7280"}
            />
          ))}
        </Pie>

        {/* accessibilityLayer is ON by default in v3 — do not add it manually */}

        <Tooltip content={<CustomTooltip />} />

        <Legend
          formatter={(value: string) => PLATFORM_LABELS[value] ?? value}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px" }}
        />
      </PieChart>
    </div>
  );
}
