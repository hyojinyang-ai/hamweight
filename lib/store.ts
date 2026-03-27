import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { WeightEntry, UserProfile, Goal, NotificationSettings } from './types';
import { getTodayISO, isSameDay } from './utils';

interface AppState {
  // State
  profile: UserProfile | null;
  entries: WeightEntry[];
  goal: Goal | null;
  streak: number;
  lastLogDate: string | null;
  notificationSettings: NotificationSettings;
  onboardingComplete: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  addEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  setGoal: (goal: Goal | null) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  completeOnboarding: () => void;

  // Computed helpers
  getLatestEntry: () => WeightEntry | null;
  getTodayEntries: () => WeightEntry[];
  getEntriesForDays: (days: number) => WeightEntry[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      entries: [],
      goal: null,
      streak: 0,
      lastLogDate: null,
      notificationSettings: {
        enabled: false,
        time: '08:00',
        sound: true,
      },
      onboardingComplete: false,

      // Actions
      setProfile: (profile) => set({ profile }),

      addEntry: (entryData) => {
        const today = getTodayISO();
        const { lastLogDate, streak } = get();

        let newStreak = streak;
        if (lastLogDate) {
          const lastDate = new Date(lastLogDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) {
            // Same day, streak unchanged
          } else if (diffDays === 1) {
            // Consecutive day, increment streak
            newStreak = streak + 1;
          } else {
            // Missed days, reset streak
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const entry: WeightEntry = {
          ...entryData,
          id: uuidv4(),
        };

        set((state) => ({
          entries: [...state.entries, entry],
          streak: newStreak,
          lastLogDate: today,
        }));
      },

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      setGoal: (goal) => set({ goal }),

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      completeOnboarding: () => set({ onboardingComplete: true }),

      // Computed helpers
      getLatestEntry: () => {
        const { entries } = get();
        if (entries.length === 0) return null;
        return entries.reduce((latest, entry) =>
          new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest
        );
      },

      getTodayEntries: () => {
        const { entries } = get();
        const today = getTodayISO();
        return entries.filter((e) => isSameDay(e.timestamp, today));
      },

      getEntriesForDays: (days) => {
        const { entries } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return entries.filter((e) => new Date(e.timestamp) >= cutoff);
      },
    }),
    {
      name: 'hamweight-storage',
    }
  )
);
