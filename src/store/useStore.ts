import { create } from 'zustand';
import { Medicine, Reminder, User, ChatMessage, Profile, Task, Settings, Lifestyle, AdherenceData, VitalSign, HealthReport, Appointment, Symptom, Achievement, FamilyMember, LeaderboardEntry, Meal, HealthInsight, HealthChallenge, UserChallenge } from '../types';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';
import { auth, db, googleProvider, facebookProvider, appleProvider } from '../lib/firebase';
import { 
  signOut, 
  linkWithPopup, 
  unlink
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase';

interface AppState {
  user: User | null;
  profiles: Profile[];
  activeProfileId: string;
  medicines: Medicine[];
  reminders: Reminder[];
  tasks: Task[];
  appointments: Appointment[];
  familyMembers: FamilyMember[];
  leaderboard: LeaderboardEntry[];
  settings: Settings;
  isPremium: boolean;
  chatHistory: ChatMessage[];
  isAuthenticated: boolean;
  vitals: VitalSign[];
  reports: HealthReport[];
  symptoms: Symptom[];
  meals: Meal[];
  healthInsights: HealthInsight[];
  sideEffectAnalysis: any | null;
  isGeneratingInsights: boolean;
  cart: { medId: string; qty: number }[];
  availableChallenges: HealthChallenge[];
  userChallenges: UserChallenge[];
  waterIntake: { [date: string]: number };
  
  // Actions
  login: (email: string, name: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  authLoading: boolean;
  onboardingData: Partial<User['healthProfile']> | null;
  setOnboardingData: (data: Partial<User['healthProfile']>) => void;
  completeOnboarding: () => Promise<void>;
  linkProvider: (providerName: 'google' | 'facebook' | 'apple') => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;
  setActiveProfile: (id: string) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, profile: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  requestRefill: (medId: string) => void;
  setTier: (tier: User['tier']) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminderStatus: (id: string, status: Reminder['status']) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;
  addAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  syncData: () => Promise<void>;
  updateLifestyle: (profileId: string, lifestyle: Lifestyle) => void;
  getAdherenceData: () => AdherenceData[];
  get30DayAdherenceData: () => AdherenceData[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addBalance: (amount: number) => void;
  withdrawBalance: (amount: number) => boolean;
  updateStreak: () => void;
  checkAchievements: () => void;
  incrementAiQuery: () => boolean;
  checkDailyLogin: () => void;
  generateReminders: () => void;
  checkMissedReminders: () => void;
  notifyCaregiver: (medName: string, time: string) => Promise<void>;
  addVitalSign: (vital: VitalSign) => void;
  deleteVitalSign: (id: string) => void;
  addReport: (report: HealthReport) => void;
  deleteReport: (id: string) => void;
  addSymptom: (symptom: Symptom) => void;
  deleteSymptom: (id: string) => void;
  addMeal: (meal: Meal) => void;
  deleteMeal: (id: string) => void;
  generateAIInsights: () => Promise<void>;
  analyzeSideEffects: () => Promise<void>;
  generateClinicalReport: () => Promise<Blob>;
  nudgeFamilyMember: (id: string) => void;
  highFiveFamilyMember: (id: string) => void;
  addToCart: (medId: string) => void;
  removeFromCart: (medId: string) => void;
  updateCartQty: (medId: string, qty: number) => void;
  clearCart: () => void;
  joinChallenge: (challengeId: string) => void;
  updateChallengeProgress: (id: string, amount: number) => void;
  claimChallengeReward: (id: string) => void;
  logWater: (glasses: number) => void;
}

// Mock initial data
const initialProfile: Profile = {
  id: 'profile-1',
  name: 'John Doe',
  age: 32,
  gender: 'male',
  color: '#6366f1',
  lifestyle: {
    wakeTime: '07:00',
    sleepTime: '23:00',
    mealTimes: {
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '19:30'
    },
    activityLevel: 'moderate'
  },
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1 234 567 890',
    relation: 'Wife'
  }
};

// We'll need to install zustand
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      profiles: [initialProfile],
      activeProfileId: 'profile-1',
      medicines: [],
      reminders: [],
      familyMembers: [
        {
          id: 'fam-1',
          name: 'Sarah (Mother)',
          relation: 'Mother',
          streak: 12,
          lastAdherence: 95,
          medsToday: { taken: 2, total: 3 },
          lastSeen: new Date().toISOString()
        },
        {
          id: 'fam-2',
          name: 'Rahul (Father)',
          relation: 'Father',
          streak: 45,
          lastAdherence: 100,
          medsToday: { taken: 1, total: 1 },
          lastSeen: new Date().toISOString()
        }
      ],
      leaderboard: [
        { id: '1', name: 'Aarav S.', score: 12450, rank: 1, isCurrentUser: false },
        { id: '2', name: 'Priya K.', score: 11200, rank: 2, isCurrentUser: false },
        { id: '3', name: 'Ishita M.', score: 10800, rank: 3, isCurrentUser: false },
        { id: 'user-1', name: 'You', score: 1000, rank: 45, isCurrentUser: true },
      ],
      tasks: [
        {
          id: 'task-water-1',
          profileId: 'profile-1',
          title: 'Drink water',
          description: 'Stay hydrated! Daily goal: 2L',
          dueDate: '2026-04-27',
          dueTime: '10:00',
          status: 'pending',
          userId: 'user-1'
        }
      ],
      appointments: [],
      settings: {
        appleHealthConnected: false,
        googleFitConnected: false,
        smartwatchConnected: false,
        abhaConnected: false,
        notifications: {
          enabled: true,
          emailEnabled: true,
          pushEnabled: true,
          reminderSound: 'default',
        },
        security: {
          biometricEnabled: false,
          autoLock: false,
          twoFactorEnabled: false,
        },
        darkMode: false,
        language: 'en',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        },
        dataSync: {
          autoSync: true,
          lastSynced: new Date().toISOString()
        },
        caregiverAlerts: {
          enabled: false,
          name: '',
          email: '',
          phone: '',
          alertOnMissingCritical: true
        },
        sensitivity: 50
      },
      isPremium: false,
      isAuthenticated: false,
      authLoading: true,
      onboardingData: null,
      chatHistory: [
        {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your MediPulse Assistant. How can I help you with your health journey today?",
          timestamp: new Date().toISOString()
        }
      ],
      vitals: [],
      reports: [],
      symptoms: [],
      meals: [
        { id: '1', profileId: 'profile-1', name: 'Oatmeal & Berries', calories: 320, type: 'Breakfast', time: '08:30 AM', protein: 10, carbs: 45, fats: 8, healthyRemarks: ["Oatmeal provides complex carbs and fiber", "Berries are rich in antioxidants and vitamins"], date: new Date().toISOString().split('T')[0] },
        { id: '2', profileId: 'profile-1', name: 'Grilled Chicken Salad', calories: 450, type: 'Lunch', time: '01:15 PM', protein: 40, carbs: 15, fats: 25, healthyRemarks: ["Excellent source of lean protein", "Provides essential vitamins from veggies"], date: new Date().toISOString().split('T')[0] },
      ],
      healthInsights: [],
      isGeneratingInsights: false,
      cart: [],
      availableChallenges: [
        {
          id: 'challenge-water',
          title: 'Hydration Hero',
          description: 'Drink 8 glasses of water every day for a week.',
          category: 'water',
          targetValue: 7, // days
          unit: 'days',
          durationDays: 7,
          rewardCoins: 50,
          icon: 'Droplets'
        },
        {
          id: 'challenge-steps',
          title: '10K Step Club',
          description: 'Walk 10,000 steps daily for 5 days.',
          category: 'steps',
          targetValue: 5,
          unit: 'days',
          durationDays: 5,
          rewardCoins: 100,
          icon: 'Footprints'
        },
        {
          id: 'challenge-sleep',
          title: 'Deep Sleeper',
          description: 'Get at least 8 hours of sleep for 3 nights.',
          category: 'sleep',
          targetValue: 3,
          unit: 'nights',
          durationDays: 7,
          rewardCoins: 75,
          icon: 'Moon'
        },
        {
          id: 'challenge-meds',
          title: 'Medication Master',
          description: 'Take all your medications on time for 10 days straight.',
          category: 'medication',
          targetValue: 10,
          unit: 'days',
          durationDays: 14,
          rewardCoins: 150,
          icon: 'Pill'
        },
        {
          id: 'challenge-diet',
          title: 'Clean Eater',
          description: 'Log healthy meals for 5 consecutive days.',
          category: 'nutrition',
          targetValue: 5,
          unit: 'days',
          durationDays: 7,
          rewardCoins: 80,
          icon: 'Apple'
        }
      ],
      userChallenges: [],
      waterIntake: {},

      login: (email, name) => set({
        user: {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          isPremium: false,
          tier: 'basic',
          coins: 100,
          balance: 0,
          streak: 0,
          maxStreak: 0,
          aiQueriesToday: 0,
          lastAiQueryDate: new Date().toISOString().split('T')[0],
          achievements: [],
          leaderboardRank: 1240,
        },
        isAuthenticated: true,
        authLoading: false
      }),

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false, profiles: [initialProfile], activeProfileId: 'profile-1' });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isPremium: user?.isPremium || false
        });

        if (user) {
          // Log session on user set (if authenticated)
          const sessionPath = `users/${user.id}/sessions/${Date.now()}`;
          const sessionRef = doc(db, sessionPath);
          setDoc(sessionRef, {
            id: sessionRef.id,
            userId: user.id,
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language
            },
            ipAddress: '127.0.0.1', 
            lastActive: serverTimestamp(),
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isValid: true
          }).catch(e => handleFirestoreError(e, OperationType.WRITE, sessionPath));

          // Log Security Event
          const securityPath = `security_logs/${Date.now()}`;
          const securityLogRef = doc(db, securityPath);
          setDoc(securityLogRef, {
            id: securityLogRef.id,
            userId: user.id,
            eventType: 'LOGIN',
            description: 'User synchronized with session',
            severity: 'LOW',
            metadata: {
              method: user.loginProvider || 'unknown',
              userAgent: navigator.userAgent
            },
            timestamp: serverTimestamp(),
            ipAddress: '127.0.0.1'
          }).catch(e => handleFirestoreError(e, OperationType.WRITE, securityPath));
        }
      },

      setAuthLoading: (loading) => set({ authLoading: loading }),

      setOnboardingData: (data) => set({ onboardingData: data }),

      completeOnboarding: async () => {
        const { user, onboardingData } = get();
        if (!user || !onboardingData) return;

        const userPath = `users/${user.id}`;
        const userRef = doc(db, userPath);
        const healthProfile = {
          ...user.healthProfile,
          ...onboardingData
        };

        try {
          await updateDoc(userRef, {
            healthProfile,
            'settings.hasCompletedOnboarding': true
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, userPath);
        }

        set((state) => ({
          user: state.user ? { ...state.user, healthProfile } : null,
          settings: { ...state.settings, hasCompletedOnboarding: true },
          onboardingData: null
        }));
      },

      linkProvider: async (providerName) => {
        const { user } = get();
        if (!user || !auth.currentUser) return;

        let provider;
        switch(providerName) {
          case 'google': provider = googleProvider; break;
          case 'facebook': provider = facebookProvider; break;
          case 'apple': provider = appleProvider; break;
        }

        try {
          const result = await linkWithPopup(auth.currentUser, provider);
          const credential = result.user;
          // Update linked accounts in firestore
          const accountPath = `users/${user.id}/linked_accounts/${providerName}`;
          const linkedAccountRef = doc(db, accountPath);
          await setDoc(linkedAccountRef, {
            providerId: providerName,
            uid: credential.uid,
            email: credential.email,
            displayName: credential.displayName,
            photoURL: credential.photoURL
          });
          toast.success(`${providerName} linked successfully!`);
        } catch (error: any) {
          if (error.code === 'auth/credential-already-in-use') {
            toast.error('This account is already linked to another user.');
          } else {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/linked_accounts/${providerName}`);
          }
        }
      },

      unlinkProvider: async (providerId) => {
        const { user } = get();
        if (!auth.currentUser || !user) return;
        try {
          await unlink(auth.currentUser, providerId);
          toast.success('Account unlinked.');
        } catch (error) {
          toast.error('Failed to unlink account.');
        }
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      addProfile: (profile) => {
        const { profiles, user } = get();
        if (!user) return;
        
        const limits = {
          basic: 1,
          pro: 3,
          premium: 10, // Unlimited practically
          family_plus: 6
        };
        
        if (profiles.length >= limits[user.tier]) {
          throw new Error(`Your current plan (${user.tier}) allows max ${limits[user.tier]} profiles.`);
        }
        
        set((state) => ({
          profiles: [...state.profiles, profile]
        }));
      },

      updateProfile: (id, updatedProfile) => set((state) => ({
        profiles: state.profiles.map((p) => p.id === id ? { ...p, ...updatedProfile } : p)
      })),

      deleteProfile: (id) => set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
        activeProfileId: state.activeProfileId === id ? state.profiles[0]?.id : state.activeProfileId
      })),

      addMedicine: (medicine) => {
        const { medicines, user } = get();
        if (!user) return;

        const limits = {
          basic: 3,
          pro: 100, // Unlimited
          premium: 100,
          family_plus: 100
        };

        if (medicines.length >= limits[user.tier]) {
          throw new Error(`Your current plan (${user.tier}) allows max ${limits[user.tier]} medicines.`);
        }
        set({ medicines: [...medicines, medicine] });
      },

      updateMedicine: (id, updatedMed) => set((state) => ({
        medicines: state.medicines.map((m) => m.id === id ? { ...m, ...updatedMed } : m)
      })),

      deleteMedicine: (id) => set((state) => ({
        medicines: state.medicines.filter((m) => m.id !== id)
      })),

      requestRefill: (medId) => {
        const { medicines } = get();
        const med = medicines.find(m => m.id === medId);
        if (med) {
          toast.success(`Refill request sent for ${med.name}`, {
            description: "Your pharmacist has been notified."
          });
        }
      },

      setTier: (tier) => set((state) => ({ 
        user: state.user ? { ...state.user, tier, isPremium: tier !== 'basic' } : null,
        isPremium: tier !== 'basic'
      })),

      addReminder: (reminder) => set((state) => ({
        reminders: [...state.reminders, reminder]
      })),

      updateReminderStatus: (id: string, status) => {
        const { reminders, user, medicines, updateMedicine, addCoins, updateStreak, checkAchievements } = get();
        const updatedReminders = reminders.map((r) => r.id === id ? { ...r, status } : r);
        
        if (status === 'taken' && user) {
          // Reward coins for taking medicine
          addCoins(10);
          
          // Check if all meds for today are taken
          const today = new Date().toISOString().split('T')[0];
          const todayReminders = updatedReminders.filter(r => r.date === today);
          const allTaken = todayReminders.every(r => r.status === 'taken');
          
          if (allTaken && todayReminders.length > 0) {
            addCoins(20); // Daily completion bonus
            updateStreak();
            toast.success("Perfect Day!", { description: "+20 Coins & Streak updated!" });

            // AUTOMATIC CHALLENGE PROGRESS: Medication Master
            const medChallenge = get().userChallenges.find(uc => 
              uc.profileId === get().activeProfileId && 
              !uc.isCompleted &&
              get().availableChallenges.find(c => c.id === uc.challengeId)?.category === 'medication'
            );
            if (medChallenge) {
              const lastUpdateDate = medChallenge.lastProgressUpdate?.split('T')[0];
              if (lastUpdateDate !== today) {
                get().updateChallengeProgress(medChallenge.id, 1);
              }
            }
          } else {
            toast.success("Medicine Taken!", { description: "+10 Coins earned!" });
          }

          // Find the medicine and decrement stock
          const reminder = reminders.find(r => r.id === id);
          if (reminder) {
            const med = medicines.find(m => m.id === reminder.medicineId);
            if (med && med.stock > 0) {
              updateMedicine(med.id, { stock: med.stock - 1 });
            }
          }
          
          // Check for achievements
          checkAchievements();
        }
        
        set({ reminders: updatedReminders });
      },

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),

      updateTaskStatus: (id, status) => {
        const { tasks, user, addCoins, updateStreak } = get();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updatedTasks = tasks.map((t) => t.id === id ? { ...t, status } : t);
        
        if (status === 'completed' && task.status !== 'completed') {
          if (user) {
            addCoins(5);
            updateStreak();
            toast.success("Task Completed!", { description: "+5 Coins earned!" });
          }

          if (task.recurrence && task.recurrence !== 'none') {
            const currentDate = parseISO(task.dueDate);
            let nextDate: Date;
            
            switch (task.recurrence) {
              case 'daily':
                nextDate = addDays(currentDate, 1);
                break;
              case 'weekly':
                nextDate = addWeeks(currentDate, 1);
                break;
              case 'monthly':
                nextDate = addMonths(currentDate, 1);
                break;
              default:
                nextDate = currentDate;
            }
            
            const newTask: Task = {
              ...task,
              id: Math.random().toString(36).substr(2, 9),
              dueDate: format(nextDate, 'yyyy-MM-dd'),
              status: 'pending'
            };
            
            set({ tasks: [...updatedTasks, newTask] });
            return;
          }
        }
        
        set({ tasks: updatedTasks });
      },

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      addAppointment: (appointment) => set((state) => ({
        appointments: [...state.appointments, appointment]
      })),

      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id)
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      syncData: async () => {
        // Simulate cloud sync
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        set((state) => ({
          settings: {
            ...state.settings,
            dataSync: {
              ...state.settings.dataSync,
              lastSynced: new Date().toISOString()
            }
          }
        }));
        
        toast.success("Cloud Synchronization Successful", {
          description: "All your medical records and schedules are up to date."
        });
      },

      updateLifestyle: (profileId, lifestyle) => set((state) => ({
        profiles: state.profiles.map(p => p.id === profileId ? { ...p, lifestyle } : p)
      })),

      getAdherenceData: () => {
        const { reminders } = get();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
          const dayReminders = reminders.filter(r => r.date === date);
          return {
            date,
            taken: dayReminders.filter(r => r.status === 'taken').length,
            total: dayReminders.length
          };
        });
      },

      get30DayAdherenceData: () => {
        const { reminders } = get();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        return last30Days.map(date => {
          const dayReminders = reminders.filter(r => r.date === date);
          return {
            date,
            taken: dayReminders.filter(r => r.status === 'taken').length,
            total: dayReminders.length
          };
        });
      },

      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString()
        }]
      })),

      clearChat: () => set({
        chatHistory: [
          {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your MediPulse Assistant. How can I help you with your health journey today?",
            timestamp: new Date().toISOString()
          }
        ]
      }),

      addCoins: (amount) => set((state) => ({
        user: state.user ? { ...state.user, coins: state.user.coins + amount } : null
      })),

      spendCoins: (amount) => {
        const { user } = get();
        if (!user || user.coins < amount) return false;
        set((state) => ({
          user: state.user ? { ...state.user, coins: state.user.coins - amount } : null
        }));
        return true;
      },
      
      addBalance: (amount) => set((state) => ({
        user: state.user ? { ...state.user, balance: state.user.balance + amount } : null
      })),
      
      withdrawBalance: (amount) => {
        const { user } = get();
        if (!user || user.balance < amount) return false;
        set((state) => ({
          user: state.user ? { ...state.user, balance: state.user.balance - amount } : null
        }));
        return true;
      },

      updateStreak: () => set((state) => {
        if (!state.user) return state;
        const newStreak = state.user.streak + 1;
        const newMaxStreak = Math.max(state.user.maxStreak, newStreak);
        
        return {
          user: { 
            ...state.user, 
            streak: newStreak,
            maxStreak: newMaxStreak
          }
        };
      }),

      checkAchievements: () => {
        const { user, reminders, medicines, profiles } = get();
        if (!user) return;

        const achievements: Achievement[] = [...(user.achievements || [])];
        let changed = false;

        // 7-Day Warrior
        if (user.streak >= 7 && !achievements.find(a => a.id === 'streak-7')) {
          achievements.push({
            id: 'streak-7',
            title: '7-Day Warrior',
            description: 'Maintain a 7-day medication streak.',
            icon: 'Trophy',
            unlockedAt: new Date().toISOString(),
            progress: 100,
            type: 'streak'
          });
          toast.success("Achievement Unlocked!", { description: "7-Day Warrior" });
          changed = true;
        }

        // Perfect Week (all taken for 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        });
        
        const perfectWeek = last7Days.every(date => {
          const dayReminders = reminders.filter(r => r.date === date);
          return dayReminders.length > 0 && dayReminders.every(r => r.status === 'taken');
        });

        if (perfectWeek && !achievements.find(a => a.id === 'perfect-week')) {
          achievements.push({
            id: 'perfect-week',
            title: 'Perfect Week',
            description: 'Take all your medicines for 7 consecutive days.',
            icon: 'CheckCircle2',
            unlockedAt: new Date().toISOString(),
            progress: 100,
            type: 'adherence'
          });
          toast.success("Achievement Unlocked!", { description: "Perfect Week" });
          changed = true;
        }

        if (changed) {
          set((state) => ({
            user: state.user ? { ...state.user, achievements } : null
          }));
        }
      },

      incrementAiQuery: () => {
        const { user } = get();
        if (!user) return false;
        
        const today = new Date().toISOString().split('T')[0];
        const isNewDay = user.lastAiQueryDate !== today;
        
        const currentQueries = isNewDay ? 0 : user.aiQueriesToday;
        
        const limits = {
          basic: 5,
          pro: 50,
          premium: 1000, // Unlimited
          family_plus: 1000
        };
        
        if (currentQueries >= limits[user.tier]) {
          return false;
        }
        
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            aiQueriesToday: currentQueries + 1,
            lastAiQueryDate: today
          } : null
        }));
        return true;
      },

      checkDailyLogin: () => {
        const { user, addCoins } = get();
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        if (user.lastLogin !== today) {
          addCoins(5);
          set((state) => ({
            user: state.user ? { ...state.user, lastLogin: today } : null
          }));
          toast.success('Daily Login Bonus!', {
            description: 'You earned 5 coins for logging in today.'
          });
        }
      },

      generateReminders: () => {
        const { medicines, reminders } = get();
        const today = new Date();
        const newReminders: Reminder[] = [];
        
        medicines.forEach(med => {
          for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Check if reminders for this med and date already exist in store or new batch
            const existsInStore = reminders.some(r => r.medicineId === med.id && r.date === dateStr);
            const existsInNew = newReminders.some(r => r.medicineId === med.id && r.date === dateStr);
            
            if (existsInStore || existsInNew) continue;

            let shouldAdd = false;
            if (med.frequency === 'Daily' || med.frequency === 'Twice Daily' || med.frequency === 'Three Times Daily') {
              shouldAdd = true;
            } else if (med.frequency === 'Weekly') {
              const startDate = new Date(med.startDate);
              const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays % 7 === 0) shouldAdd = true;
            } else if (med.frequency === 'Specific Days' && med.selectedDays) {
              const dayOfWeek = currentDate.getDay();
              if (med.selectedDays.includes(dayOfWeek)) {
                shouldAdd = true;
              }
            } else if (med.frequency === 'Every X Days' && med.intervalDays) {
              const startDate = new Date(med.startDate);
              startDate.setHours(0, 0, 0, 0);
              const checkDate = new Date(currentDate);
              checkDate.setHours(0, 0, 0, 0);
              
              const diffTime = checkDate.getTime() - startDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays >= 0 && diffDays % med.intervalDays === 0) {
                shouldAdd = true;
              }
            }

            if (shouldAdd) {
              med.times.forEach(time => {
                newReminders.push({
                  id: Math.random().toString(36).substr(2, 9),
                  profileId: med.profileId,
                  medicineId: med.id,
                  time,
                  status: 'pending',
                  date: dateStr,
                });
              });
            }
          }
        });

        if (newReminders.length > 0) {
          set((state) => ({
            reminders: [...state.reminders, ...newReminders]
          }));
        }
      },

      checkMissedReminders: () => {
        const { reminders, medicines, updateReminderStatus, settings, notifyCaregiver } = get();
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const currentTime = format(now, 'HH:mm');

        reminders.forEach(r => {
          if (r.date === today && r.status === 'pending' && r.time < currentTime) {
            const med = medicines.find(m => m.id === r.medicineId);
            updateReminderStatus(r.id, 'missed');
            
            // Critical dose notification
            if (med?.priority === 'critical' && settings.notifications.pushEnabled) {
              import('../services/notificationService').then(({ notificationService }) => {
                notificationService.sendCritical(
                  `URGENT: Missed Critical Dose`,
                  `You missed your critical dose of ${med.name} at ${r.time}. Please take it as soon as possible.`
                );
              });
            }

            if (med?.priority === 'critical' && settings.caregiverAlerts?.enabled) {
              notifyCaregiver(med.name, r.time);
            }
          }
        });
      },

      notifyCaregiver: async (medName: string, time: string) => {
        const { settings, user } = get();
        if (!settings.caregiverAlerts?.enabled || (!settings.caregiverAlerts.email && !settings.caregiverAlerts.phone)) return;

        try {
          // Push notification for the guardian (if they are also using the app in this session, simulated)
          if (settings.notifications.pushEnabled) {
            import('../services/notificationService').then(({ notificationService }) => {
              notificationService.sendCritical(
                `GUARDIAN ALERT: ${medName}`,
                `${user?.name || 'A family member'} missed their critical medication at ${time}.`
              );
            });
          }

          console.log(`[CAREGIVER ALERT] Sending notification to ${settings.caregiverAlerts.email || settings.caregiverAlerts.phone} for missed ${medName} at ${time}`);
          
          await fetch('/api/caregiver/alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetEmail: settings.caregiverAlerts.email,
              targetPhone: settings.caregiverAlerts.phone,
              medName,
              time,
              userName: user?.name || 'A MediPulse User'
            })
          });
        } catch (error) {
          console.error("Failed to notify caregiver:", error);
        }
      },

      addVitalSign: (vital) => {
        const { settings, notifyCaregiver, userChallenges, availableChallenges, activeProfileId, updateChallengeProgress } = get();
        
        // Critical vital detection
        if (vital.status === 'critical' && settings.caregiverAlerts?.enabled) {
          notifyCaregiver(`CRITICAL VITAL: ${vital.type}`, `Value: ${vital.value} ${vital.unit}`);
        }

        // AUTOMATIC CHALLENGE PROGRESS: Steps or Sleep
        if (vital.type === 'steps' && parseInt(vital.value) >= 10000) {
          const today = new Date().toISOString().split('T')[0];
          const stepChallenge = userChallenges.find(uc => 
            uc.profileId === activeProfileId && 
            !uc.isCompleted &&
            availableChallenges.find(c => c.id === uc.challengeId)?.category === 'steps'
          );
          if (stepChallenge) {
            const lastUpdateDate = stepChallenge.lastProgressUpdate?.split('T')[0];
            if (lastUpdateDate !== today) {
              updateChallengeProgress(stepChallenge.id, 1);
            }
          }
        }

        set((state) => ({ vitals: [vital, ...state.vitals] }));
      },
      deleteVitalSign: (id) => set((state) => ({ vitals: state.vitals.filter(v => v.id !== id) })),
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
      deleteReport: (id) => set((state) => ({ reports: state.reports.filter(r => r.id !== id) })),
      addSymptom: (symptom) => set((state) => ({ symptoms: [symptom, ...state.symptoms] })),
      deleteSymptom: (id) => set((state) => ({ symptoms: state.symptoms.filter(s => s.id !== id) })),
      
      addMeal: (meal) => {
        const { userChallenges, availableChallenges, activeProfileId, updateChallengeProgress } = get();
        
        // AUTOMATIC CHALLENGE PROGRESS: Nutrition
        if (meal.healthyRemarks && meal.healthyRemarks.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const dietChallenge = userChallenges.find(uc => 
            uc.profileId === activeProfileId && 
            !uc.isCompleted &&
            availableChallenges.find(c => c.id === uc.challengeId)?.category === 'nutrition'
          );
          if (dietChallenge) {
            const lastUpdateDate = dietChallenge.lastProgressUpdate?.split('T')[0];
            if (lastUpdateDate !== today) {
              updateChallengeProgress(dietChallenge.id, 1);
            }
          }
        }

        set((state) => ({ meals: [meal, ...state.meals] }));
      },
      deleteMeal: (id) => set((state) => ({ meals: state.meals.filter(m => m.id !== id) })),
      
      sideEffectAnalysis: null,

      analyzeSideEffects: async () => {
        const state = get();
        const { medicines, symptoms, activeProfileId } = state;
        if (!activeProfileId || symptoms.length === 0) return;

        try {
          const { extractMedicineInfo } = await import('../services/aiService');
          const recentSymptoms = symptoms.filter(s => s.profileId === activeProfileId).slice(0, 10);
          const activeMeds = medicines.filter(m => m.profileId === activeProfileId);
          
          const prompt = `As a clinical AI, analyze potential correlations between these medications and symptoms:
            Meds: ${JSON.stringify(activeMeds.map(m => ({ name: m.name, dose: m.dosage })))}
            Symptoms: ${JSON.stringify(recentSymptoms.map(s => ({ name: s.name, severity: s.severity, notes: s.notes })))}
            Provide a JSON response with: { correlations: Array<{ med: string, symptom: string, likelihood: string, advice: string }>, summary: string }`;

          const { getChatResponse } = await import('../services/aiService');
          const responseText = await getChatResponse([], prompt, { 
            medicines: activeMeds, 
            reminders: [], 
            profile: state.profiles.find(p => p.id === activeProfileId) 
          });
          
          // Basic JSON extraction from AI response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          set({ sideEffectAnalysis: result });
        } catch (error) {
          console.error("Side effect analysis failed:", error);
        }
      },

      generateClinicalReport: async () => {
        const { default: jsPDF } = await import('jspdf');
        const state = get();
        const doc = new jsPDF();
        const profile = state.profiles.find(p => p.id === state.activeProfileId);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text('MediPulse Clinical Report', 20, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);

        // Patient Info
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text('Patient Information', 20, 45);
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(20, 47, 190, 47);
        
        doc.setFontSize(11);
        doc.text(`Name: ${profile?.name || 'N/A'}`, 25, 55);
        doc.text(`Age: ${profile?.age || 'N/A'}`, 25, 62);
        doc.text(`Conditions: ${profile?.conditions?.join(', ') || 'None'}`, 25, 69);
        doc.text(`Allergies: ${profile?.allergies?.join(', ') || 'None'}`, 25, 76);

        // Active Medications
        doc.setFontSize(14);
        doc.text('Active Medications', 20, 95);
        doc.line(20, 97, 190, 97);
        
        const meds = state.medicines.filter(m => m.profileId === state.activeProfileId);
        let y = 105;
        meds.forEach(m => {
          doc.setFontSize(10);
          doc.text(`• ${m.name}: ${m.dosage} - ${m.frequency}`, 25, y);
          y += 7;
        });

        // Adherence
        doc.setFontSize(14);
        doc.text('Treatment Adherence (Last 30 Days)', 20, 140);
        doc.line(20, 142, 190, 142);
        const logs = state.reminders.filter(r => r.profileId === state.activeProfileId && r.status !== 'pending');
        const takenCount = logs.filter(r => r.status === 'taken').length;
        const totalCount = logs.length;
        const adherencePct = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;
        
        doc.setFontSize(11);
        doc.text(`Doses Taken: ${takenCount} / ${totalCount}`, 25, 150);
        doc.text(`Adherence Rate: ${Math.round(adherencePct)}%`, 25, 157);

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text('Confidential Health Document - Generated by MediPulse AI', 105, 285, { align: 'center' });
        }

        return doc.output('blob');
      },

      generateAIInsights: async () => {
        const { profiles, activeProfileId, vitals, medicines, reminders, symptoms, meals } = get();
        const profile = profiles.find(p => p.id === activeProfileId);
        if (!profile) return;

        set({ isGeneratingInsights: true });
        try {
          const { generateHealthInsights } = await import('../services/aiService');
          const insights = await generateHealthInsights(
            profile,
            vitals.filter(v => v.profileId === activeProfileId),
            medicines.filter(m => m.profileId === activeProfileId),
            reminders.filter(r => r.profileId === activeProfileId),
            symptoms.filter(s => s.profileId === activeProfileId),
            meals.filter(m => m.profileId === activeProfileId)
          );
          set({ healthInsights: insights });
        } catch (error) {
          console.error("Failed to generate health insights:", error);
          toast.error("Failed to analyze health patterns. Please try again later.");
        } finally {
          set({ isGeneratingInsights: false });
        }
      },
      
      nudgeFamilyMember: (id) => {
        const member = get().familyMembers.find(m => m.id === id);
        if (member) {
          toast.success(`Nudge sent to ${member.name}`, {
            description: "They'll receive a reminder to take their medicine immediately."
          });
        }
      },
      
      highFiveFamilyMember: (id) => {
        const member = get().familyMembers.find(m => m.id === id);
        if (member) {
          get().addCoins(5); // Reward current user for encouraging
          toast.success(`High-Five sent to ${member.name}!`, {
            description: "You've earned 5 coins for being an amazing cheerleader."
          });
        }
      },

      addToCart: (medId) => {
        const { cart, user } = get();
        const existing = cart.find(item => item.medId === medId);
        let newCart;
        if (existing) {
          newCart = cart.map(item => item.medId === medId ? { ...item, qty: item.qty + 1 } : item);
        } else {
          newCart = [...cart, { medId, qty: 1 }];
        }
        set({ cart: newCart });
        
        if (user) {
          const cartRef = doc(db, `users/${user.id}/marketplace/cart`);
          setDoc(cartRef, { items: newCart, updatedAt: serverTimestamp() }, { merge: true })
            .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/marketplace/cart`));
        }
      },

      removeFromCart: (medId) => {
        const { cart, user } = get();
        const newCart = cart.filter(item => item.medId !== medId);
        set({ cart: newCart });
        
        if (user) {
          const cartRef = doc(db, `users/${user.id}/marketplace/cart`);
          setDoc(cartRef, { items: newCart, updatedAt: serverTimestamp() }, { merge: true })
            .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/marketplace/cart`));
        }
      },

      updateCartQty: (medId, qty) => {
        const { cart, user } = get();
        const newCart = cart.map(item => item.medId === medId ? { ...item, qty: Math.max(0, qty) } : item).filter(i => i.qty > 0);
        set({ cart: newCart });
        
        if (user) {
          const cartRef = doc(db, `users/${user.id}/marketplace/cart`);
          setDoc(cartRef, { items: newCart, updatedAt: serverTimestamp() }, { merge: true })
            .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/marketplace/cart`));
        }
      },

      clearCart: () => {
        const { user } = get();
        set({ cart: [] });
        
        if (user) {
          const cartRef = doc(db, `users/${user.id}/marketplace/cart`);
          setDoc(cartRef, { items: [], updatedAt: serverTimestamp() }, { merge: true })
            .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/marketplace/cart`));
        }
      },

      joinChallenge: (challengeId) => {
        const { user, activeProfileId, userChallenges, availableChallenges } = get();
        if (!user) return;
        
        const challenge = availableChallenges.find(c => c.id === challengeId);
        if (!challenge) return;

        const isAlreadyJoined = userChallenges.some(uc => uc.challengeId === challengeId && uc.profileId === activeProfileId);
        if (isAlreadyJoined) {
          toast.error("You're already in this challenge!");
          return;
        }

        const newChallenge: UserChallenge = {
          id: Math.random().toString(36).substr(2, 9),
          challengeId,
          userId: user.id,
          profileId: activeProfileId,
          startDate: new Date().toISOString(),
          progress: 0,
          isCompleted: false,
          claimedReward: false
        };

        set({ userChallenges: [...userChallenges, newChallenge] });
        toast.success(`Joined ${challenge.title}!`, { description: "Time to get started!" });

        // Firestore sync
        const challengeRef = doc(db, `users/${user.id}/profiles/${activeProfileId}/challenges/${newChallenge.id}`);
        setDoc(challengeRef, { ...newChallenge, createdAt: serverTimestamp() })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.id}/profiles/${activeProfileId}/challenges/${newChallenge.id}`));
      },

      updateChallengeProgress: (id, amount) => {
        const { user, activeProfileId, userChallenges, availableChallenges } = get();
        if (!user) return;

        const uc = userChallenges.find(c => c.id === id);
        if (!uc || uc.isCompleted) return;

        const challenge = availableChallenges.find(c => c.id === uc.challengeId);
        if (!challenge) return;

        const newProgress = Math.min(uc.progress + amount, challenge.targetValue);
        const isCompleted = newProgress === challenge.targetValue;
        const now = new Date().toISOString();

        const updatedChallenges = userChallenges.map(c => 
          c.id === id ? { 
            ...c, 
            progress: newProgress, 
            isCompleted,
            lastProgressUpdate: now
          } : c
        );

        set({ userChallenges: updatedChallenges });

        if (isCompleted) {
          toast.success(`Challenge Completed: ${challenge.title}!`, {
            description: `Click claim on the challenges page to earn ${challenge.rewardCoins} coins!`
          });
        } else {
          // Motivational feedback
          const milestones = [0.25, 0.5, 0.75];
          const oldPct = uc.progress / challenge.targetValue;
          const newPct = newProgress / challenge.targetValue;
          
          const reachedMilestone = milestones.find(m => oldPct < m && newPct >= m);
          if (reachedMilestone) {
            const feedbacks = [
              "Great start! You're making progress.",
              "Halfway there! Keep up the momentum.",
              "Almost finished! Just a final push."
            ];
            const feedback = feedbacks[milestones.indexOf(reachedMilestone)];
            toast(`Progressing: ${challenge.title}`, {
              description: feedback
            });
          }
        }

        // Firestore sync
        const challengeRef = doc(db, `users/${user.id}/profiles/${activeProfileId}/challenges/${id}`);
        updateDoc(challengeRef, { progress: newProgress, isCompleted, updatedAt: serverTimestamp() })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}/profiles/${activeProfileId}/challenges/${id}`));
      },

      claimChallengeReward: (id) => {
        const { user, activeProfileId, userChallenges, availableChallenges, addCoins } = get();
        if (!user) return;

        const uc = userChallenges.find(c => c.id === id);
        if (!uc || !uc.isCompleted || uc.claimedReward) return;

        const challenge = availableChallenges.find(c => c.id === uc.challengeId);
        if (!challenge) return;

        const updatedChallenges = userChallenges.map(c => 
          c.id === id ? { ...c, claimedReward: true } : c
        );

        set({ userChallenges: updatedChallenges });
        addCoins(challenge.rewardCoins);
        toast.success(`Reward Claimed!`, { description: `Received ${challenge.rewardCoins} coins.` });

        // Firestore sync
        const challengeRef = doc(db, `users/${user.id}/profiles/${activeProfileId}/challenges/${id}`);
        updateDoc(challengeRef, { claimedReward: true, rewardClaimedAt: serverTimestamp() })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}/profiles/${activeProfileId}/challenges/${id}`));
      },

      logWater: (glasses) => {
        const today = new Date().toISOString().split('T')[0];
        const currentIntake = get().waterIntake[today] || 0;
        const newIntake = glasses;
        
        set((state) => ({
          waterIntake: { ...state.waterIntake, [today]: newIntake }
        }));

        // Trigger challenge progress if goal reached (8 glasses)
        if (newIntake >= 8 && currentIntake < 8) {
          const waterChallenge = get().userChallenges.find(uc => 
            uc.profileId === get().activeProfileId && 
            !uc.isCompleted &&
            get().availableChallenges.find(c => c.id === uc.challengeId)?.category === 'water'
          );
          if (waterChallenge) {
            get().updateChallengeProgress(waterChallenge.id, 1);
          }
          toast.success("Daily Hydration Goal Met!", { description: "+1 count to your challenge." });
        }
      },
    }),
    {
      name: 'MediPulse-storage',
    }
  )
);
