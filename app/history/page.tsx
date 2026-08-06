// app/history/page.tsx
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Trash2, Sunrise, Sun, CloudSun, Moon, Dumbbell, PersonStanding, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { WeightChangeChart } from "@/components/charts/WeightChangeChart";
import { WeightChangeBadge } from "@/components/weight/WeightChangeBadge";
import { useStore } from "@/lib/store";
import { formatWeight, getWeightChangeByEntryId } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

function safeFormatDate(timestamp: string, fmt: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "—";
    return format(date, fmt);
  } catch {
    return "—";
  }
}

export default function HistoryPage() {
  const entries = useStore((s) => s.entries);
  const profile = useStore((s) => s.profile);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const streak = useStore((s) => s.streak);

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);
  const entryChanges = useMemo(() => getWeightChangeByEntryId(entries), [entries]);

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

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteEntry(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-black tracking-tight">{t.history}</h1>
        <p className="text-sm font-bold text-foreground/50">{t.historySubtitle}</p>
      </header>


      <WeightChangeChart />

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
                <div className="text-sm font-black">
                  {streak > 0 ? `${streak} ${t.dayStreak}` : t.freshStart}
                </div>
                <div className="text-xs font-bold text-foreground/50">
                  {streak > 0 ? t.currentStreak : t.streakBroken}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-black">
              {sortedEntries.length} {t.entries}
            </div>
          </Card>
        </div>
        {sortedEntries.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="font-black text-foreground/60">{t.noEntriesYet}</div>
            <div className="mt-1.5 text-sm font-bold text-foreground/40">{t.noEntriesEncouragement}</div>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="divide-y-[2.5px] divide-foreground/10">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black">{formatWeight(entry.weight, unit)}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-foreground/50">
                        {safeFormatDate(entry.timestamp, "MMM d, yyyy h:mm a")}
                        {" · "}
                        {timeIcons[entry.timeOfDay]}
                        {exerciseIcons[entry.exerciseContext] && (
                          <> {exerciseIcons[entry.exerciseContext]}</>
                        )}
                      </span>
                    </div>
                    <WeightChangeBadge
                      deltaKg={entryChanges.get(entry.id)}
                      unit={unit}
                      language={lang}
                      showFirstLog
                      variant="plain"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 justify-self-end text-foreground/40 hover:text-destructive"
                    onClick={() => setDeleteTarget(entry.id)}
                    aria-label={t.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-[20rem]">
          <DialogHeader>
            <DialogTitle className="text-base font-black">{t.deleteConfirmTitle}</DialogTitle>
            <DialogDescription className="text-sm">
              {t.deleteConfirmDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmDelete}
            >
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
