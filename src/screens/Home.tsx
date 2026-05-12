import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format, differenceInMinutes, parseISO, isAfter } from 'date-fns';
import { Check, Clock, AlertCircle, ChevronRight, Flame, Camera, MessageSquare, Bell, Activity, Sun, Moon, Heart, Search, X, FileText, Watch, Smartphone, Plus, CheckCircle2, Pill, ShieldCheck, ShoppingCart, IdCard, Trophy, Users, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WeatherWidget } from '../components/WeatherWidget';
import { StepTrackerWidget } from '../components/StepTrackerWidget';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medicine, Reminder } from '../types';
import { AIVisionWidget } from '../components/AIVisionWidget';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { MedicalBackground } from '../components/MedicalBackground';
import { AbhaAuthModal } from '../components/AbhaAuthModal';
import { extractMedicineInfo } from '../services/aiService';
import { AIHealthInsights } from '../components/AIHealthInsights';
import { DynamicFeed } from '../components/DynamicFeed';
import { HealthTips } from '../components/HealthTips';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { playSuccessSound } from '../lib/audio';

interface HomeProps {
  onOpenAI: () => void;
  onScanComplete: (info: any[]) => void;
  onShowMarketplace: () => void;
  onShowVitals: () => void;
  onShowSymptoms: () => void;
  onShowLabAnalyzer: () => void;
  onShowFitness: () => void;
  onViewHistory: () => void;
  onShowPillIdentifier: () => void;
  onShowInteractions: () => void;
  onShowChallenges: () => void;
  onShowVault: () => void;
  onShowFamily: () => void;
  onShowLeaderboard: () => void;
  onShowDiet: () => void;
  onShowAIDietician: () => void;
  onShowMediPass: () => void;
}

export const Home: React.FC<HomeProps> = ({ 
  onOpenAI, onScanComplete, onShowMarketplace, 
  onShowVitals, onShowSymptoms, onShowLabAnalyzer, onShowFitness, 
  onViewHistory, onShowPillIdentifier, onShowInteractions, onShowChallenges,
  onShowVault,
  onShowFamily, onShowLeaderboard, onShowDiet, onShowAIDietician, onShowMediPass
}) => {
  const medicines = useStore(state => state.medicines);
  const reminders = useStore(state => state.reminders);
  const updateReminderStatus = useStore(state => state.updateReminderStatus);
  const user = useStore(state => state.user);
  const activeProfileId = useStore(state => state.activeProfileId);
  const profiles = useStore(state => state.profiles);
  const checkDailyLogin = useStore(state => state.checkDailyLogin);
  const tasks = useStore(state => state.tasks);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const symptoms = useStore(state => state.symptoms);
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  const vitals = useStore(state => state.vitals);
  const healthInsights = useStore(state => state.healthInsights);
  const generateAIInsights = useStore(state => state.generateAIInsights);
  const isGeneratingInsights = useStore(state => state.isGeneratingInsights);
  const addVitalSign = useStore(state => state.addVitalSign);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [isAppleHealthSyncing, setIsAppleHealthSyncing] = useState(false);
  const [isGoogleFitSyncing, setIsGoogleFitSyncing] = useState(false);
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [isAbhaSyncing, setIsAbhaSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [completingTasks, setCompletingTasks] = useState<Record<string, boolean>>({});
  const [showTakenHistory, setShowTakenHistory] = useState(false);
  const [nextDose, setNextDose] = useState<{ med: Medicine, reminder: Reminder } | null>(null);

  const handleAbhaSync = () => {
    if (!settings.abhaConnected) {
      setShowAbhaModal(true);
    } else {
      setIsAbhaSyncing(true);
      toast.info('Syncing latest records from ABHA...');
      
      setTimeout(() => {
        setIsAbhaSyncing(false);
        toast.success('ABHA Sync Complete', { description: 'Your health records are up to date.' });
      }, 1500);
    }
  };

  const disconnectAbha = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings({ abhaConnected: false, abhaId: undefined });
    toast.info('ABHA disconnected');
  };

  useEffect(() => {
    checkDailyLogin();
    
    // Auto-generate insights if they don't exist
    if (healthInsights.length === 0 && !isGeneratingInsights) {
      generateAIInsights();
    }
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const today = format(new Date(), 'yyyy-MM-dd');

  const profileReminders = React.useMemo(() => 
    reminders.filter(r => r.profileId === activeProfileId && r.date === today),
    [reminders, activeProfileId, today]
  );

  const profileTasks = React.useMemo(() => 
    tasks.filter(t => t.profileId === activeProfileId && t.dueDate === today && t.status === 'pending'),
    [tasks, activeProfileId, today]
  );
  
  const takenCount = profileReminders.filter(r => r.status === 'taken').length;
  const totalCount = profileReminders.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  const globalSearchMedicines = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return medicines.filter(m => 
      m.profileId === activeProfileId && 
      (m.name.toLowerCase().includes(query) || (m.type && m.type.toLowerCase().includes(query)) || (m.dosage && m.dosage.toLowerCase().includes(query)))
    );
  }, [searchQuery, medicines, activeProfileId]);

  const globalSearchTasks = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return tasks.filter(t => 
      t.profileId === activeProfileId && 
      t.title.toLowerCase().includes(query)
    );
  }, [searchQuery, tasks, activeProfileId]);

  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim() || !text) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-primary/20 text-primary font-bold px-0.5 rounded">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const filteredReminders = React.useMemo(() => {
    return profileReminders;
  }, [profileReminders]);

  const filteredTasks = React.useMemo(() => {
    return profileTasks;
  }, [profileTasks]);

  useEffect(() => {
    const findNextDose = () => {
      const now = new Date();
      const pending = profileReminders
        .filter(r => r.status === 'pending')
        .map(r => {
          const [hours, minutes] = r.time.split(':').map(Number);
          const doseTime = new Date();
          doseTime.setHours(hours, minutes, 0, 0);
          return { reminder: r, time: doseTime };
        })
        .filter(r => isAfter(r.time, now))
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      if (pending.length > 0) {
        const med = medicines.find(m => m.id === pending[0].reminder.medicineId);
        if (med) {
          // Only update if it's actually different to avoid unnecessary re-renders
          const next = { med, reminder: pending[0].reminder };
          setNextDose(prev => {
            if (prev?.reminder.id === next.reminder.id && prev?.reminder.status === next.reminder.status) {
              return prev;
            }
            return next;
          });
        }
      } else {
        setNextDose(prev => prev === null ? null : null);
      }
    };

    findNextDose();
    const interval = setInterval(findNextDose, 60000);
    return () => clearInterval(interval);
  }, [profileReminders, medicines, today]);

  const [isSmartwatchSyncing, setIsSmartwatchSyncing] = useState(false);

  const handleAppleHealthSync = () => {
    if (!settings.appleHealthConnected) {
      setIsAppleHealthSyncing(true);
      toast.info('Connecting to Apple Health...', { description: 'Please authorize access on your iOS device.' });
      
      setTimeout(() => {
        updateSettings({ appleHealthConnected: true });
        toast.success('Apple Health Connected!', { description: 'Syncing your historical vitals...' });
        
        setTimeout(() => {
          setIsAppleHealthSyncing(false);
          addVitalSign({
            id: Math.random().toString(36).substring(7),
            profileId: activeProfileId,
            userId: user?.id || 'unknown',
            type: 'heart_rate',
            value: '68',
            unit: 'BPM',
            timestamp: new Date().toISOString(),
            status: 'normal',
            source: 'wearable',
            confidenceScore: 98
          });
          toast.success('Apple Health Sync Complete', { description: 'Your health data is now up to date.' });
        }, 2000);
      }, 2000);
    } else {
      setIsAppleHealthSyncing(true);
      toast.info('Syncing Apple Health...');
      
      setTimeout(() => {
        setIsAppleHealthSyncing(false);
        addVitalSign({
          id: Math.random().toString(36).substring(7),
          profileId: activeProfileId,
          userId: user?.id || 'unknown',
          type: 'blood_pressure',
          value: '118/79',
          unit: 'mmHg',
          timestamp: new Date().toISOString(),
          status: 'normal',
          source: 'wearable',
          confidenceScore: 95
        });
        toast.success('Apple Health Sync Complete', { description: 'Your health data is now up to date.' });
      }, 1500);
    }
  };

  const handleSmartwatchSync = () => {
    if (!settings.smartwatchConnected) {
      setIsSmartwatchSyncing(true);
      toast.info('Scanning for BLE devices...', { description: 'Please ensure your smartwatch is nearby.' });
      
      setTimeout(() => {
        updateSettings({ smartwatchConnected: true, smartwatchName: 'Garmin Forerunner' });
        toast.success('Smartwatch Paired!', { description: 'Live vitals sync active.' });
        
        setTimeout(() => {
          setIsSmartwatchSyncing(false);
          addVitalSign({
            id: Math.random().toString(36).substring(7),
            profileId: activeProfileId,
            userId: user?.id || 'unknown',
            type: 'heart_rate',
            value: '72',
            unit: 'BPM',
            timestamp: new Date().toISOString(),
            status: 'normal',
            source: 'wearable',
            confidenceScore: 99
          });
        }, 1500);
      }, 2000);
    } else {
      setIsSmartwatchSyncing(true);
      toast.info('Syncing Smartwatch...');
      
      setTimeout(() => {
        setIsSmartwatchSyncing(false);
        addVitalSign({
          id: Math.random().toString(36).substring(7),
          profileId: activeProfileId,
          userId: user?.id || 'unknown',
          type: 'heart_rate',
          value: '75',
          unit: 'BPM',
          timestamp: new Date().toISOString(),
          status: 'normal',
          source: 'wearable',
          confidenceScore: 99
        });
        toast.success('Watch Sync Complete', { description: 'Heart rate updated.' });
      }, 1500);
    }
  };

  const disconnectSmartwatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings({ smartwatchConnected: false, smartwatchName: undefined });
    toast.info('Smartwatch disconnected');
  };

  const handleGoogleFitSync = () => {
    if (!settings.googleFitConnected) {
      setIsGoogleFitSyncing(true);
      toast.info('Connecting to Google Fit...', { description: 'Please authorize access via your Google account.' });
      
      setTimeout(() => {
        updateSettings({ googleFitConnected: true });
        toast.success('Google Fit Connected!', { description: 'Syncing your historical vitals...' });
        
        setTimeout(() => {
          setIsGoogleFitSyncing(false);
          addVitalSign({
            id: Math.random().toString(36).substring(7),
            profileId: activeProfileId,
            userId: user?.id || 'unknown',
            type: 'heart_rate',
            value: '72',
            unit: 'BPM',
            timestamp: new Date().toISOString(),
            status: 'normal',
            source: 'wearable',
            confidenceScore: 99
          });
          toast.success('Google Fit Sync Complete', { description: 'Your health data is now up to date.' });
        }, 2000);
      }, 2000);
    } else {
      setIsGoogleFitSyncing(true);
      toast.info('Syncing Google Fit...');
      
      setTimeout(() => {
        setIsGoogleFitSyncing(false);
        addVitalSign({
          id: Math.random().toString(36).substring(7),
          profileId: activeProfileId,
          userId: user?.id || 'unknown',
          type: 'steps',
          value: '8432',
          unit: 'steps',
          timestamp: new Date().toISOString(),
          status: 'normal',
          source: 'wearable',
          confidenceScore: 98
        });
        toast.success('Google Fit Sync Complete', { description: 'Your health data is now up to date.' });
      }, 1500);
    }
  };

  const disconnectAppleHealth = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings({ appleHealthConnected: false });
    toast.info('Apple Health disconnected');
  };

  const disconnectGoogleFit = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings({ googleFitConnected: false });
    toast.info('Google Fit disconnected');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Scanning prescription...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const info = await extractMedicineInfo(base64, file.type);
        toast.dismiss(toastId);
        toast.success('Scan complete!');
        onScanComplete(info);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('Failed to scan prescription');
    }
  };

  const getMotivationalMessage = () => {
    if (progress === 100) return "Perfect adherence! You're doing amazing today.";
    if (progress >= 50) return "Great job! You're more than halfway there.";
    if (totalCount === 0) return "No medicines scheduled for today. Stay healthy!";
    return "Keep it up! Consistency is key to your recovery.";
  };

  return (
    <div className="pb-32 min-h-screen transition-colors duration-300 relative">
      <MedicalBackground />

      <div className="p-6 space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <div id="home-logo-container" className="relative flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-[14px] shadow-lg shadow-primary/5 shrink-0 border border-primary/20">
              <svg id="home-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <div id="home-logo-badge" className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                <Plus size={12} className="text-white" strokeWidth={4} />
              </div>
            </div>
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black text-foreground tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
              >
                MediPulse
              </motion.h2>
              <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground mt-1">
                One App. Complete Health Care.
              </p>
            </div>
          </motion.div>

          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div className="space-y-1">
              <ProfileSwitcher />
              <h1 className="text-2xl font-display font-bold text-foreground transition-colors">Hello, {activeProfile.name.split(' ')[0]}</h1>
              <p className="text-muted-foreground text-sm font-medium transition-colors">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const newMode = !settings.darkMode;
                  updateSettings({ darkMode: newMode });
                  toast.info(newMode ? 'Dark mode activated' : 'Light mode activated');
                }}
                className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border"
              >
                {settings.darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
              </motion.button>
              <div className="flex flex-col items-end mr-1">
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <div className="w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">C</div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{user?.coins || 0}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Flame size={10} className="text-orange-500 fill-orange-500" />
                  <span className="text-[10px] font-bold text-muted-foreground">{user?.streak || 0}d</span>
                </div>
              </div>
              <Avatar className="w-12 h-12 border-2 border-background shadow-xl">
                <AvatarImage src={activeProfile.avatar} />
                <AvatarFallback className="font-bold text-white" style={{ backgroundColor: activeProfile.color }}>
                  {activeProfile.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.header>

          <DynamicFeed onShowDiet={onShowDiet} />

          {/* Gamification Hub */}
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-none bg-amber-500/10 rounded-3xl overflow-hidden relative group cursor-pointer" onClick={onShowLeaderboard}>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Trophy size={80} className="text-amber-500" />
                </div>
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Medi-Score</p>
                  <div>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-400">
                      {user?.coins || 0}
                      <span className="text-xs ml-1 opacity-60">Coins</span>
                    </p>
                    <p className="text-[9px] font-medium text-amber-600/70">Top 5% of users this week</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-indigo-500/10 rounded-3xl overflow-hidden relative group cursor-pointer" onClick={onShowChallenges}>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Flame size={80} className="text-indigo-500" />
                </div>
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Achievements</p>
                  <div>
                    <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                      {user?.achievements?.length || 0}
                      <span className="text-xs ml-1 opacity-60">Unlocked</span>
                    </p>
                    <p className="text-[9px] font-medium text-indigo-600/70">New badge available!</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Streak Highlight */}
            {user?.streak && user.streak > 0 && (
              <Card className="border-none bg-orange-500 text-white rounded-2xl p-3 shadow-lg shadow-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="fill-white" />
                    <span className="text-sm font-bold">{user.streak} Day Heat Streak!</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-none text-[10px]">GOLD TIER</Badge>
                </div>
              </Card>
            )}
          </section>

          <div className="px-1 space-y-8">
            <HealthTips />
            <AIHealthInsights />
            <WeatherWidget />
            
            <div className="space-y-4">
              <h3 className="font-display font-bold text-foreground px-1">Quick Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={onShowVault}
                  variant="outline" 
                  className="rounded-2xl h-12 bg-card border-border hover:bg-muted font-bold text-xs flex items-center justify-start gap-3 shadow-sm"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"
                  >
                    <FileText size={16} />
                  </motion.div>
                  Doc Vault
                </Button>
                <Button 
                  onClick={onShowFamily}
                  variant="outline" 
                  className="rounded-2xl h-12 bg-card border-border hover:bg-muted font-bold text-xs flex items-center justify-start gap-3 shadow-sm"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center"
                  >
                    <Users size={16} />
                  </motion.div>
                  Family Circle
                </Button>
                <Button 
                  onClick={onShowMediPass}
                  variant="outline" 
                  className="rounded-2xl h-12 bg-card border-border hover:bg-muted font-bold text-xs flex items-center justify-start gap-3 shadow-sm"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
                  >
                    <IdCard size={16} />
                  </motion.div>
                  MediPass
                </Button>
              </div>
            </div>
          </div>

        {/* Global Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group z-50 focus-within:z-50"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search medicines or tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 hover:bg-muted/50 focus:bg-muted/80 backdrop-blur-md border border-border focus:border-primary/50 text-foreground rounded-2xl py-4 pl-12 pr-12 text-sm font-medium transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          )}

          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-xl rounded-2xl overflow-hidden max-h-[60vh] overflow-y-auto"
              >
                {globalSearchMedicines.length === 0 && globalSearchTasks.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm font-medium">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-2">
                    {globalSearchMedicines.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30">
                          Medicines
                        </div>
                        {globalSearchMedicines.map(med => (
                          <div key={med.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 overflow-hidden">
                              {med.image ? (
                                <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                              ) : (
                                <AlertCircle size={14} />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">
                                <HighlightText text={med.name} highlight={searchQuery} />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <HighlightText text={`${med.dosage || ''} ${med.type || ''}`.trim()} highlight={searchQuery} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {globalSearchTasks.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30">
                          Tasks
                        </div>
                        {globalSearchTasks.map(task => (
                          <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={14} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">
                                <HighlightText text={task.title} highlight={searchQuery} />
                              </div>
                              <div className="text-xs text-muted-foreground opacity-70">
                                {task.dueDate}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Adherence Summary Section */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-foreground px-1 transition-colors">Adherence Summary</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20 overflow-hidden relative rounded-[32px]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl text-white" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 blur-3xl text-white" />
              
              <CardContent className="p-4 relative z-10 flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Daily Progress</p>
                    <p className="text-white text-xs font-medium">{takenCount} of {totalCount} doses taken</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 inline-flex items-center gap-2">
                    <p className="text-[11px] font-medium text-white leading-tight">{getMotivationalMessage()}</p>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 1.2, 
                    ease: [0.34, 1.56, 0.64, 1], // Custom spring-like cubic bezier
                    delay: 0.2 
                  }}
                  className="w-20 h-20 flex items-center justify-center relative shrink-0"
                >
                  <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="339.29"
                      initial={{ strokeDashoffset: 339.29 }}
                      animate={{ strokeDashoffset: 339.29 - (339.29 * progress) / 100 }}
                      transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                      className="text-white"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-2xl font-black text-white leading-none">
                        {Math.round(progress)}<span className="text-[10px] opacity-60">%</span>
                      </span>
                      {progress === 100 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
                          className="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full p-0.5 shadow-lg"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Step Tracker Widget */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-foreground px-1">Active Activity</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <StepTrackerWidget />
          </motion.div>
        </section>

        {/* Next Dose Countdown */}
        <AnimatePresence>
          {nextDose && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 px-1">
                <Clock size={16} className="text-primary" />
                <h3 className="font-display font-bold text-foreground">Next Dose</h3>
              </div>
              <Card className="border-none bg-card premium-card rounded-[24px] overflow-hidden transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner overflow-hidden">
                    {nextDose.med.image ? (
                      <img src={nextDose.med.image} alt={nextDose.med.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bell size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{nextDose.med.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      {nextDose.med.dosage} • {nextDose.reminder.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">In</p>
                    <p className="text-lg font-bold text-primary">
                      {differenceInMinutes(parseISO(`${today}T${nextDose.reminder.time}`), new Date())}m
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vitals Tracker Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-foreground transition-colors">Vitals Tracker</h3>
            <button 
              onClick={onShowVitals}
              className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              See All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {vitals.filter(v => v.profileId === activeProfileId).slice(0, 2).map(vital => (
              <div key={vital.id} className="bg-card border border-border p-3 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    vital.status === 'high' || vital.status === 'critical' ? 'bg-rose-500/10 text-rose-500' :
                    vital.status === 'low' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  )}>
                    {vital.type === 'heart_rate' ? <Heart size={16} /> : <Activity size={16} />}
                  </div>
                  <span className="text-xs font-bold capitalize truncate text-foreground">{vital.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-lg font-black text-foreground">{vital.value}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">{vital.unit}</span>
                </div>
              </div>
            ))}
            {vitals.filter(v => v.profileId === activeProfileId).length === 0 && (
              <div className="col-span-2 bg-muted/30 border border-dashed border-border p-4 rounded-[20px] text-center">
                <p className="text-xs text-muted-foreground font-medium">No vitals recorded yet</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={onShowVitals}
              className="min-w-[120px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <Plus size={20} />
              <span className="text-[10px] font-bold tracking-wide">Manual Log</span>
            </button>
            <Button
              onClick={handleSmartwatchSync}
              loading={isSmartwatchSyncing}
              disabled={isSmartwatchSyncing}
              className={cn(
                "min-w-[140px] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shrink-0 border relative overflow-hidden h-auto",
                settings.smartwatchConnected 
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                  : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
              )}
            >
              {settings.smartwatchConnected && !isSmartwatchSyncing && (
                <div 
                  onClick={disconnectSmartwatch}
                  className="absolute top-1 right-1 p-1 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer z-10"
                >
                  <X size={10} />
                </div>
              )}
              {settings.smartwatchConnected && !isSmartwatchSyncing ? (
                <CheckCircle2 size={20} />
              ) : !isSmartwatchSyncing && (
                <Watch size={20} />
              )}
              <span className="text-[10px] font-bold tracking-wide">
                {isSmartwatchSyncing ? (settings.smartwatchConnected ? 'Syncing...' : 'Pairing...') : settings.smartwatchConnected ? 'Sync Smartwatch' : 'Pair Smartwatch'}
              </span>
            </Button>
            <Button
              onClick={handleAppleHealthSync}
              loading={isAppleHealthSyncing}
              disabled={isAppleHealthSyncing}
              className={cn(
                "min-w-[140px] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shrink-0 border relative overflow-hidden h-auto",
                settings.appleHealthConnected 
                  ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
              )}
            >
              {settings.appleHealthConnected && !isAppleHealthSyncing && (
                <div 
                  onClick={disconnectAppleHealth}
                  className="absolute top-1 right-1 p-1 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer z-10"
                >
                  <X size={10} />
                </div>
              )}
              {settings.appleHealthConnected && !isAppleHealthSyncing ? (
                <CheckCircle2 size={20} />
              ) : !isAppleHealthSyncing && (
                <Smartphone size={20} />
              )}
              <span className="text-[10px] font-bold tracking-wide">
                {isAppleHealthSyncing ? 'Syncing...' : settings.appleHealthConnected ? 'Apple Health' : 'Connect HealthKit'}
              </span>
            </Button>

            <Button
              onClick={handleGoogleFitSync}
              loading={isGoogleFitSyncing}
              disabled={isGoogleFitSyncing}
              className={cn(
                "min-w-[140px] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shrink-0 border relative overflow-hidden h-auto",
                settings.googleFitConnected 
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                  : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
              )}
            >
              {settings.googleFitConnected && !isGoogleFitSyncing && (
                <div 
                  onClick={disconnectGoogleFit}
                  className="absolute top-1 right-1 p-1 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer z-10"
                >
                  <X size={10} />
                </div>
              )}
              {settings.googleFitConnected && !isGoogleFitSyncing ? (
                <CheckCircle2 size={20} />
              ) : !isGoogleFitSyncing && (
                <Activity size={20} />
              )}
              <span className="text-[10px] font-bold tracking-wide">
                {isGoogleFitSyncing ? 'Syncing...' : settings.googleFitConnected ? 'Google Fit' : 'Connect Google Fit'}
              </span>
            </Button>
          </div>
        </section>


        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-foreground px-1 transition-colors">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: MessageSquare, label: 'Ask AI', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', onClick: onOpenAI },
              { icon: Utensils, label: 'AI Dietician', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', onClick: onShowAIDietician },
              { icon: Utensils, label: 'Diet Tracker', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', onClick: onShowDiet },
              { icon: Activity, label: 'Vitals', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', onClick: onShowVitals },
              { icon: ShoppingCart, label: 'Pharmacy', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', onClick: onShowMarketplace },
              { icon: Pill, label: 'AI Pill ID', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', onClick: onShowPillIdentifier },
              { icon: ShieldCheck, label: 'Interactions', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', onClick: onShowInteractions },
              { icon: Trophy, label: 'Challenges', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', onClick: onShowChallenges },
              { icon: Activity, label: 'Fitness', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', onClick: onShowFitness },
              { icon: AlertCircle, label: 'Symptoms', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', onClick: onShowSymptoms },
              { icon: FileText, label: 'Reports', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', onClick: onShowLabAnalyzer },
            ].map((action, i) => (
              <motion.button 
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="bg-card p-3 rounded-[20px] shadow-sm flex flex-col items-center gap-2 transition-all border border-border group hover:border-primary/30"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner", action.color)}>
                  <action.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-foreground/80 whitespace-nowrap text-center">{action.label}</span>
              </motion.button>
            ))}
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture className="hidden" onChange={handleFileSelect} />
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </section>

        {/* AI Tools & ID Row */}
        <section className="grid grid-cols-2 gap-3">
          {/* AI Pill Identifier */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AIVisionWidget onClick={onShowPillIdentifier} />
          </motion.div>

          {/* Smart Scanner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[20px] shadow-sm flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative p-3.5 flex flex-col h-full z-10 w-full">
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shrink-0">
                  <Camera size={16} />
                </div>
              </div>
              <div className="mt-auto">
                <h4 className="text-white font-bold text-[13px] leading-tight mb-1">Smart Scanner</h4>
                <p className="text-emerald-50/90 text-[8px] leading-tight mb-3 line-clamp-2">Auto-fill prescription data from photos</p>
                <div className="flex gap-1.5 w-full">
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-white text-emerald-700 text-[9px] font-bold px-2 py-1.5 rounded-lg active:scale-95 transition-all text-center flex-1"
                  >
                    SCAN
                  </button>
                  <button 
                    onClick={() => galleryInputRef.current?.click()}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-1.5 py-1.5 rounded-lg active:scale-95 transition-all"
                  >
                    GAL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Health ID Section */}
        <section className="space-y-4">
          {/* ABHA Integration Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[24px] shadow-sm flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative p-4 flex items-center justify-between z-10 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shrink-0">
                  <IdCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold text-sm leading-tight">Digital Health ID</h4>
                    {settings.abhaConnected && (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-white/30 text-[8px] uppercase font-bold py-0 h-4">
                        Linked
                      </Badge>
                    )}
                  </div>
                  <p className="text-blue-50/90 text-[10px] leading-tight">Link ABHA account to sync health records</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAbhaSync}
                  loading={isAbhaSyncing}
                  disabled={isAbhaSyncing}
                  className="bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 border-none h-auto shadow-lg"
                >
                  {isAbhaSyncing ? 'Syncing...' : (settings.abhaConnected ? 'Sync Data' : 'Link ABHA')}
                </Button>
                {settings.abhaConnected && !isAbhaSyncing && (
                   <button 
                     onClick={disconnectAbha}
                     className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0 w-10 h-10 rounded-xl active:scale-95 transition-all"
                   >
                     <X size={16} />
                   </button>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Today's Tasks */}
        {filteredTasks.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-display font-bold text-foreground px-1 transition-colors">Today's Tasks</h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: completingTasks[task.id] ? 0 : 1, 
                      scale: completingTasks[task.id] ? 0.9 : 1,
                      x: 0 
                    }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ 
                      opacity: { duration: completingTasks[task.id] ? 0.5 : 0.2, delay: completingTasks[task.id] ? 0.3 : 0 },
                      scale: { duration: completingTasks[task.id] ? 0.5 : 0.2, delay: completingTasks[task.id] ? 0.3 : 0 },
                      default: { type: "spring", stiffness: 500, damping: 30 }
                    }}
                  >
                    <Card className="border-none bg-muted shadow-sm rounded-[24px] transition-colors overflow-hidden group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-inner">
                          <Clock size={20} />
                        </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-black text-foreground text-sm uppercase tracking-tight",
                        task.title.toLowerCase().includes('blood pressure') && "text-rose-600 dark:text-rose-400"
                      )}>
                        {task.title}
                      </h4>
                      {task.profileId !== activeProfileId && (
                        <Badge variant="outline" className="text-[8px] py-0 px-1 bg-primary/5 border-primary/20 text-primary uppercase shrink-0">
                          {profiles.find(p => p.id === task.profileId)?.name.split(' ')[0]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{task.dueTime}</p>
                  </div>
                        <div className="relative">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            disabled={completingTasks[task.id]}
                            onClick={async () => {
                              setCompletingTasks(prev => ({ ...prev, [task.id]: true }));
                              playSuccessSound();
                              setTimeout(() => {
                                updateTaskStatus(task.id, 'completed');
                                toast.success('Task completed! 🎉');
                                setCompletingTasks(prev => ({ ...prev, [task.id]: false }));
                              }, 800);
                            }}
                            className={cn(
                              "font-bold rounded-xl transition-all relative overflow-visible",
                              completingTasks[task.id] 
                                ? "text-emerald-500 bg-emerald-500/10 pointer-events-none"
                                : "text-primary hover:bg-primary/10 animate-pulse-green"
                            )}
                          >
                            {completingTasks[task.id] ? (
                              <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.1, opacity: 1 }}
                                className="flex items-center gap-1.5"
                              >
                                <CheckCircle2 size={16} /> <span className="text-xs">Done</span>
                                
                                {/* Micro-confetti on home task button */}
                                {[...Array(8)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ scale: 0, x: 0, y: 0 }}
                                    animate={{ 
                                      scale: [0, 1, 0],
                                      x: [0, (Math.cos(i * 45 * Math.PI / 180) * 25)],
                                      y: [0, (Math.sin(i * 45 * Math.PI / 180) * 25)],
                                      opacity: [1, 0]
                                    }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute w-1 h-1 rounded-full bg-emerald-400"
                                    style={{ left: '50%', top: '50%' }}
                                  />
                                ))}
                              </motion.div>
                            ) : (
                              "Done"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Health Tips */}


        {/* Symptom History */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display text-sm font-bold text-foreground transition-colors">Recent Symptoms</h3>
            <button 
              onClick={onShowSymptoms}
              className="text-primary text-[10px] font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity uppercase tracking-wider"
            >
              All <ChevronRight size={12} />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {symptoms.filter(s => s.profileId === activeProfileId).length > 0 ? (
              symptoms
                .filter(s => s.profileId === activeProfileId)
                .slice(0, 5)
                .map((symptom) => (
                  <motion.div
                    key={symptom.id}
                    className="min-w-[120px] bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col gap-1.5 shrink-0"
                  >
                    <div className="flex gap-2 items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                        symptom.severity === 'mild' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        symptom.severity === 'moderate' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      )}>
                        <AlertCircle size={12} />
                      </div>
                      <h4 className="font-bold text-xs text-foreground truncate min-w-0" title={symptom.name}>{symptom.name}</h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-[9px] font-bold uppercase",
                        symptom.severity === 'mild' ? 'text-emerald-600 dark:text-emerald-400' :
                        symptom.severity === 'moderate' ? 'text-amber-600 dark:text-amber-400' :
                        'text-rose-600 dark:text-rose-400'
                      )}>{symptom.severity}</span>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {format(new Date(symptom.timestamp), 'MMM d')}
                      </span>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="w-full py-4 bg-muted/20 rounded-2xl border border-dashed border-border flex items-center justify-between px-4">
                <p className="text-[10px] text-muted-foreground font-medium">No symptoms recorded yet.</p>
                <button 
                  onClick={onShowSymptoms}
                  className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  Log
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display text-sm font-bold text-foreground transition-colors">Today's Schedule</h3>
            <button 
              onClick={onViewHistory}
              className="text-primary text-[10px] font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity uppercase tracking-wider"
            >
              History <ChevronRight size={12} />
            </button>
          </div>
          
          <div className="px-1 mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Adherence Progress</span>
              <span className="text-[10px] font-black text-primary">{Math.round(progress)}% ({takenCount}/{totalCount})</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
            <p className="text-[9px] text-muted-foreground mt-1.5 font-medium">{getMotivationalMessage()}</p>
          </div>

          {filteredReminders.filter(r => r.status === 'pending' || r.status === 'missed').length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border transition-colors flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center mb-2 border border-border shadow-sm">
                <Check className="text-emerald-500/50" size={20} />
              </div>
              <p className="text-muted-foreground text-xs font-medium">
                All caught up! No pending medicines.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredReminders.filter(r => r.status === 'pending' || r.status === 'missed').sort((a, b) => a.time.localeCompare(b.time)).map((reminder, idx) => {
                const med = medicines.find(m => m.id === reminder.medicineId);
                if (!med) return null;

                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    layout
                  >
                    <Card className={cn(
                      "border border-border/50 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] transition-all relative overflow-hidden rounded-2xl",
                      "bg-card"
                    )}>
                      {reminder.status === 'pending' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: med.color }} />
                      )}
                      <CardContent className="p-2.5 flex items-center gap-3">
                        <div 
                          className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shadow-inner shrink-0 overflow-hidden",
                          "bg-muted/50 text-muted-foreground/60 transition-colors"
                        )}>
                          {med.image ? (
                            <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm truncate transition-all text-foreground leading-tight">
                                  {med.name}
                                </h4>
                                {reminder.status === 'pending' && reminder.profileId !== activeProfileId && (
                                  <Badge variant="outline" className="text-[8px] py-0 px-1 bg-primary/5 border-primary/20 text-primary uppercase shrink-0">
                                    {profiles.find(p => p.id === reminder.profileId)?.name.split(' ')[0]}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">{reminder.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-muted-foreground font-semibold">{med.dosage}</p>
                            <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">•</span>
                            <span className={cn(
                              "text-[9px] uppercase font-bold tracking-wider rounded-md",
                              reminder.status === 'missed' ? 'bg-destructive/10 text-destructive border-none px-1' : 'text-muted-foreground/80'
                            )}>
                              {reminder.status === 'missed' ? 'Missed' : med.instructions || 'With Water'}
                            </span>
                          </div>
                        </div>
                        {reminder.status === 'pending' && (
                          <div className="relative">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.8 }}
                              onClick={() => {
                                updateReminderStatus(reminder.id, 'taken');
                                playSuccessSound();
                                toast.success('Dose recorded! +10 Coins earned.', {
                                  icon: <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">C</div>
                                });
                              }}
                              className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all shrink-0 animate-pulse-green relative overflow-visible"
                            >
                              <Check size={18} strokeWidth={3} />
                            </motion.button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {filteredReminders.filter(r => r.status === 'taken').length > 0 && (
             <div className="pt-2 space-y-2">
               <button 
                 onClick={() => setShowTakenHistory(!showTakenHistory)}
                 className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 rounded-xl transition-colors active:bg-muted/60 hover:bg-muted/60 group"
               >
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-colors group-hover:bg-emerald-500/20">
                     <CheckCircle2 size={12} />
                   </div>
                   <div className="text-left">
                     <p className="text-xs font-bold text-foreground">Completed History</p>
                     <p className="text-[9px] text-muted-foreground font-medium">
                       {filteredReminders.filter(r => r.status === 'taken').length} medicines taken today
                     </p>
                   </div>
                 </div>
                 <ChevronRight 
                   size={16} 
                   className={cn(
                     "text-muted-foreground transition-transform duration-300",
                     showTakenHistory && "rotate-90"
                   )} 
                 />
               </button>

               <AnimatePresence>
                 {showTakenHistory && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden space-y-2"
                   >
                     {filteredReminders.filter(r => r.status === 'taken').sort((a, b) => b.time.localeCompare(a.time)).map((reminder, index) => {
                       const med = medicines.find(m => m.id === reminder.medicineId);
                       if (!med) return null;

                       return (
                         <div key={reminder.id} className="opacity-80 px-3 py-2 bg-muted/30 rounded-xl flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border border-border bg-card overflow-hidden" style={{ color: med.color }}>
                             {med.image ? (
                               <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                             ) : (
                               <Check size={12} />
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-xs text-foreground truncate">{med.name}</h4>
                             <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                               <Clock size={10} /> {reminder.time}
                             </p>
                           </div>
                           <div className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">
                             Taken
                           </div>
                         </div>
                       );
                     })}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          )}
        </section>
        
        {/* Global Footer Disclaimer */}
        <footer className="mt-8 pb-8 px-4 text-center">
          <p className="text-[10px] text-black dark:text-muted-foreground font-bold leading-relaxed opacity-60">
            Disclaimer: MediPulse is for information purposes only. Not for medical diagnosis or treatment. 
            Always consult a healthcare professional before making medical decisions.
          </p>
        </footer>
      </div>
      
      <AnimatePresence>
        {showAbhaModal && <AbhaAuthModal onClose={() => setShowAbhaModal(false)} />}
      </AnimatePresence>
    </div>
);
};
