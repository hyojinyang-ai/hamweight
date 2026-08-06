// app/goals/page.tsx
"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { TrendingDown, TrendingUp, Minus, MoreVertical, ArrowRight, Calendar, Flag, Plus, Pencil } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { formatWeight, lbToKg, kgToLb } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";
import type { Goal } from "@/lib/types";

function GoalCard({
  goal,
  currentWeight,
  unit,
  lang,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  currentWeight: number;
  unit: "metric" | "imperial";
  lang: "en" | "ko";
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = getTranslations(lang);
  const [menuOpen, setMenuOpen] = useState(false);

  const getProgress = () => {
    const totalChange = Math.abs(goal.startWeight - goal.targetWeight);
    const currentChange = Math.abs(goal.startWeight - currentWeight);
    if (goal.type === "maintain") {
      const deviation = Math.abs(currentWeight - goal.targetWeight);
      return Math.max(0, 100 - deviation * 20);
    }
    return Math.min(100, (currentChange / totalChange) * 100);
  };

  const getGoalIcon = () => {
    if (goal.type === "lose") return <TrendingDown className="h-5 w-5 text-success" />;
    if (goal.type === "gain") return <TrendingUp className="h-5 w-5 text-warning" />;
    return <Minus className="h-5 w-5 text-foreground/50" />;
  };

  const progress = getProgress();
  const isGoalAchieved = progress >= 100;
  const remainingWeight = Math.abs(currentWeight - goal.targetWeight);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            {getGoalIcon()}
            {goal.type === "lose" && t.loseWeight}
            {goal.type === "gain" && t.gainWeight}
            {goal.type === "maintain" && t.maintainWeight}
          </CardTitle>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={lang === "ko" ? "메뉴" : "Menu"}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-xl bg-background p-1.5 [border:var(--neo-border)]">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-foreground hover:bg-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t.editGoal}
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-destructive hover:bg-destructive/10"
                  >
                    {t.clear}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-bold">{t.progress}</span>
            <span className="font-black">{Math.round(progress)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-lg bg-muted [border:var(--neo-border)]">
            <div
              className="h-full rounded-lg bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-muted/50 p-3 [border:var(--neo-border)]">
            <div className="text-xs font-bold text-foreground/50">{t.current}</div>
            <div className="mt-0.5 text-xl font-black">
              {formatWeight(currentWeight, unit).split(" ")[0]}
              <span className="ml-1 text-sm font-bold text-foreground/45">{unit === "imperial" ? "lb" : "kg"}</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-foreground/30" strokeWidth={2.5} />
          <div className="flex-1 rounded-xl bg-primary/15 p-3 [border:var(--neo-border)]">
            <div className="flex items-center gap-1 text-xs font-bold text-primary-foreground/70">
              <Flag className="h-3 w-3" />
              {t.target}
            </div>
            <div className="mt-0.5 text-xl font-black">
              {formatWeight(goal.targetWeight, unit).split(" ")[0]}
              <span className="ml-1 text-sm font-bold text-foreground/45">{unit === "imperial" ? "lb" : "kg"}</span>
            </div>
          </div>
        </div>

        {!isGoalAchieved && (
          <div className="text-center text-sm font-bold text-foreground/50">
            {formatWeight(remainingWeight, unit).split(" ")[0]} {unit === "imperial" ? "lb" : "kg"} {t.toGo}
          </div>
        )}

        <div className={`grid gap-3 text-sm ${goal.deadline ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 [border:var(--neo-border)]">
            <Calendar className="h-4 w-4 text-foreground/40" />
            <div>
              <div className="text-xs font-bold text-foreground/50">{t.started}</div>
              <div className="font-bold">{format(new Date(goal.startDate), "MMM d")}</div>
            </div>
          </div>
          {goal.deadline && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 [border:var(--neo-border)]">
              <Flag className="h-4 w-4 text-foreground/40" />
              <div>
                <div className="text-xs font-bold text-foreground/50">{t.deadline}</div>
                <div className="font-bold">
                  {format(new Date(goal.deadline), "MMM d")}
                  <span className="ml-1 text-xs text-foreground/50">
                    ({differenceInDays(new Date(goal.deadline), new Date())}{lang === "ko" ? "일" : "d"})
                  </span>
                </div>
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
  );
}

export default function GoalsPage() {
  const profile = useStore((s) => s.profile);
  const goals = useStore((s) => s.goals);
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [goalType, setGoalType] = useState<Goal["type"]>("lose");
  const [targetWeight, setTargetWeight] = useState("");
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);
  const latestEntry = getLatestEntry();
  const currentWeight = latestEntry?.weight ?? 70;

  const openCreateDialog = () => {
    setEditingGoal(null);
    setGoalType("lose");
    setTargetWeight("");
    setDeadline("");
    setStartDate("");
    setDialogOpen(true);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalType(goal.type);
    const displayWeight = unit === "imperial" ? kgToLb(goal.targetWeight).toFixed(1) : goal.targetWeight.toFixed(1);
    setTargetWeight(displayWeight);
    setDeadline(goal.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "");
    setStartDate(format(new Date(goal.startDate), "yyyy-MM-dd"));
    setDialogOpen(true);
  };

  const handleSaveGoal = () => {
    const targetNum = parseFloat(targetWeight);
    if (isNaN(targetNum)) return;

    const targetKg = unit === "imperial" ? lbToKg(targetNum) : targetNum;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        type: goalType,
        targetWeight: targetKg,
        deadline: deadline || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : editingGoal.startDate,
      });
    } else {
      addGoal({
        type: goalType,
        targetWeight: targetKg,
        deadline: deadline || undefined,
        startWeight: currentWeight,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      });
    }

    setDialogOpen(false);
    setEditingGoal(null);
    setTargetWeight("");
    setDeadline("");
    setStartDate("");
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteGoal(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.goals}</h1>
          <p className="text-sm font-bold text-foreground/50">{t.goalsSubtitle}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl"
          onClick={openCreateDialog}
          aria-label={t.addGoal}
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </Button>
      </header>

      {goals.length > 0 ? (
        goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            currentWeight={currentWeight}
            unit={unit}
            lang={lang}
            onEdit={() => openEditDialog(goal)}
            onDelete={() => setDeleteConfirmId(goal.id)}
          />
        ))
      ) : (
        <Card className="p-6 text-center">
          <p className="font-black text-foreground/60">{t.noGoalYet}</p>
          <p className="mt-1 text-sm font-bold text-foreground/40">{t.noGoalEncouragement}</p>
          <Button className="mt-4" onClick={openCreateDialog}>{t.setGoal}</Button>
        </Card>
      )}

      {/* Create / Edit Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black">
              {editingGoal ? t.editGoal : t.setYourGoal}
            </DialogTitle>
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
              <Label>{t.started}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{t.deadlineOptional}</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button onClick={handleSaveGoal} className="w-full">
              {editingGoal ? t.saveChanges : t.setGoal}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-[20rem]">
          <DialogHeader>
            <DialogTitle className="text-base font-black">{t.deleteConfirmTitle}</DialogTitle>
            <DialogDescription className="text-sm">
              {t.deleteConfirmDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete}>
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
