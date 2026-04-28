import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format, differenceInMinutes, parseISO, isAfter } from 'date-fns';
import { Check, Clock, AlertCircle, ChevronRight, Sparkles, Flame, Camera, Upload, MessageSquare, Plus, Bell, Activity, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medicine, Reminder } from '../types';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { HealthTips } from '../components/HealthTips';
import { extractMedicineInfo } from '../services/aiService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface HomeProps {
  onOpenAI: () => void;
  onRefillMed: (med: Medicine) => void;
  onScanComplete: (info: any[]) => void;
  onShowMarketplace: () => void;
  onShowAIDoctor: () => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenAI, onRefillMed, onScanComplete, onShowMarketplace, onShowAIDoctor }) => {
  const { medicines, reminders, updateReminderStatus, user, activeProfileId, profiles, checkDailyLogin, tasks, updateTaskStatus } = useStore();
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [nextDose, setNextDose] = useState<{ med: Medicine, reminder: Reminder } | null>(null);

  useEffect(() => {
    checkDailyLogin();
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const profileMedicines = medicines.filter(m => m.profileId === activeProfileId);
  const profileReminders = reminders.filter(r => r.profileId === activeProfileId && r.date === today);
  const profileTasks = tasks.filter(t => t.profileId === activeProfileId && t.dueDate === today && t.status === 'pending');
  
  const takenCount = profileReminders.filter(r => r.status === 'taken').length;
  const totalCount = profileReminders.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

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
          setNextDose({ med, reminder: pending[0].reminder });
        }
      } else {
        setNextDose(null);
      }
    };

    findNextDose();
    const interval = setInterval(findNextDose, 60000);
    return () => clearInterval(interval);
  }, [profileReminders, medicines]);

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
    <div className="pb-32">
      <div className="p-6 space-y-8">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div className="space-y-1">
              <ProfileSwitcher />
              <h1 className="text-2xl font-display font-bold text-slate-900">Hello, {activeProfile.name.split(' ')[0]}</h1>
              <p className="text-slate-500 text-sm font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-1">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <div className="w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">C</div>
                  <span className="text-[10px] font-bold text-amber-700">{user?.coins || 0}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Flame size={10} className="text-orange-500 fill-orange-500" />
                  <span className="text-[10px] font-bold text-slate-500">{user?.streak || 0}d</span>
                </div>
              </div>
              <Avatar className="w-12 h-12 border-2 border-white shadow-xl">
                <AvatarImage src={activeProfile.avatar} />
                <AvatarFallback className="font-bold text-white" style={{ backgroundColor: activeProfile.color }}>
                  {activeProfile.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.header>

        {/* Adherence Summary Section */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-slate-900 px-1">Adherence Summary</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none bg-gradient-to-br from-primary to-secondary text-white premium-shadow overflow-hidden relative rounded-[32px]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-3xl" />
              
              <CardContent className="p-6 relative z-10 flex items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Daily Progress</p>
                    <p className="text-indigo-50 text-sm font-medium">{takenCount} of {totalCount} doses taken</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 inline-flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{getMotivationalMessage()}</p>
                  </div>
                </div>

                <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center relative shrink-0">
                  <svg className="w-full h-full -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={326.7}
                      strokeDashoffset={326.7 - (326.7 * progress) / 100}
                      className="text-white transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold">{Math.round(progress)}%</span>
                  </div>
                </div>
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
                <h3 className="font-display font-bold text-slate-900">Next Dose</h3>
              </div>
              <Card className="border-none glass card-shadow rounded-[20px] overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <Bell className="animate-pulse" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{nextDose.med.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {nextDose.med.dosage} • {nextDose.reminder.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In</p>
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
          <h3 className="font-display font-bold text-slate-900 px-1">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, label: 'Ask AI', color: 'bg-indigo-50 text-indigo-600', onClick: onOpenAI },
              { icon: Sparkles, label: 'AI Doctor', color: 'bg-emerald-50 text-emerald-600', onClick: onShowAIDoctor },
              { icon: ShoppingCart, label: 'Market', color: 'bg-indigo-50 text-indigo-600', onClick: onShowMarketplace },
              { icon: Camera, label: 'Scan', color: 'bg-emerald-50 text-emerald-600', onClick: () => cameraInputRef.current?.click() },
              { icon: Upload, label: 'Gallery', color: 'bg-amber-50 text-amber-600', onClick: () => galleryInputRef.current?.click() }
            ].map((action, i) => (
              <motion.button 
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="bg-white p-4 rounded-[20px] card-shadow flex flex-col items-center gap-3 transition-all group"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", action.color)}>
                  <action.icon size={24} />
                </div>
                <span className="text-xs font-bold text-slate-700">{action.label}</span>
                {action.label === 'Scan' && <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />}
                {action.label === 'Gallery' && <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Today's Tasks */}
        {profileTasks.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-display font-bold text-slate-900 px-1">Today's Tasks</h3>
            <div className="space-y-3">
              {profileTasks.map((task) => (
                <Card key={task.id} className="border-none bg-indigo-50/50 card-shadow rounded-[20px]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                      <Clock size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{task.dueTime}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        updateTaskStatus(task.id, 'completed');
                        toast.success('Task completed!');
                      }}
                      className="text-primary font-bold"
                    >
                      Done
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Health Tips */}
        <HealthTips />

        {/* Today's Schedule */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-slate-900">Today's Schedule</h3>
            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight size={14} />
            </button>
          </div>

          {profileReminders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white/50 rounded-[32px] border-2 border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Activity className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-400 text-sm font-medium">No medicines scheduled for today.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {profileReminders.sort((a, b) => a.time.localeCompare(b.time)).map((reminder, index) => {
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
                      "border-none card-shadow transition-all relative overflow-hidden rounded-[20px]",
                      reminder.status === 'taken' ? "bg-slate-50/80" : "bg-white"
                    )}>
                      {reminder.status === 'pending' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: med.color }} />
                      )}
                      <CardContent className="p-5 flex items-center gap-4">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: reminder.status === 'taken' ? [1, 1.2, 1] : 1,
                            rotate: reminder.status === 'taken' ? [0, 10, -10, 0] : 0
                          }}
                          className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                          reminder.status === 'taken' ? "bg-green-100 text-green-600" : "bg-slate-50 text-slate-400"
                        )}>
                          {reminder.status === 'taken' ? <Check size={28} /> : <Clock size={28} />}
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={cn("font-bold text-lg", reminder.status === 'taken' ? "text-slate-400 line-through" : "text-slate-900")}>
                              {med.name}
                            </h4>
                            <span className="text-xs font-bold text-slate-400">{reminder.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500 font-medium">{med.dosage}</p>
                            <Badge variant="outline" className={cn("text-[8px] h-4 px-1 border-slate-200 text-slate-400 uppercase font-bold", reminder.status === 'taken' ? 'bg-green-50 text-green-600' : reminder.status === 'missed' ? 'bg-red-50 text-red-500 border-red-200' : '')}>
                              {reminder.status === 'taken' ? 'Get well soon! 😊' : reminder.status === 'missed' ? 'Missed 😞' : med.instructions || 'With Water'}
                            </Badge>
                          </div>
                        </div>
                        {reminder.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              updateReminderStatus(reminder.id, 'taken');
                              toast.success('Dose recorded! +10 Coins earned.', {
                                icon: <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">C</div>
                              });
                            }}
                            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30"
                          >
                            <Check size={24} />
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
      </div>
    </div>
);
};
