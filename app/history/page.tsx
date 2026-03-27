// app/history/page.tsx
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hamster } from "@/components/hamster/Hamster";
import { TrendChart } from "@/components/charts/TrendChart";
import { useStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";

export default function HistoryPage() {
  const entries = useStore((s) => s.entries);
  const profile = useStore((s) => s.profile);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  const unit = profile?.unit ?? "metric";

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  const timeEmoji: Record<string, string> = {
    morning: "🌅",
    lunch: "🌞",
    afternoon: "🌤️",
    evening: "🌙",
  };

  const exerciseEmoji: Record<string, string> = {
    none: "",
    before: "💪",
    after: "🏃",
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">Your weight journey</p>
        </div>
        <Hamster expression="checkingHealth" size="sm" />
      </header>

      {/* Time Range Toggle */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === 7 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === 30 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(30)}
        >
          30 Days
        </Button>
      </div>

      {/* Chart */}
      <TrendChart days={timeRange} />

      {/* Entry List */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">All Entries</h2>
        {sortedEntries.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No entries yet. Start logging!
          </Card>
        ) : (
          sortedEntries.map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">
                  {formatWeight(entry.weight, unit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                  {" · "}
                  {timeEmoji[entry.timeOfDay]}
                  {exerciseEmoji[entry.exerciseContext] && (
                    <> {exerciseEmoji[entry.exerciseContext]}</>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteEntry(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
