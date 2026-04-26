
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type MedicineType = 'pill' | 'capsule' | 'liquid' | 'injection' | 'topical';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  color: string;
  lifestyle?: Lifestyle;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Lifestyle {
  wakeTime: string;
  sleepTime: string;
  mealTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  activityLevel: 'low' | 'moderate' | 'high';
  notes?: string;
}

export interface SmartScheduleSuggestion {
  medicineId: string;
  suggestedTimes: string[];
  reasoning: string;
  lifestyleAdjustments?: string;
}

export interface Medicine {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  type: MedicineType;
  frequency: string;
  intervalDays?: number; // For "Every X Days"
  selectedDays?: number[];
  times: string[]; // e.g., ["08:00", "20:00"]
  stock: number;
  totalStock: number;
  startDate: string;
  endDate?: string;
  expiryDate?: string;
  instructions?: string;
  mealInstruction?: 'before' | 'after' | 'with' | 'custom';
  reminderTone?: string;
  snoozeEnabled: boolean;
  snoozeInterval?: number; // in minutes
  color: string;
  userId: string;
  image?: string;
}

export interface Reminder {
  id: string;
  profileId: string;
  medicineId: string;
  time: string;
  status: 'pending' | 'taken' | 'missed';
  date: string; // YYYY-MM-DD
}

export type SubscriptionTier = 'basic' | 'pro' | 'premium' | 'family_plus';

export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  tier: SubscriptionTier;
  avatar?: string;
  coins: number;
  balance: number;
  streak: number;
  lastLogin?: string;
  aiQueriesToday: number;
  lastAiQueryDate?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  status: 'pending' | 'completed';
  userId: string;
  recurrence?: RecurrenceType;
}

export interface AdherenceData {
  date: string;
  taken: number;
  total: number;
}

export interface Settings {
  notifications: {
    enabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    reminderSound: string;
  };
  security: {
    biometricEnabled: boolean;
    autoLock: boolean;
    twoFactorEnabled: boolean;
  };
  darkMode: boolean;
  language: string;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}
