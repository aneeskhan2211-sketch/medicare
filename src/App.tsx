import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './screens/Home';
import { Meds } from './screens/Meds';
import { AddMed } from './screens/AddMed';
import { CalendarView } from './screens/Calendar';
import { Profile } from './screens/Profile';
import { TeleConsultationScreen } from './screens/TeleConsultation';
import { About } from './screens/About';
import { Tasks } from './screens/Tasks';
import { Login } from './screens/Login';
import { Paywall } from './screens/Paywall';
import { Branding } from './screens/Branding';
import { MedDetail } from './screens/MedDetail';
import { AIAssistant } from './screens/AIAssistant';
import { ReviewScan } from './components/ReviewScan';
import { RefillDialog } from './screens/RefillDialog';
import { Wallet } from './screens/Wallet';
import { Marketplace } from './screens/Marketplace';
import { AIDoctor } from './screens/AIDoctor';
import { AIDietician } from './components/AIDietician';
import { VitalsTracker } from './components/VitalsTracker';
import { SymptomTracker } from './components/SymptomTracker';
import { InteractionsChecker } from './components/InteractionsChecker';
import { PillIdentifier } from './components/PillIdentifier';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from './store/useStore';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { notificationService } from './services/notificationService';
import { Medicine, Reminder, Task, User, Settings } from './types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { format } from 'date-fns';
import { Bell, Check, Clock, X, CheckSquare, Stethoscope, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LabAnalyzer } from './components/LabAnalyzer';
import { EmergencySOS } from './components/EmergencySOS';
import { DietTracker } from './components/DietTracker';
import { FitnessDashboard } from './components/FitnessDashboard';
import { HealthChallenges } from './components/HealthChallenges';
import { MedicationAISuggestion } from './components/MedicationAISuggestion';
import { AbhaAuthModal } from './components/AbhaAuthModal';
import { DocumentVault } from './screens/DocumentVault';
import { HealthChronicles } from './screens/HealthChronicles';
import { FamilyCircle } from './screens/FamilyCircle';
import { Leaderboard } from './screens/Leaderboard';
import { MediPass } from './components/MediPass';

import { Onboarding } from './screens/Onboarding';
import { handleFirestoreError, OperationType } from './lib/firebase';

export default function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const authLoading = useStore(state => state.authLoading);
  const setUser = useStore(state => state.setUser);
  const setAuthLoading = useStore(state => state.setAuthLoading);
  const reminders = useStore(state => state.reminders);
  // ... rest of imports
  const updateReminderStatus = useStore(state => state.updateReminderStatus);
  const medicines = useStore(state => state.medicines);
  const profiles = useStore(state => state.profiles);
  const addReminder = useStore(state => state.addReminder);
  const generateReminders = useStore(state => state.generateReminders);
  const tasks = useStore(state => state.tasks);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  const checkMissedReminders = useStore(state => state.checkMissedReminders);
  const activeProfileId = useStore(state => state.activeProfileId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userPath = `users/${firebaseUser.uid}`;
        const userRef = doc(db, userPath);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, userPath);
          return;
        }

        if (userSnap.exists()) {
          const userData = userSnap.data() as User & { settings?: Settings };
          setUser(userData);
          if (userData.settings) {
            updateSettings(userData.settings);
          }
          // Initialize FCM
          notificationService.initMessaging(firebaseUser.uid);
        } else {
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            avatar: firebaseUser.photoURL || '',
            isPremium: false,
            tier: 'basic',
            coins: 100,
            balance: 0,
            streak: 0,
            maxStreak: 0,
            aiQueriesToday: 0,
            achievements: [],
            createdAt: new Date().toISOString(),
            loginProvider: firebaseUser.providerData[0]?.providerId || 'password'
          };
          try {
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, userPath);
          }
          setUser(newUser);
          notificationService.initMessaging(firebaseUser.uid);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading, updateSettings]);
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const [activeTab, setActiveTab] = useState('home');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showAIDoctor, setShowAIDoctor] = useState(false);
  const [showAIDietician, setShowAIDietician] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showLabAnalyzer, setShowLabAnalyzer] = useState(false);
  const [showFitness, setShowFitness] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showPillIdentifier, setShowPillIdentifier] = useState(false);
  const [showInteractionsChecker, setShowInteractionsChecker] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showDiet, setShowDiet] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showChronicles, setShowChronicles] = useState(false);
  const [showTeleConsultation, setShowTeleConsultation] = useState(false);
  const [showFamilyCircle, setShowFamilyCircle] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMediPass, setShowMediPass] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [refillMed, setRefillMed] = useState<Medicine | null>(null);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [animatingReminderId, setAnimatingReminderId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [autoOpenScanner, setAutoOpenScanner] = useState(false);
  const [scannerSource, setScannerSource] = useState<'camera' | 'gallery' | undefined>(undefined);
  const [scannedMeds, setScannedMeds] = useState<Medicine[]>([]);
  const [showReviewScan, setShowReviewScan] = useState(false);
  const lastNotifiedTime = React.useRef<string | null>(null);

  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.darkMode]);

  useEffect(() => {
    if (isAuthenticated) {
      generateReminders();
    }
  }, [isAuthenticated, generateReminders, medicines.length]);

  useEffect(() => {
    const checkReminders = () => {
      if (!isAuthenticated) return;
      
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const today = format(now, 'yyyy-MM-dd');

      const isQuietHours = () => {
        if (!settings?.quietHours?.enabled) return false;
        const start = settings.quietHours.start;
        const end = settings.quietHours.end;
        if (start < end) {
          return currentTime >= start && currentTime < end;
        }
        return currentTime >= start || currentTime < end;
      };

      const dueReminder = reminders.find(r => 
        r.date === today && 
        r.status === 'pending' && 
        r.time === currentTime
      );

      if (dueReminder && !activeReminder && lastNotifiedTime.current !== `${today}-${currentTime}-${dueReminder.id}`) {
        if (!isQuietHours() || settings?.notifications?.enabled) {
          setActiveReminder(dueReminder);
          lastNotifiedTime.current = `${today}-${currentTime}-${dueReminder.id}`;
          
          const med = medicines.find(m => m.id === dueReminder.medicineId);
          if (settings?.notifications?.pushEnabled) {
            notificationService.sendReminder(
              `Time to take ${med?.name || 'Medicine'}`,
              `Dosage: ${med?.dosage || ''}. Stay on track with your health!`
            );
          }
          
          // Play sound based on settings
          const soundFile = settings?.notifications?.reminderSound === 'chime' 
            ? 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' 
            : settings?.notifications?.reminderSound === 'alarm'
            ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
            : 'https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3';
            
          const audio = new Audio(soundFile);
          audio.play().catch(() => console.log('Audio playback prevented by browser policy'));
        }
      }

      const dueTask = tasks.find(t => 
        t.dueDate === today && 
        t.status === 'pending' && 
        t.dueTime === currentTime
      );

      if (dueTask && !activeTask && !isQuietHours() && lastNotifiedTime.current !== `${today}-${currentTime}-${dueTask.id}`) {
        setActiveTask(dueTask);
        lastNotifiedTime.current = `${today}-${currentTime}-${dueTask.id}`;
        toast.info(`Task Reminder: ${dueTask.title}`, {
          description: `It's time for your scheduled task.`,
          icon: <CheckSquare size={16} className="text-primary" />,
          action: {
            label: 'Done',
            onClick: () => {
              updateTaskStatus(dueTask.id, 'completed');
              setActiveTask(null);
            }
          }
        });
      }

      // Check for missed medication reminders (Caregiver Alert logic)
      checkMissedReminders();
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [reminders, isAuthenticated, activeReminder, medicines, settings, tasks, updateTaskStatus, checkMissedReminders]);

  // Health Tips Notifications
  useEffect(() => {
    if (!isAuthenticated || !settings?.notifications?.pushEnabled) return;

    const tips = [
      "Take medication at the same time daily to build a consistent body rhythm.",
      "Store your medications in a cool, dry place away from direct sunlight.",
      "Always check the patient info leaflet if you've missed a dose.",
      "Keep an updated digital list of all your medications for emergencies.",
      "Staying hydrated helps your body absorb and process medicine efficiently.",
      "Never stop a prescribed antibiotic course early, even if you feel better.",
      "Check with your pharmacist before taking herbal supplements with prescriptions.",
      "Regular walking for just 15 minutes can significantly improve heart health.",
      "Poor sleep can weaken your immune system; prioritize 7-9 hours of rest.",
      "Limit processed sugar intake to reduce chronic inflammation in the body."
    ];

    const sendDailyTip = () => {
      const lastTipDate = localStorage.getItem('last_health_tip_date');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastTipDate !== today) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        notificationService.sendTip(randomTip);
        localStorage.setItem('last_health_tip_date', today);
      }
    };

    const initialTipTimer = setTimeout(sendDailyTip, 10000); // Send 10s after login if not already sent today
    return () => clearTimeout(initialTipTimer);
  }, [isAuthenticated, settings?.notifications?.pushEnabled]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white"
        >
          <Bell size={32} />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster position="top-center" richColors theme={settings.darkMode ? 'dark' : 'light'} />
      </>
    );
  }

  if (!settings.hasCompletedOnboarding) {
    return (
      <>
        <Onboarding />
        <Toaster position="top-center" richColors theme={settings.darkMode ? 'dark' : 'light'} />
      </>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return (
        <Home 
          onOpenAI={() => setShowAI(true)} 
          onShowMarketplace={() => setShowMarketplace(true)}
          onShowVitals={() => setShowVitals(true)}
          onShowSymptoms={() => setShowSymptoms(true)}
          onShowLabAnalyzer={() => setShowLabAnalyzer(true)}
          onShowFitness={() => setShowFitness(true)}
          onShowChallenges={() => setShowChallenges(true)}
          onShowVault={() => setShowVault(true)}
          onShowDiet={() => setShowDiet(true)}
          onShowAIDietician={() => setShowAIDietician(true)}
          onShowFamily={() => setShowFamilyCircle(true)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onViewHistory={() => setActiveTab('calendar')}
          onShowPillIdentifier={() => setShowPillIdentifier(true)}
          onShowInteractions={() => setShowInteractionsChecker(true)}
          onShowMediPass={() => setShowMediPass(true)}
          onScanComplete={(meds) => {
            setScannedMeds(meds);
            if (meds.length === 1) {
              setActiveTab('add');
            } else if (meds.length > 1) {
              setShowReviewScan(true);
            }
          }}
        />
      );
      case 'meds': return <Meds onSelectMed={(med) => setSelectedMed(med)} onRefillMed={(med) => setRefillMed(med)} onAddMed={() => setActiveTab('add')} onShowAISuggestions={() => setShowAISuggestions(true)} />;
      case 'add': return (
        <AddMed 
          onComplete={() => {
            setActiveTab('home');
            setAutoOpenScanner(false);
            setScannerSource(undefined);
            setScannedMeds([]);
          }} 
          autoOpenScanner={autoOpenScanner}
          scannerSource={scannerSource}
          initialData={scannedMeds.length === 1 ? scannedMeds[0] : null}
        />
      );
      case 'calendar': return <CalendarView />;
      case 'tasks': return <Tasks />;
      case 'profile': return <Profile onShowPaywall={() => setShowPaywall(true)} onShowBranding={() => setShowBranding(true)} onShowWallet={() => setShowWallet(true)} onShowAbout={() => setShowAbout(true)} onShowTeleConsultation={() => setShowTeleConsultation(true)} />;
      default: return (
        <Home 
          onOpenAI={() => setShowAI(true)} 
          onShowMarketplace={() => setShowMarketplace(true)}
          onShowVitals={() => setShowVitals(true)}
          onShowSymptoms={() => setShowSymptoms(true)}
          onShowLabAnalyzer={() => setShowLabAnalyzer(true)}
          onShowFitness={() => setShowFitness(true)}
          onShowChallenges={() => setShowChallenges(true)}
          onShowVault={() => setShowVault(true)}
          onShowDiet={() => setShowDiet(true)}
          onShowAIDietician={() => setShowAIDietician(true)}
          onShowFamily={() => setShowFamilyCircle(true)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onViewHistory={() => setActiveTab('calendar')}
          onShowPillIdentifier={() => setShowPillIdentifier(true)}
          onShowInteractions={() => setShowInteractionsChecker(true)}
          onShowMediPass={() => setShowMediPass(true)}
          onScanComplete={(meds) => {
            setScannedMeds(meds);
            if (meds.length === 1) {
              setActiveTab('add');
            } else if (meds.length > 1) {
              setShowReviewScan(true);
            }
          }}
        />
      );
    }
  };

  const handleReminderAction = (status: 'taken' | 'missed') => {
    if (activeReminder) {
      // Play sound
      const audio = new Audio(status === 'taken' ? '/sounds/success.mp3' : '/sounds/error.mp3');
      audio.play().catch(() => {}); // Silent fail if asset missing or autoplay blocked

      // Trigger animation
      setAnimatingReminderId(activeReminder.id);

      setTimeout(() => {
        updateReminderStatus(activeReminder.id, status);
        setActiveReminder(null);
        setAnimatingReminderId(null);
        
        if (status === 'taken') {
          toast.success('Dose recorded! +10 Coins earned.', {
            icon: <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">C</div>
          });

          // Check for low stock after taking dose
          const med = medicines.find(m => m.id === activeReminder.medicineId);
          if (med && med.stock <= 5) {
            toast.warning(`Low stock: ${med.name}`, {
              description: `Only ${med.stock - 1} doses left. Tap to refill.`,
              action: {
                label: 'Refill',
                onClick: () => setRefillMed(med)
              }
            });
          }
        }
      }, 500); // Wait for animation
    }
  };

  const handleSnooze = () => {
    if (activeReminder) {
      const med = medicines.find(m => m.id === activeReminder.medicineId);
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 15);
      const snoozeTimeStr = format(snoozeTime, 'HH:mm');
      
      addReminder({
        ...activeReminder,
        id: Math.random().toString(36).substr(2, 9),
        time: snoozeTimeStr,
        status: 'pending'
      });

      setActiveReminder(null);
      toast.info(`Snoozed: ${med?.name || 'Medicine'}`, {
        description: `We'll remind you again at ${snoozeTimeStr}`,
        icon: <Clock size={16} className="text-indigo-500" />
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden max-w-md mx-auto shadow-2xl bg-background transition-colors duration-300 pt-safe pb-safe">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full relative z-10 p-4"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Smart Reminder Popup */}
      <AnimatePresence>
        {activeReminder && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: animatingReminderId === activeReminder.id ? 0.95 : 1,
            }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-24 z-[60] px-4 pointer-events-none"
          >
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 pointer-events-auto space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Bell className="animate-bounce" size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Time for Medicine</p>
                  <h4 className="text-lg font-bold text-slate-900">
                    {medicines.find(m => m.id === activeReminder.medicineId)?.name}
                  </h4>
                  <p className="text-sm text-slate-500">
                    For {profiles.find(p => p.id === activeReminder.profileId)?.name}
                  </p>
                </div>
                <button onClick={() => setActiveReminder(null)} className="text-slate-300 hover:text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button 
                  onClick={() => handleReminderAction('taken')}
                  className="h-14 rounded-2xl bg-green-500 hover:bg-green-600 font-bold flex flex-col gap-0"
                >
                  <Check size={18} />
                  <span className="text-[10px]">Taken</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSnooze}
                  className="h-14 rounded-2xl border-slate-200 text-slate-600 font-bold flex flex-col gap-0"
                >
                  <Clock size={18} />
                  <span className="text-[10px]">Snooze</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleReminderAction('missed')}
                  className="h-14 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-bold flex flex-col gap-0"
                >
                  <X size={18} />
                  <span className="text-[10px]">Skip</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAISuggestions && (
          <MedicationAISuggestion onClose={() => setShowAISuggestions(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaywall && (
          <Paywall onClose={() => setShowPaywall(false)} />
        )}
      </AnimatePresence>

      <Drawer open={!!selectedMed} onOpenChange={(open) => !open && setSelectedMed(null)}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Medicine Detail</DrawerTitle>
          </DrawerHeader>
          {selectedMed && (
            <MedDetail medicine={selectedMed} onClose={() => setSelectedMed(null)} />
          )}
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <AIAssistant 
              onClose={() => setShowAI(false)} 
              contextMedicine={selectedMed} 
              onScanComplete={(meds) => {
                setShowAI(false);
                setScannedMeds(meds);
                if (meds.length > 0) {
                  setShowReviewScan(true);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer open={showReviewScan} onOpenChange={setShowReviewScan}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          <ReviewScan 
            meds={scannedMeds} 
            onComplete={() => {
              setShowReviewScan(false);
              setScannedMeds([]);
              setActiveTab('meds');
            }}
            onCancel={() => setShowReviewScan(false)}
            onEdit={(med) => {
              setScannedMeds([med]);
              setShowReviewScan(false);
              setActiveTab('add');
            }}
          />
        </DrawerContent>
      </Drawer>

      <Drawer open={showBranding} onOpenChange={setShowBranding}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          <Branding onClose={() => setShowBranding(false)} />
        </DrawerContent>
      </Drawer>

      <Drawer open={showWallet} onOpenChange={setShowWallet}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Wallet</DrawerTitle>
          </DrawerHeader>
          <Wallet onClose={() => setShowWallet(false)} />
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <About onClose={() => setShowAbout(false)} />
          </motion.div>
        )}
        {showMarketplace && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <Marketplace onClose={() => setShowMarketplace(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer open={!!refillMed} onOpenChange={(open) => !open && setRefillMed(null)}>
        <DrawerContent className="h-[70vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          {refillMed && (
            <RefillDialog medicine={refillMed} onClose={() => setRefillMed(null)} />
          )}
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {showAIDoctor && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <AIDoctor onClose={() => setShowAIDoctor(false)} />
          </motion.div>
        )}
        {showAIDietician && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <AIDietician onClose={() => setShowAIDietician(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChallenges && (
          <HealthChallenges onClose={() => setShowChallenges(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVault && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <DocumentVault onClose={() => setShowVault(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeleConsultation && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <TeleConsultationScreen onBack={() => setShowTeleConsultation(false)} />
          </motion.div>
        )}
        {showFamilyCircle && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <FamilyCircle onClose={() => setShowFamilyCircle(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <Leaderboard onClose={() => setShowLeaderboard(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMediPass && activeProfile && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[120] bg-slate-900 max-w-md mx-auto"
          >
            <MediPass 
              profile={activeProfile} 
              medicines={medicines}
              onClose={() => setShowMediPass(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChronicles && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <HealthChronicles onClose={() => setShowChronicles(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVitals && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <VitalsTracker onClose={() => setShowVitals(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSymptoms && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background max-w-md mx-auto"
          >
            <SymptomTracker onClose={() => setShowSymptoms(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPillIdentifier && <PillIdentifier onClose={() => setShowPillIdentifier(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showInteractionsChecker && <InteractionsChecker onClose={() => setShowInteractionsChecker(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showLabAnalyzer && (
          <LabAnalyzer onClose={() => setShowLabAnalyzer(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFitness && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="fixed inset-0 z-[100] bg-background"
          >
            <FitnessDashboard onClose={() => setShowFitness(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSOS && (
          <EmergencySOS onClose={() => setShowSOS(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiet && (
          <DietTracker onClose={() => setShowDiet(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthenticated && settings?.abhaConnected === false && (
          <AbhaAuthModal onClose={() => updateSettings({ abhaConnected: undefined })} />
        )}
      </AnimatePresence>

      <div className="fixed z-[90] bottom-24 w-full max-w-md mx-auto right-0 left-0 pointer-events-none flex flex-col items-end px-4 gap-3">
        <button 
          onClick={() => setShowAIDietician(true)}
          className="pointer-events-auto w-14 h-14 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all"
        >
          <Utensils size={24} />
        </button>
        <button 
          onClick={() => setShowAIDoctor(true)}
          className="pointer-events-auto w-14 h-14 bg-emerald-600 rounded-full shadow-[0_0_20px_rgba(5,150,105,0.5)] flex items-center justify-center text-white hover:bg-emerald-700 hover:scale-105 transition-all"
        >
          <Stethoscope size={24} />
        </button>
        <button 
          onClick={() => setShowSOS(true)}
          className="pointer-events-auto w-14 h-14 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center text-white hover:bg-red-700 hover:scale-105 transition-all"
        >
          <span className="font-black text-sm uppercase tracking-widest">SOS</span>
        </button>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
