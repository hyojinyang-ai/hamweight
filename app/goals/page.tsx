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
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { formatWeight, lbToKg } from "@/lib/utils";
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
      // For maintain, show how close to target (100% = at target)
      const deviation = Math.abs(currentWeight - goal.targetWeight);
      return Math.max(0, 100 - deviation * 20); // -20% per kg deviation
    }

    return Math.min(100, (currentChange / totalChange) * 100);
  };

  const getGoalIcon = () => {
    if (!goal) return <Target className="h-5 w-5" />;
    if (goal.type === "lose") return <TrendingDown className="h-5 w-5 text-success" />;
    if (goal.type === "gain") return <TrendingUp className="h-5 w-5 text-warning" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const progress = getProgress();
  const isGoalAchieved = goal && progress >= 100;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <Hamster
          expression={isGoalAchieved ? "imTheBest" : "youCanDoIt"}
          size="sm"
        />
      </header>

      {goal ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                {getGoalIcon()}
                {goal.type === "lose" && "Lose Weight"}
                {goal.type === "gain" && "Gain Weight"}
                {goal.type === "maintain" && "Maintain Weight"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGoal(null)}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Current</div>
                <div className="text-lg font-bold">
                  {formatWeight(currentWeight, unit)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Target</div>
                <div className="text-lg font-bold">
                  {formatWeight(goal.targetWeight, unit)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Started</div>
                <div className="font-medium">
                  {format(new Date(goal.startDate), "MMM d")}
                </div>
              </div>
              {goal.deadline && (
                <div>
                  <div className="text-muted-foreground">Deadline</div>
                  <div className="font-medium">
                    {format(new Date(goal.deadline), "MMM d")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({differenceInDays(new Date(goal.deadline), new Date())} days)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isGoalAchieved && (
              <div className="rounded-lg bg-success/20 p-3 text-center text-success">
                🎉 Goal achieved! You&apos;re amazing!
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <Hamster expression="cheerUp" size="lg" />
          <p className="mt-4 text-muted-foreground">No goal set yet</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">Set a Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Your Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Goal Type</Label>
                  <Select
                    value={goalType}
                    onValueChange={(v) => setGoalType(v as Goal["type"])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Weight</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder={formatWeight(currentWeight, unit).split(" ")[0]}
                    />
                    <span className="text-sm text-muted-foreground">
                      {unit === "imperial" ? "lb" : "kg"}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Deadline (optional)</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1"
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <Button onClick={handleCreateGoal} className="w-full">
                  Set Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </div>
  );
}
