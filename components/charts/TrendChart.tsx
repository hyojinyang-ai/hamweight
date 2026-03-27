// components/charts/TrendChart.tsx
"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight, formatDate } from "@/lib/utils";

interface TrendChartProps {
  days?: number;
  showCard?: boolean;
}

export function TrendChart({ days = 7, showCard = true }: TrendChartProps) {
  const getEntriesForDays = useStore((s) => s.getEntriesForDays);
  const profile = useStore((s) => s.profile);
  const entries = getEntriesForDays(days);
  const unit = profile?.unit ?? "metric";

  const data = useMemo(() => {
    // Group by date and get average per day
    const byDate = entries.reduce((acc, entry) => {
      const date = entry.timestamp.slice(0, 10);
      if (!acc[date]) {
        acc[date] = { weights: [], date };
      }
      acc[date].weights.push(entry.weight);
      return acc;
    }, {} as Record<string, { weights: number[]; date: string }>);

    return Object.values(byDate)
      .map((d) => ({
        date: d.date,
        weight: d.weights.reduce((a, b) => a + b, 0) / d.weights.length,
        displayDate: formatDate(d.date),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const chartContent = (
    <div className="h-40 w-full">
      {data.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              formatter={(value) => [
                formatWeight(Number(value), unit),
                "Weight",
              ]}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {data.length === 0
            ? "No data yet. Start logging!"
            : "Log more days to see trends"}
        </div>
      )}
    </div>
  );

  if (!showCard) return chartContent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Last {days} Days</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
