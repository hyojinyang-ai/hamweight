"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

const MAX_VISIBLE = 14;

interface ChartPoint {
  id: string;
  weightKg: number;
  prevWeightKg: number | null;
  displayDate: string;
  fullDate: string;
}

function CustomLabel({ x, y, width, value, unit }: { x?: number; y?: number; width?: number; value?: number; unit: "metric" | "imperial" }) {
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof value !== "number") return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
      fill="hsl(var(--muted-foreground))"
    >
      {formatWeight(value, unit).split(" ")[0]}
    </text>
  );
}

export function WeightChangeChart() {
  const entries = useStore((s) => s.entries);
  const profile = useStore((s) => s.profile);

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  const data = useMemo<ChartPoint[]>(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted
      .map((entry, i) => ({
        id: entry.id,
        weightKg: entry.weight,
        prevWeightKg: i > 0 ? sorted[i - 1].weight : null,
        displayDate: format(new Date(entry.timestamp), "M/d"),
        fullDate: format(new Date(entry.timestamp), "MMM d, yyyy h:mm a"),
      }))
      .slice(-MAX_VISIBLE);
  }, [entries]);

  const weightDomain = useMemo<[number, number]>(() => {
    if (data.length === 0) return [0, 80];
    const weights = data.map((p) => p.weightKg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 2;
    return [
      Math.floor((min - range * 0.4) * 10) / 10,
      Math.ceil((max + range * 0.3) * 10) / 10,
    ];
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black uppercase tracking-wider">
          {t.weightChangeChart}
        </CardTitle>
        <p className="mt-0.5 text-xs font-bold text-foreground/50">
          {data.length > 0 ? t.lastChanges(data.length) : t.weightChangeChartSubtitle}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-52 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 4, bottom: 0, left: -16 }}
                barCategoryGap="25%"
              >
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--muted))"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={weightDomain}
                  tickFormatter={(v) => formatWeight(Number(v), unit).split(" ")[0]}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />

                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0]?.payload as ChartPoint;
                    if (!point) return null;
                    return (
                      <div className="rounded-xl bg-card px-3 py-2 text-xs font-bold [border:var(--neo-border)] [box-shadow:var(--neo-shadow-sm)]">
                        <div className="mb-1 text-[10px] text-foreground/50">{point.fullDate}</div>
                        <div className="text-sm font-black">{formatWeight(point.weightKg, unit)}</div>
                      </div>
                    );
                  }}
                />

                {/* Single bar per log */}
                <Bar
                  dataKey="weightKg"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                >
                  <LabelList
                    dataKey="weightKg"
                    content={(props) => <CustomLabel {...props as { x?: number; y?: number; width?: number; value?: number }} unit={unit} />}
                  />
                  {data.map((point) => {
                    const increased = point.prevWeightKg !== null && point.weightKg > point.prevWeightKg;
                    const decreased = point.prevWeightKg !== null && point.weightKg < point.prevWeightKg;
                    return (
                      <Cell
                        key={point.id}
                        fill={
                          increased
                            ? "hsl(var(--warning))"
                            : decreased
                              ? "hsl(var(--success))"
                              : "hsl(var(--primary))"
                        }
                        opacity={0.85}
                      />
                    );
                  })}
                </Bar>

                {/* Trend line showing increase/decrease */}
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2.5}
                  dot={{
                    fill: "hsl(var(--foreground))",
                    stroke: "hsl(var(--card))",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--card))",
                    strokeWidth: 2.5,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-muted/50 px-4 text-center text-sm font-bold text-foreground/55 [border:var(--neo-border)]">
              {t.noChangesYet}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
