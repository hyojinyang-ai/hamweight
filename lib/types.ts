export interface BodyMeasurements {
  waist?: number; // cm
  hips?: number; // cm
  chest?: number; // cm
  arms?: number; // cm
  thighs?: number; // cm
}

export interface WeightEntry {
  id: string;
  weight: number; // always kg
  timestamp: string; // ISO string
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'evening';
  exerciseContext: 'before' | 'after' | 'none';
  measurements?: BodyMeasurements;
}

export interface UserProfile {
  height: number; // always cm
  unit: 'metric' | 'imperial';
  createdAt: string;
}

export interface Goal {
  type: 'lose' | 'gain' | 'maintain';
  targetWeight: number; // kg
  deadline?: string; // ISO string
  startWeight: number;
  startDate: string;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM"
  sound: boolean;
}

export type EmotionalState =
  | 'happy'
  | 'sleepy'
  | 'cheerUp'
  | 'youCanDoIt'
  | 'bringItOn'
  | 'imTheBest'
  | 'feelingTired'
  | 'exhausted';

export type ActivityState =
  | 'runningWheel'
  | 'treadmill'
  | 'coreExercise'
  | 'measuringWeight'
  | 'checkingHealth';

export type HamsterExpression = EmotionalState | ActivityState;

export type HamsterSize = 'sm' | 'md' | 'lg' | 'xl';
