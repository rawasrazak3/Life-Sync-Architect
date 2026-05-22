export interface Task {
  id: string;
  name: string;
  priority: "P1" | "P2" | "P3" | "P4";
  category: "Work" | "Personal" | "Urgent";
  deadline: string | null; // e.g. "2026-05-26" or "Tomorrow at 2 PM"
  completed: boolean;
  dateAdded: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  remainingPills: number;
  totalPills: number;
  refillThreshold: number;
  lastIntake: string | null; // ISO timestamp
}

export interface SymptomLog {
  id: string;
  timestamp: string;
  bloodPressure: string; // e.g. "120/80"
  heartRate: number; // bpm
  temperature: number; // °F
  description: string;
}

export interface Appointment {
  id: string;
  title: string;
  dateTime: string; // e.g. "2026-05-25T14:00"
  notes: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  aisle: "Produce" | "Dairy" | "Meat / Deli" | "Pantry" | "Hardware" | "Household" | "Other";
  isRecurringEssential: boolean;
  purchased: boolean;
  priorityReplenish?: boolean; // if marked high priority manually
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: "Food" | "Transit" | "Medical" | "Coffee" | "Household" | "Other";
  date: string; // YYYY-MM-DD
}

export interface DailySnapshot {
  markdown: string;
  generatedAt: string;
}

export interface MedicationIntakeLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  gender: "Male" | "Female" | "Non-binary" | "Prefer not to say" | "";
  weight: number; // kg
  height: number; // cm
  conditions: string; // comma-separated list or descriptions
  fitnessGoal: string; // e.g. "Strength", "Weight Loss", etc.
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // kg or lbs
}

export interface GymSession {
  id: string;
  timestamp: string; // ISO format
  workouts: WorkoutExercise[];
  notes: string;
  durationMinutes: number;
}

