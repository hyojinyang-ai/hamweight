"use client";

import { useMemo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Activity, ChevronLeft, ChevronRight, Calendar, X, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatWeight } from "@/lib/utils";
import { format } from "date-fns";

function buildGrid(weeks: number) {
  const today = new Date();
  const grid: Date[][] = [];

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1));
  const dayOfWeek = startDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + mondayOffset);

  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    grid.push(week);
  }

  return grid;
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < startDow; i++) week.push(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

type ActivityHeatmapMode = "weight" | "exercise";

interface ActivityHeatmapProps {
  mode?: ActivityHeatmapMode;
}

export function ActivityHeatmap({ mode = "weight" }: ActivityHeatmapProps) {
  const entries = useStore((s) => s.entries);
  const profile = useStore((s) => s.profile);

  const lang = profile?.language ?? "en";
  const unit = profile?.unit ?? "metric";
  const t = lang === "ko"
    ? {
        weightCalendar: "체중 기록 캘린더",
        exerciseCalendar: "운동 기록 캘린더",
        loggedDays: (n: number) => `총 ${n}일 기록`,
        exerciseDays: (n: number) => `총 ${n}일 운동`,
        notLogged: "기록 없음",
        logged: "기록됨",
        exerciseDone: "운동함",
        noEntries: "기록 없음",
        entries: (n: number) => `${n}개 기록`,
        weightLog: "체중 기록",
        exerciseLog: "운동 기록",
        noWeightEntries: "이 날짜에는 체중 기록이 없습니다.",
        noExerciseEntries: "이 날짜에는 운동 기록이 없습니다.",
        afterWorkout: "운동 후",
        beforeWorkout: "운동 전",
      }
    : {
        weightCalendar: "Weight Log Calendar",
        exerciseCalendar: "Exercise Log Calendar",
        loggedDays: (n: number) => `${n} logged days`,
        exerciseDays: (n: number) => `${n} exercise days`,
        notLogged: "Not logged",
        logged: "Logged",
        exerciseDone: "Exercised",
        noEntries: "No entries",
        entries: (n: number) => `${n} entries`,
        weightLog: "Weight log",
        exerciseLog: "Exercise log",
        noWeightEntries: "No weight entries for this date.",
        noExerciseEntries: "No exercise entries for this date.",
        afterWorkout: "After Workout",
        beforeWorkout: "Before Workout",
      };

  const [showDetail, setShowDetail] = useState(false);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const activeDates = useMemo(() => {
    const dates = new Map<string, number>();
    for (const entry of entries) {
      const isActive = mode === "weight"
        ? true
        : entry.exerciseContext === "before" || entry.exerciseContext === "after";
      if (!isActive) continue;

      const date = entry.timestamp.slice(0, 10);
      dates.set(date, (dates.get(date) ?? 0) + 1);
    }
    return dates;
  }, [entries, mode]);

  const grid = useMemo(() => buildGrid(16), []);
  const monthGrid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const today = new Date().toISOString().slice(0, 10);
  const totalActiveDays = activeDates.size;

  const getLevel = (date: Date) => {
    const key = date.toISOString().slice(0, 10);
    return activeDates.has(key) ? 1 : 0;
  };

  const isFuture = (date: Date) => date.toISOString().slice(0, 10) > today;
  const isToday = (date: Date) => date.toISOString().slice(0, 10) === today;

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }, [viewMonth, viewYear]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }, [viewMonth, viewYear]);

  const monthNames = useMemo(
    () => (lang === "ko"
      ? ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]),
    [lang]
  );

  const dayLabels = useMemo(
    () => (lang === "ko"
      ? ["월", "화", "수", "목", "금", "토", "일"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
    [lang]
  );

  const getDateEntries = (date: Date) => {
    const key = date.toISOString().slice(0, 10);
    return entries.filter((entry) => {
      const sameDate = entry.timestamp.slice(0, 10) === key;
      if (!sameDate) return false;
      return mode === "weight"
        ? true
        : entry.exerciseContext === "before" || entry.exerciseContext === "after";
    });
  };

  const getInitialSelectedDate = useCallback(() => {
    const keys = Array.from(activeDates.keys()).sort();
    const latestKey = keys[keys.length - 1];
    return latestKey ? new Date(`${latestKey}T12:00:00`) : new Date();
  }, [activeDates]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(getInitialSelectedDate);
  const selectedEntries = selectedDate ? getDateEntries(selectedDate) : [];

  const title = mode === "weight" ? t.weightCalendar : t.exerciseCalendar;
  const subtitle = mode === "weight" ? t.loggedDays(totalActiveDays) : t.exerciseDays(totalActiveDays);
  const emptyText = mode === "weight" ? t.noWeightEntries : t.noExerciseEntries;
  const HeaderIcon = mode === "weight" ? Activity : Dumbbell;

  return (
    <>
      <div
        onClick={() => {
          setSelectedDate(getInitialSelectedDate());
          setShowDetail(true);
        }}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden p-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:2px_2px_0px_0px_hsl(var(--border))]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 [border:var(--neo-border)]">
                <HeaderIcon className="h-5 w-5 text-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-black">{title}</div>
                <div className="text-xs font-bold text-foreground/50">{subtitle}</div>
              </div>
            </div>
            <div className="rounded-xl bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground [border:var(--neo-border)]">
              {lang === "ko" ? "보기" : "View"}
            </div>
          </div>

          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((date, di) => {
                  const level = getLevel(date);
                  const future = isFuture(date);
                  return (
                    <div
                      key={di}
                      className={`h-[10px] w-[10px] rounded-[2.5px] ${
                        future ? "bg-transparent" : level === 0 ? "bg-muted" : "bg-primary"
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1.5">
            <span className="text-[9px] font-bold text-foreground/40">{t.notLogged}</span>
            <div className="h-[10px] w-[10px] rounded-[2.5px] bg-muted" />
            <div className="h-[10px] w-[10px] rounded-[2.5px] bg-primary" />
            <span className="text-[9px] font-bold text-foreground/40">{mode === "weight" ? t.logged : t.exerciseDone}</span>
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showDetail && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowDetail(false); }}
          >
            <motion.div
              className="w-full max-w-md rounded-t-2xl bg-background p-5 pb-8 [border:var(--neo-border)] [border-bottom:none]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <HeaderIcon className="h-7 w-7 text-foreground" strokeWidth={2.5} />
                  <div>
                    <div className="text-lg font-black">{title}</div>
                    <div className="text-xs font-bold text-foreground/50">{subtitle}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDetail(false); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:text-foreground"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              <div className="mb-5 flex items-center gap-2">
                <div className="rounded-xl bg-muted px-3.5 py-1.5 text-xs font-black [border:var(--neo-border)]">
                  {selectedEntries.length > 0 ? t.entries(selectedEntries.length) : t.noEntries}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div
                    key={selectedDate.toISOString().slice(0, 10)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5"
                  >
                    <div className="rounded-xl bg-muted/50 p-3 [border:var(--neo-border)]">
                      <div className="mb-2 text-xs font-black text-foreground/50">
                        {format(selectedDate, "MMM d, yyyy")}
                      </div>
                      <div className="space-y-1.5">
                        {selectedEntries.length > 0 ? (
                          selectedEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-black">{formatWeight(entry.weight, unit)}</span>
                                {mode === "exercise" && entry.exerciseContext !== "none" && (
                                  <span className="rounded-md bg-foreground px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                    {entry.exerciseContext === "after" ? t.afterWorkout : t.beforeWorkout}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-foreground/40">
                                {format(new Date(entry.timestamp), "h:mm a")}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm font-bold text-foreground/50">{emptyText}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-sm font-black [border:var(--neo-border)]">
                    <Calendar className="h-4 w-4" />
                    {lang === "ko" ? `${viewYear}년 ${viewMonth + 1}월` : `${monthNames[viewMonth]} ${viewYear}`}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted [border:var(--neo-border)] hover:bg-accent">
                      <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted [border:var(--neo-border)] hover:bg-accent">
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="mb-1 grid grid-cols-7 gap-1">
                  {dayLabels.map((d) => (
                    <div key={d} className="py-1 text-center text-[11px] font-bold text-foreground/40">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {monthGrid.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                      {week.map((date, di) => {
                        if (!date) return <div key={di} className="aspect-square" />;

                        const key = date.toISOString().slice(0, 10);
                        const didLog = activeDates.has(key);
                        const isTodayDate = isToday(date);
                        const isSel = selectedDate && selectedDate.toISOString().slice(0, 10) === key;
                        const futureDate = isFuture(date);

                        return (
                          <button
                            key={di}
                            onClick={() => setSelectedDate(date)}
                            className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all ${
                              isSel && didLog
                                ? "bg-success text-success-foreground font-black [box-shadow:var(--neo-shadow-sm)]"
                                : didLog
                                  ? "bg-primary text-primary-foreground font-black [box-shadow:var(--neo-shadow-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:[box-shadow:2px_2px_0px_0px_hsl(var(--border))]"
                                  : futureDate
                                    ? "text-foreground/20"
                                    : isSel
                                      ? "bg-muted/60 text-foreground font-black"
                                      : "bg-muted/40 text-foreground/50"
                            } ${isTodayDate && !didLog ? "font-black text-foreground" : ""}`}
                          >
                            {date.getDate()}
                            {isTodayDate && (
                              <div className={`pointer-events-none absolute inset-0 rounded-xl border border-dashed ${isSel && didLog ? "border-success-foreground/70" : "border-foreground/40"}`} />
                            )}
                            {didLog && (
                              <div className={`absolute bottom-1.5 h-2 w-2 rounded-full ${isSel && didLog ? "bg-success-foreground" : "bg-white"}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
