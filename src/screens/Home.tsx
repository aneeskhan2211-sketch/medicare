import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format, differenceInMinutes, parseISO, isAfter } from 'date-fns';
import { Check, Clock, AlertCircle, ChevronRight, Sparkles, Flame, Camera, Upload, MessageSquare, Bell, Activity, ShoppingCart, Sun, Moon, Heart, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medicine, Reminder } from '../types';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { HealthTips } from '../components/HealthTips';
import { MedicalBackground } from '../components/MedicalBackground';
import { extractMedicineInfo } from '../services/aiService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { playSuccessSound } from '../lib/audio';

interface HomeProps {
  onOpenAI: () => void;
  onRefillMed: (med: Medicine) => void;
  onScanComplete: (info: any[]) => void;
  onShowMarketplace: () => void;
  onShowAIDoctor: () => void;
  onShowVitals: () => void;
  onShowSymptoms: () => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenAI, onRefillMed, onScanComplete, onShowMarketplace, onShowAIDoctor, onShowVitals, onShowSymptoms }) => {
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
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextDose, setNextDose] = useState<{ med: Medicine, reminder: Reminder } | null>(null);

  useEffect(() => {
    checkDailyLogin();
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const profileMedicines = React.useMemo(() => 
    medicines.filter(m => m.profileId === activeProfileId),
    [medicines, activeProfileId]
  );

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

  const filteredReminders = React.useMemo(() => {
    if (!searchQuery.trim()) return profileReminders;
    const query = searchQuery.toLowerCase();
    
    // Search across ALL reminders for today
    const allTodayReminders = reminders.filter(r => r.date === today);
    
    return allTodayReminders
      .map(r => {
        const med = medicines.find(m => m.id === r.medicineId);
        if (!med) return { reminder: r, score: -1 };
        
        let score = 0;
        const medName = med.name.toLowerCase();
        
        // Priority 1: Medicine Name Match
        if (medName.startsWith(query)) score += 500;
        else if (medName.includes(query)) score += 200;
        
        // Priority 3: Active Profile
        if (r.profileId === activeProfileId) score += 300;
        
        // Priority 2: Next Dose Time Proximity
        // Boost if it's the next upcoming dose for this medicine
        const isNextUpcoming = nextDose?.reminder.id === r.id;
        if (isNextUpcoming) score += 100;

        // Small bonus for earlier times in general to keep chronological sense within same priority groups
        const [hours, minutes] = r.time.split(':').map(Number);
        score += (24 - hours) * 2; // Earlier = slightly higher score

        return { reminder: r, score };
      })
      .filter(item => item.score > 100) // Only items with some match
      .sort((a, b) => b.score - a.score)
      .map(item => item.reminder);
  }, [reminders, activeProfileId, today, searchQuery, medicines, profileReminders, nextDose]);

  const filteredTasks = React.useMemo(() => {
    if (!searchQuery.trim()) return profileTasks;
    const query = searchQuery.toLowerCase();
    
    // Search across ALL tasks for today
    const allTodayTasks = tasks.filter(t => t.dueDate === today && t.status === 'pending');
    
    return allTodayTasks
      .map(t => {
        let score = 0;
        const title = t.title.toLowerCase();
        
        if (title.startsWith(query)) score += 500;
        else if (title.includes(query)) score += 200;
        
        if (t.profileId === activeProfileId) score += 300;
        
        return { task: t, score };
      })
      .filter(item => item.score > 100)
      .sort((a, b) => b.score - a.score)
      .map(item => item.task);
  }, [tasks, activeProfileId, today, searchQuery, profileTasks]);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const toastId = toast.loading('Scanning prescription...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const info = await extractMedicineInfo(base64, file.type);
        setIsScanning(false);
        toast.dismiss(toastId);
        toast.success('Scan complete!');
        onScanComplete(info);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
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

        {/* Global Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search medicines or tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 hover:bg-muted/50 focus:bg-muted/80 backdrop-blur-md border border-border focus:border-primary/50 rounded-[20px] py-4 pl-12 pr-12 text-sm font-medium transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          )}
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
              
              <CardContent className="p-6 relative z-10 flex items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Daily Progress</p>
                    <p className="text-white text-sm font-medium">{takenCount} of {totalCount} doses taken</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 inline-flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{getMotivationalMessage()}</p>
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
                  className="w-28 h-28 flex items-center justify-center relative shrink-0"
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
                      <span className="text-3xl font-black text-white leading-none">
                        {Math.round(progress)}<span className="text-sm opacity-60">%</span>
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
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <Bell size={24} />
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

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-foreground px-1 transition-colors">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, label: 'Ask AI', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', onClick: onOpenAI },
              { icon: Sparkles, label: 'AI Doctor', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', onClick: onShowAIDoctor },
              { icon: Activity, label: 'Vitals', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', onClick: onShowVitals },
              { icon: AlertCircle, label: 'Symptoms', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', onClick: onShowSymptoms },
              { icon: ShoppingCart, label: 'Rate', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', onClick: onShowMarketplace },
              { icon: Camera, label: 'Scan', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', onClick: () => cameraInputRef.current?.click() }
            ].map((action, i) => (
              <motion.button 
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="bg-card p-4 rounded-[24px] shadow-sm flex flex-col items-center gap-3 transition-all border border-border group hover:animate-pulse-green"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner", action.color)}>
                  <action.icon size={22} />
                </div>
                <span className="text-xs font-bold text-foreground/80">{action.label}</span>
              </motion.button>
            ))}
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </section>

        {/* Prescription Scanner Banner */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-foreground px-1 transition-colors">Smart Scanner</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-90 rounded-[32px]" />
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] rounded-[32px]" />
            
            <div className="relative p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xl group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-display font-bold text-lg mb-1">Prescription Scanner</h4>
                <p className="text-emerald-50 text-xs">Snap or upload a photo to auto-fill details</p>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-white text-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg active:scale-95 transition-all"
                  >
                    Take Photo
                  </button>
                  <button 
                    onClick={() => galleryInputRef.current?.click()}
                    className="bg-emerald-400/30 backdrop-blur-md text-white border border-white/20 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full active:scale-95 transition-all"
                  >
                    Gallery
                  </button>
                </div>
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
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                            onClick={async () => {
                              // Small delay to let the animation be seen if we wanted, 
                              // but here we trigger state change which triggers exit
                              updateTaskStatus(task.id, 'completed');
                              playSuccessSound();
                              toast.success('Task completed! 🎉');
                            }}
                            className="text-primary font-bold hover:bg-primary/10 animate-pulse-green rounded-xl"
                          >
                            Done
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
        <HealthTips />

        {/* Symptom History */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-foreground transition-colors">Recent Symptoms</h3>
            <button 
              onClick={onShowSymptoms}
              className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              See History <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {symptoms.filter(s => s.profileId === activeProfileId).length > 0 ? (
              symptoms
                .filter(s => s.profileId === activeProfileId)
                .slice(0, 5)
                .map((symptom) => (
                  <motion.div
                    key={symptom.id}
                    className="min-w-[160px] bg-card p-4 rounded-[24px] border border-border shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        symptom.severity === 'mild' ? 'bg-emerald-500/10 text-emerald-500' :
                        symptom.severity === 'moderate' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      )}>
                        <AlertCircle size={16} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {format(new Date(symptom.timestamp), 'MMM d')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground truncate">{symptom.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{symptom.severity}</p>
                  </motion.div>
                ))
            ) : (
              <div className="w-full py-8 bg-muted/20 rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center px-6">
                <p className="text-xs text-muted-foreground font-medium mb-2">No symptoms recorded yet.</p>
                <button 
                  onClick={onShowSymptoms}
                  className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-4 py-2 rounded-full"
                >
                  Log Symptom
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-foreground transition-colors">Today's Schedule</h3>
            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight size={14} />
            </button>
          </div>

          {filteredReminders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-muted/30 rounded-[32px] border-2 border-dashed border-border transition-colors"
            >
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                <Activity className="text-muted-foreground/30" size={32} />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {searchQuery ? 'No matches found for your search.' : 'No medicines scheduled for today.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredReminders.sort((a, b) => a.time.localeCompare(b.time)).map((reminder, index) => {
                const med = medicines.find(m => m.id === reminder.medicineId);
                if (!med) return null;

                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    layout
                  >
                    <Card className={cn(
                      "border-none shadow-sm transition-all relative overflow-hidden rounded-[24px]",
                      reminder.status === 'taken' ? "bg-muted/50" : "bg-card"
                    )}>
                      {reminder.status === 'pending' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: med.color }} />
                      )}
                      <CardContent className="p-3 flex items-center gap-3">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: reminder.status === 'taken' ? [1, 1.2, 1] : 1,
                            rotate: reminder.status === 'taken' ? [0, 10, -10, 0] : 0
                          }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0",
                          reminder.status === 'taken' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground/30 transition-colors"
                        )}>
                          {reminder.status === 'taken' ? <Check size={18} /> : <Clock size={18} />}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={cn("font-bold text-sm truncate transition-all", reminder.status === 'taken' ? "text-muted-foreground/40 line-through" : "text-foreground")}>
                                  {med.name}
                                </h4>
                                {reminder.status === 'pending' && reminder.profileId !== activeProfileId && (
                                  <Badge variant="outline" className="text-[8px] py-0 px-1 bg-primary/5 border-primary/20 text-primary uppercase shrink-0">
                                    {profiles.find(p => p.id === reminder.profileId)?.name.split(' ')[0]}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground shrink-0">{reminder.time}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <p className="text-[10px] text-muted-foreground font-bold">{med.dosage}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className={cn(
                                "text-[9px] h-auto min-h-4 px-1.5 py-0 border-border text-muted-foreground uppercase font-black leading-tight max-w-[150px] whitespace-normal text-left transition-colors", 
                                reminder.status === 'taken' ? 'bg-green-500/10 text-green-600 border-green-500/20' : reminder.status === 'missed' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''
                              )}>
                                {reminder.status === 'taken' ? 'Done' : reminder.status === 'missed' ? 'Missed' : med.instructions || 'With Water'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {reminder.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              updateReminderStatus(reminder.id, 'taken');
                              playSuccessSound();
                              toast.success('Dose recorded! +10 Coins earned.', {
                                icon: <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">C</div>
                              });
                            }}
                            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0 animate-pulse-green"
                          >
                            <Check size={20} />
                          </motion.button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
        
        {/* Global Footer Disclaimer */}
        <footer className="mt-8 pb-8 px-4 text-center">
          <p className="text-[10px] text-black dark:text-muted-foreground font-bold leading-relaxed opacity-60">
            Disclaimer: Medicare is for information purposes only. Not for medical diagnosis or treatment. 
            Always consult a healthcare professional before making medical decisions.
          </p>
        </footer>
      </div>
    </div>
);
};
