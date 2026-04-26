import { create } from 'zustand'; // I'll install zustand for easier state management
import { Medicine, Reminder, User, ChatMessage, Profile, Task, Settings } from '../types';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';

interface AppState {
  user: User | null;
  profiles: Profile[];
  activeProfileId: string;
  medicines: Medicine[];
  reminders: Reminder[];
  tasks: Task[];
  settings: Settings;
  isPremium: boolean;
  chatHistory: ChatMessage[];
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, name: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setActiveProfile: (id: string) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, profile: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  setTier: (tier: User['tier']) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminderStatus: (id: string, status: Reminder['status']) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  syncData: () => Promise<void>;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addBalance: (amount: number) => void;
  withdrawBalance: (amount: number) => boolean;
  updateStreak: () => void;
  incrementAiQuery: () => boolean;
  checkDailyLogin: () => void;
  generateReminders: () => void;
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
      settings: {
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
        }
      },
      isPremium: false,
      isAuthenticated: false,
      chatHistory: [
        {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your MediMind Assistant. How can I help you with your health journey today?",
          timestamp: new Date().toISOString()
        }
      ],

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
          aiQueriesToday: 0,
          lastAiQueryDate: new Date().toISOString().split('T')[0],
        },
        isAuthenticated: true
      }),

      logout: () => set({ user: null, isAuthenticated: false }),

      setUser: (user) => set({ user }),

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

      setTier: (tier) => set((state) => ({ 
        user: state.user ? { ...state.user, tier, isPremium: tier !== 'basic' } : null,
        isPremium: tier !== 'basic'
      })),

      addReminder: (reminder) => set((state) => ({
        reminders: [...state.reminders, reminder]
      })),

      updateReminderStatus: (id: string, status) => {
        const { reminders, user, medicines, updateMedicine, addCoins, updateStreak } = get();
        const updatedReminders = reminders.map((r) => r.id === id ? { ...r, status } : r);
        
        if (status === 'taken' && user) {
          // Reward coins for taking medicine
          addCoins(10);

          // Check if all meds for today are taken
          const today = new Date().toISOString().split('T')[0];
          const todayReminders = updatedReminders.filter(r => r.date === today);
          const allTaken = todayReminders.every(r => r.status === 'taken');
          if (allTaken && todayReminders.length > 0) {
            addCoins(10); // Bonus for taking all medicines
          }

          // Find the medicine and decrement stock
          const reminder = reminders.find(r => r.id === id);
          if (reminder) {
            const med = medicines.find(m => m.id === reminder.medicineId);
            if (med && med.stock > 0) {
              updateMedicine(med.id, { stock: med.stock - 1 });
            }
          }
        }
        
        set({ reminders: updatedReminders });
      },

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),

      updateTaskStatus: (id, status) => set((state) => {
        const task = state.tasks.find(t => t.id === id);
        const updatedTasks = state.tasks.map((t) => t.id === id ? { ...t, status } : t);
        
        if (status === 'completed' && task && task.recurrence && task.recurrence !== 'none') {
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
          
          return { tasks: [...updatedTasks, newTask] };
        }
        
        return { tasks: updatedTasks };
      }),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      syncData: async () => {
        // Simulate cloud sync
        return new Promise((resolve) => setTimeout(resolve, 1500));
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
            content: "Hi! I'm your MediMind Assistant. How can I help you with your health journey today?",
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
        let bonus = 0;
        if (newStreak === 3) bonus = 20;
        if (newStreak === 7) bonus = 50;
        
        return {
          user: { 
            ...state.user, 
            streak: newStreak, 
            coins: state.user.coins + bonus 
          }
        };
      }),

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
        const { medicines, reminders, addReminder } = get();
        const today = new Date();
        
        medicines.forEach(med => {
          for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Check if reminders for this med and date already exist
            const exists = reminders.some(r => r.medicineId === med.id && r.date === dateStr);
            if (exists) continue;

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
                addReminder({
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
      },
    }),
    {
      name: 'medimind-storage',
    }
  )
);
