// app/history/page.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";
import { format } from "date-fns";
import { Trash2, Sunrise, Sun, CloudSun, Moon, Dumbbell, PersonStanding, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { useStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

export default function HistoryPage() {
  const entries = useStore((s) => s.entries);
  const profile = useStore((s) => s.profile);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const streak = useStore((s) => s.streak);

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  const timeIcons: Record<string, React.ReactNode> = {
    morning: <Sunrise className="inline h-3 w-3" />,
    lunch: <Sun className="inline h-3 w-3" />,
    afternoon: <CloudSun className="inline h-3 w-3" />,
    evening: <Moon className="inline h-3 w-3" />,
  };

  const exerciseIcons: Record<string, React.ReactNode> = {
    none: null,
    before: <Dumbbell className="inline h-3 w-3" />,
    after: <PersonStanding className="inline h-3 w-3" />,
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.history}</h1>
          <p className="text-sm font-bold text-foreground/50">{t.historySubtitle}</p>
        </div>
        <Image
          src="/icons/icon-192.png"
          alt="Huahuachi icon"
          width={64}
          height={64}
          className="h-16 w-16 scale-x-[-1] rounded-2xl object-contain"
          style={{ backgroundColor: "rgb(249, 247, 241)" }}
        />
      </header>


      <ActivityHeatmap mode="exercise" />

      {/* Entry List */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-black uppercase tracking-wider text-foreground/50">{t.allEntries}</h2>
        <div className="sticky top-2 z-10 bg-background pb-1">
          <Card className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 [border:var(--neo-border)]">
                <Flame className="h-5 w-5 text-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-black">{streak} {t.dayStreak}</div>
                <div className="text-xs font-bold text-foreground/50">
                  {lang === "ko" ? "현재 연속 기록" : "Current logging streak"}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-black [border:var(--neo-border)]">
              {sortedEntries.length} {t.entries}
            </div>
          </Card>
        </div>
        {sortedEntries.length === 0 ? (
          <Card className="p-6 text-center font-bold text-foreground/50">
            {t.noEntriesYet}
          </Card>
        ) : (
          sortedEntries.map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between p-3.5">
              <div>
                <div className="font-bold">
                  {formatWeight(entry.weight, unit)}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-foreground/50">
                  {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                  {" · "}
                  {timeIcons[entry.timeOfDay]}
                  {exerciseIcons[entry.exerciseContext] && (
                    <> {exerciseIcons[entry.exerciseContext]}</>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/40 hover:text-destructive"
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
