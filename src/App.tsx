import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './screens/Home';
import { Meds } from './screens/Meds';
import { AddMed } from './screens/AddMed';
import { CalendarView } from './screens/Calendar';
import { Profile } from './screens/Profile';
import { Analytics } from './screens/Analytics';
import { Login } from './screens/Login';
import { Paywall } from './screens/Paywall';
import { Branding } from './screens/Branding';
import { MedDetail } from './screens/MedDetail';
import { AIAssistant } from './screens/AIAssistant';
import { ReviewScan } from './components/ReviewScan';
import { RefillDialog } from './screens/RefillDialog';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from './store/useStore';
import { Medicine, Reminder } from './types';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { format } from 'date-fns';
import { AlertCircle, Bell, Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function App() {
  const { isAuthenticated, user, reminders, updateReminderStatus, medicines, profiles, addReminder, generateReminders } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [refillMed, setRefillMed] = useState<Medicine | null>(null);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [autoOpenScanner, setAutoOpenScanner] = useState(false);
  const [scannerSource, setScannerSource] = useState<'camera' | 'gallery' | undefined>(undefined);
  const [scannedMeds, setScannedMeds] = useState<any[]>([]);
  const [showReviewScan, setShowReviewScan] = useState(false);

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

      const dueReminder = reminders.find(r => 
        r.date === today && 
        r.status === 'pending' && 
        r.time === currentTime
      );

      if (dueReminder && !activeReminder) {
        setActiveReminder(dueReminder);
        // Play sound simulation
        console.log('Reminder sound playing...');
      }
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [reminders, isAuthenticated, activeReminder]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative overflow-hidden shadow-2xl">
        <Login />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return (
        <Home 
          onOpenAI={() => setShowAI(true)} 
          onRefillMed={(med) => setRefillMed(med)} 
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
      case 'meds': return <Meds onSelectMed={(med) => setSelectedMed(med)} onRefillMed={(med) => setRefillMed(med)} />;
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
      case 'analytics': return <Analytics />;
      case 'profile': return <Profile onShowPaywall={() => setShowPaywall(true)} onShowBranding={() => setShowBranding(true)} />;
      default: return <Home />;
    }
  };

  const handleReminderAction = (status: 'taken' | 'missed') => {
    if (activeReminder) {
      updateReminderStatus(activeReminder.id, status);
      setActiveReminder(null);
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
    <div className="min-h-screen relative overflow-hidden max-w-md mx-auto shadow-2xl bg-gradient-to-b from-[#F7F8FC] to-[#EEF2FF]">
      {/* Global Medical Watermark */}
      <div className="absolute bottom-10 right-5 w-50 opacity-5 blur-sm pointer-events-none z-0">
        <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="Watermark" className="filter-green" />
      </div>

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
            animate={{ opacity: 1, y: 0 }}
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
        {showPaywall && (
          <Paywall onClose={() => setShowPaywall(false)} />
        )}
      </AnimatePresence>

      <Drawer open={!!selectedMed} onOpenChange={(open) => !open && setSelectedMed(null)}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl">
          {selectedMed && (
            <MedDetail medicine={selectedMed} onClose={() => setSelectedMed(null)} />
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={showAI} onOpenChange={setShowAI}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          <AIAssistant 
            onClose={() => setShowAI(false)} 
            contextMedicine={selectedMed} 
            onScanComplete={(meds) => {
              setShowAI(false);
              setScannedMeds(meds);
              setShowReviewScan(true);
            }}
          />
        </DrawerContent>
      </Drawer>

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
          />
        </DrawerContent>
      </Drawer>

      <Drawer open={showBranding} onOpenChange={setShowBranding}>
        <DrawerContent className="h-[90vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          <Branding onClose={() => setShowBranding(false)} />
        </DrawerContent>
      </Drawer>

      <Drawer open={!!refillMed} onOpenChange={(open) => !open && setRefillMed(null)}>
        <DrawerContent className="h-[70vh] rounded-t-[32px] border-none shadow-2xl overflow-hidden">
          {refillMed && (
            <RefillDialog medicine={refillMed} onClose={() => setRefillMed(null)} />
          )}
        </DrawerContent>
      </Drawer>

      <Toaster position="top-center" richColors />
    </div>
  );
}
