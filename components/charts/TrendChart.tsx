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
import { getTranslations } from "@/lib/i18n";

interface TrendChartProps {
  days?: number;
  showCard?: boolean;
}

export function TrendChart({ days = 7, showCard = true }: TrendChartProps) {
  const getEntriesForDays = useStore((s) => s.getEntriesForDays);
  const profile = useStore((s) => s.profile);
  const entries = getEntriesForDays(days);
  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

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
              tick={{ fontSize: 10, fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 10, fontWeight: 700 }}
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
                border: "2.5px solid hsl(var(--border))",
                borderRadius: "12px",
                fontWeight: 700,
                boxShadow: "3px 3px 0px 0px hsl(var(--border))",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2.5, stroke: "hsl(var(--border))", r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2.5, stroke: "hsl(var(--border))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm font-bold text-foreground/60">
          {data.length === 0
            ? t.noDataYet
            : t.logMoreDays}
        </div>
      )}
    </div>
  );

  if (!showCard) return chartContent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-black uppercase tracking-wider">{t.lastDays(days)}</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
