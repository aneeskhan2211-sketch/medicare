
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type MedicineType = 'pill' | 'capsule' | 'liquid' | 'injection' | 'topical';
export type MedicinePriority = 'normal' | 'critical';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  avatar?: string;
  color: string;
  lifestyle?: Lifestyle;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
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
  steps?: number;
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
  prescriptionNumber?: string;
  doctorName?: string;
  priority?: MedicinePriority;
  lowStockThreshold?: number;
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
  phone?: string;
  isPremium: boolean;
  tier: SubscriptionTier;
  avatar?: string;
  coins: number;
  balance: number;
  streak: number;
  maxStreak: number;
  lastLogin?: string;
  createdAt?: string;
  loginProvider?: string;
  deviceInfo?: string;
  notificationPreferences?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  healthProfile?: {
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    conditions?: string[];
    goals?: string[];
  };
  aiQueriesToday: number;
  lastAiQueryDate?: string;
  achievements: Achievement[];
  leaderboardRank?: number;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  lastActive: string;
  ipAddress?: string;
  location?: string;
}

export interface LinkedAccount {
  providerId: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0-100
  type: 'streak' | 'adherence' | 'meds' | 'profile';
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar?: string;
  lastAdherence?: number; // percentage
  streak: number;
  medsToday: {
    taken: number;
    total: number;
  };
  lastSeen?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  isCurrentUser: boolean;
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
  hasCompletedOnboarding?: boolean;
  appleHealthConnected?: boolean;
  googleFitConnected?: boolean;
  smartwatchConnected?: boolean;
  smartwatchName?: string;
  abhaConnected?: boolean;
  abhaId?: string;
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
  dataSync: {
    autoSync: boolean;
    lastSynced?: string;
  };
  caregiverAlerts?: {
    enabled: boolean;
    name: string;
    email: string;
    phone: string;
    alertOnMissingCritical: boolean;
  };
  sensitivity: number;
}

export type VitalsSource = 'manual' | 'wearable' | 'bluetooth' | 'demo';

export interface VitalSign {
  id: string;
  profileId: string;
  userId: string;
  type: 'blood_pressure' | 'glucose' | 'heart_rate' | 'spo2' | 'temperature' | 'weight' | 'steps';
  value: string; // "120/80", "110", etc.
  unit: string; // "mmHg", "mg/dL", "bpm", "%", "°C", "kg"
  timestamp: string;
  status: 'normal' | 'low' | 'high' | 'critical' | 'elevated';
  source: VitalsSource | 'camera' | 'smartwatch';
  deviceName?: string;
  notes?: string;
  confidenceScore?: number;
}

export interface HealthReport {
  id: string;
  profileId: string;
  title: string;
  date: string;
  year: number; // For categorization
  category: string; // e.g., 'Blood Test', 'Prescription', 'Insurance'
  summary: string;
  imageUrl?: string;
  type: 'prescription' | 'lab_result' | 'scan' | 'insurance' | 'other';
  patientName?: string;
  doctorFollowUp?: string;
  metrics?: Array<{
    name: string;
    value: string | number;
    unit: string;
    status: string;
  }>;
  recommendations?: string[];
}

export interface Appointment {
  id: string;
  profileId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  reminderEnabled?: boolean;
  reminderTimeMinutes?: number;
}

export interface Symptom {
  id: string;
  profileId: string;
  userId: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  mood?: 'great' | 'good' | 'neutral' | 'low' | 'bad';
  energy?: 1 | 2 | 3 | 4 | 5;
  pain?: 0 | 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  notes?: string;
}

export interface InteractionCheck {
  medicines: string[];
  interactionFound: boolean;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  details: string;
  recommendation: string;
}

export interface Meal {
  id: string;
  profileId: string;
  name: string;
  calories: number;
  type: string;
  time: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  healthyRemarks?: string[];
  unhealthyRemarks?: string[];
  date: string; // YYYY-MM-DD
}

export interface HealthInsight {
  title: string;
  description: string;
  correlation: string;
  recommendation: string;
  severity: 'low' | 'moderate' | 'high';
  type: 'diet' | 'vitals' | 'medication' | 'lifestyle';
}

export type ActivityType = 'WALKING' | 'RUNNING' | 'JOGGING' | 'CYCLING' | 'STILL' | 'IN_VEHICLE' | 'SLEEPING' | 'STAIR_CLIMBING' | 'WORKOUT';

export interface ActivitySession {
  id: string;
  profileId: string;
  type: ActivityType;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  averageSpeed: number; // km/h
  pace: number; // min/km
  heartRateAvg?: number;
  confidenceScore: number;
  autoDetected: boolean;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  profileId: string;
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  activeMinutes: number;
  walkingMinutes: number;
  runningMinutes: number;
  cyclingMinutes: number;
  idleMinutes: number;
  sleepHours: number;
  healthScore: number;
}

export interface HealthChallenge {
  id: string;
  title: string;
  description: string;
  category: 'water' | 'steps' | 'sleep' | 'nutrition' | 'meditation' | 'medication';
  targetValue: number;
  unit: string;
  durationDays: number;
  rewardCoins: number;
  icon: string;
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  userId: string;
  profileId: string;
  startDate: string;
  progress: number;
  isCompleted: boolean;
  claimedReward: boolean;
  lastProgressUpdate?: string;
  completedAt?: string;
  rewardClaimedAt?: string;
}
