"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  type TooltipContentProps,
} from "recharts";
import { STATUS_CHART_COLORS, STATUS_LABELS } from "@/lib/chart-config";

interface StatusDataPoint {
  status: string;
  count: number;
}

interface StatusChartProps {
  data: StatusDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-popover-foreground">
        {STATUS_LABELS[label as string] ?? label}
      </p>
      <p className="text-sm text-muted-foreground">
        {payload[0]?.value} post{(payload[0]?.value as number) !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function StatusChart({ data }: StatusChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    status: d.status,
    label: STATUS_LABELS[d.status] ?? d.status,
    count: d.count,
  }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <BarChart
        responsive
        width={400}
        height={280}
        data={chartData}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        barSize={32}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--color-border)"
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--color-accent)", radius: 4 }}
        />

        <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={600}>
          {chartData.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_CHART_COLORS[entry.status] ?? "#6b7280"}
            />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}
