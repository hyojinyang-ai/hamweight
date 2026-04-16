// app/goals/page.tsx
"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Target, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { formatWeight, lbToKg } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const profile = useStore((s) => s.profile);
  const goal = useStore((s) => s.goal);
  const setGoal = useStore((s) => s.setGoal);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalType, setGoalType] = useState<Goal["type"]>("lose");
  const [targetWeight, setTargetWeight] = useState("");
  const [deadline, setDeadline] = useState("");

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);
  const latestEntry = getLatestEntry();
  const currentWeight = latestEntry?.weight ?? 70;

  const handleCreateGoal = () => {
    const targetNum = parseFloat(targetWeight);
    if (isNaN(targetNum)) return;

    const targetKg = unit === "imperial" ? lbToKg(targetNum) : targetNum;

    setGoal({
      type: goalType,
      targetWeight: targetKg,
      deadline: deadline || undefined,
      startWeight: currentWeight,
      startDate: new Date().toISOString(),
    });

    setDialogOpen(false);
    setTargetWeight("");
    setDeadline("");
  };

  const getProgress = () => {
    if (!goal) return 0;
    const totalChange = Math.abs(goal.startWeight - goal.targetWeight);
    const currentChange = Math.abs(goal.startWeight - currentWeight);

    if (goal.type === "maintain") {
      const deviation = Math.abs(currentWeight - goal.targetWeight);
      return Math.max(0, 100 - deviation * 20);
    }

    return Math.min(100, (currentChange / totalChange) * 100);
  };

  const getGoalIcon = () => {
    if (!goal) return <Target className="h-5 w-5" />;
    if (goal.type === "lose") return <TrendingDown className="h-5 w-5 text-success" />;
    if (goal.type === "gain") return <TrendingUp className="h-5 w-5 text-warning" />;
    return <Minus className="h-5 w-5 text-foreground/50" />;
  };

  const progress = getProgress();
  const isGoalAchieved = goal && progress >= 100;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.goals}</h1>
          <p className="text-sm font-bold text-foreground/50">{t.goalsSubtitle}</p>
        </div>
        <img
          src="/icons/icon-192.png"
          alt="Huahuachi icon"
          className="h-16 w-16 scale-x-[-1] rounded-2xl object-contain" style={{ backgroundColor: "rgb(249, 247, 241)" }}
        />
      </header>


      {goal ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                {getGoalIcon()}
                {goal.type === "lose" && t.loseWeight}
                {goal.type === "gain" && t.gainWeight}
                {goal.type === "maintain" && t.maintainWeight}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGoal(null)}
              >
                {t.clear}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-bold">{t.progress}</span>
                <span className="font-black">{Math.round(progress)}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-lg bg-muted [border:var(--neo-border)]">
                <div
                  className="h-full rounded-lg bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3 [border:var(--neo-border)]">
                <div className="font-bold text-foreground/50">{t.current}</div>
                <div className="text-lg font-black">
                  {formatWeight(currentWeight, unit)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 [border:var(--neo-border)]">
                <div className="font-bold text-foreground/50">{t.target}</div>
                <div className="text-lg font-black">
                  {formatWeight(goal.targetWeight, unit)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 [border:var(--neo-border)]">
                <div className="font-bold text-foreground/50">{t.started}</div>
                <div className="font-bold">
                  {format(new Date(goal.startDate), "MMM d")}
                </div>
              </div>
              {goal.deadline && (
                <div className="rounded-lg bg-muted/50 p-3 [border:var(--neo-border)]">
                  <div className="font-bold text-foreground/50">{t.deadline}</div>
                  <div className="font-bold">
                    {format(new Date(goal.deadline), "MMM d")}
                    <span className="ml-1 text-xs text-foreground/50">
                      ({differenceInDays(new Date(goal.deadline), new Date())}{lang === "ko" ? "일" : "d"})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isGoalAchieved && (
              <div className="rounded-xl bg-success/20 p-4 text-center font-black text-success [border:var(--neo-border)]">
                {t.goalAchieved}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="font-bold text-foreground/50">{t.noGoalYet}</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">{t.setGoal}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-black">{t.setYourGoal}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t.goalType}</Label>
                  <Select
                    value={goalType}
                    onValueChange={(v) => setGoalType(v as Goal["type"])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">{t.loseWeight}</SelectItem>
                      <SelectItem value="gain">{t.gainWeight}</SelectItem>
                      <SelectItem value="maintain">{t.maintainWeight}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t.targetWeight}</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder={formatWeight(currentWeight, unit).split(" ")[0]}
                    />
                    <span className="text-sm font-bold text-foreground/50">
                      {unit === "imperial" ? "lb" : "kg"}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>{t.deadlineOptional}</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1"
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <Button onClick={handleCreateGoal} className="w-full">
                  {t.setGoal}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </div>
  );
}
