import React from 'react';
import { useStore } from '../store/useStore';
import { Pill, Trash2, Edit2, Plus, Info, Clock, ChevronRight, AlertTriangle, Droplets, Syringe, ClipboardList, Sun, Moon, CheckCircle2, Calendar, Package, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Medicine, MedicineType } from '../types';
import { toast } from 'sonner';

import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { MedicalBackground } from '../components/MedicalBackground';
import { InventoryWidget } from '../components/InventoryWidget';

import { cn } from '@/lib/utils';

interface MedsProps {
  onSelectMed: (med: Medicine) => void;
  onRefillMed: (med: Medicine) => void;
  onAddMed: () => void;
  onShowAISuggestions: () => void;
}

export const Meds: React.FC<MedsProps> = ({ onSelectMed, onRefillMed, onAddMed, onShowAISuggestions }) => {
  const medicines = useStore(state => state.medicines);
  const deleteMedicine = useStore(state => state.deleteMedicine);
  const reminders = useStore(state => state.reminders);
  const activeProfileId = useStore(state => state.activeProfileId);
  const profiles = useStore(state => state.profiles);
  const user = useStore(state => state.user);
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const profileMedicines = React.useMemo(() => 
    medicines.filter(m => m.profileId === activeProfileId),
    [medicines, activeProfileId]
  );
  
  const limits = {
    basic: 3,
    pro: 100,
    premium: 100,
    family_plus: 100
  };
  const limit = user ? limits[user.tier] : 3;

  const getNextTime = React.useCallback((med: Medicine) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const medReminders = reminders.filter(r => r.medicineId === med.id && r.date === today && r.status === 'pending');
    if (medReminders.length === 0) return 'Done for today';
    
    const sorted = medReminders.sort((a, b) => a.time.localeCompare(b.time));
    return sorted[0].time;
  }, [reminders]);

  const getMedIcon = (type: MedicineType) => {
    switch (type) {
      case 'liquid': return <Droplets size={28} />;
      case 'injection': return <Syringe size={28} />;
      case 'topical': return <ClipboardList size={28} />;
      default: return <Pill size={28} />;
    }
  };

  const groupedMedicines = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');
    
    const groups = {
      pending: [] as Medicine[],
      scheduled: [] as Medicine[],
      taken: [] as Medicine[]
    };
    
    profileMedicines.forEach(med => {
      const todayReminders = reminders.filter(r => r.medicineId === med.id && r.date === today);
      
      if (todayReminders.length === 0) {
        groups.scheduled.push(med);
        return;
      }
      
      const allTaken = todayReminders.every(r => r.status === 'taken');
      if (allTaken) {
        groups.taken.push(med);
        return;
      }
      
      const hasPendingNowOrPast = todayReminders.some(r => r.status === 'pending' && r.time <= now);
      if (hasPendingNowOrPast) {
        groups.pending.push(med);
      } else {
        groups.scheduled.push(med);
      }
    });
    
    return groups;
  }, [profileMedicines, reminders]);

  const renderMedCard = (med: Medicine, index: number) => {
    const stockPercent = med.totalStock ? Math.round((med.stock / med.totalStock) * 100) : 0;
    const isLowStock = med.stock < 5;
    
    return (
    <motion.div
      key={med.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <Card 
        onClick={() => onSelectMed(med)}
        className="border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden group cursor-pointer active:scale-[0.98] transition-all rounded-[24px] shadow-sm hover:shadow-md hover:border-primary/20"
      >
        <CardContent className="p-0 flex flex-col relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
            className="absolute top-0 left-0 h-1 z-10" 
            style={{ backgroundColor: med.color || 'var(--color-primary)' }} 
          />
          <div className="p-4 flex gap-4">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-inner shrink-0 relative overflow-hidden"
              style={{ backgroundColor: med.image ? 'transparent' : `${med.color}15` || 'var(--color-muted)' }}
            >
              {med.image ? (
                <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
              ) : (
                React.cloneElement(getMedIcon(med.type), { 
                  size: 26, 
                  style: { color: med.color || 'currentColor' } 
                })
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex justify-between items-start gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-base truncate pr-2 group-hover:text-primary transition-colors">
                    {med.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: med.color || 'var(--color-muted)' }}
                    />
                    {med.dosage} • {med.instructions || 'As Directed'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end shrink-0 justify-center">
              <ChevronRight size={20} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="bg-muted/30 p-3 px-4 flex items-center justify-between gap-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center shadow-inner border border-border">
                <Clock size={12} className="text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Next Dose</p>
                <p className="text-xs font-bold text-foreground">{getNextTime(med)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-background rounded-full pl-1.5 pr-3 py-1.5 border border-border">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isLowStock ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"
              )}>
                <Package size={12} />
              </div>
              <div className="flex flex-col items-end w-20">
                 <div className="flex justify-between w-full mb-1">
                   <span className="text-[9px] font-bold text-muted-foreground">Stock</span>
                   <span className={cn(
                     "text-[10px] font-bold leading-none",
                     isLowStock ? "text-amber-600" : "text-foreground"
                   )}>{med.stock}/{med.totalStock}</span>
                 </div>
                 <Progress value={stockPercent} className="h-1.5 w-full [&>div]:bg-primary" />
                 {isLowStock && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); useStore.getState().requestRefill(med.id); }}
                     className="text-[9px] mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full"
                   >
                     Refill
                   </button>
                 )}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )};

  return (
    <div className="pb-32 min-h-screen transition-colors duration-300 relative">
      <MedicalBackground />

      <div className="p-6 space-y-6 relative z-10 flex-1 flex flex-col">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <ProfileSwitcher />
              <h1 className="text-2xl font-display font-bold text-foreground transition-colors">My Medicines</h1>
              <p className="text-muted-foreground text-sm font-medium transition-colors">{profileMedicines.length} active medications</p>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowAISuggestions}
                className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-colors border border-indigo-500/20"
              >
                 <Sparkles size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddMed}
                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-green"
              >
                <Plus size={24} />
              </motion.button>
            </div>
          </header>

        {user && user.tier === 'basic' && medicines.length >= 3 && (
          <Card className="bg-primary/10 border-primary/20 p-4 rounded-3xl">
            <div className="flex gap-3">
              <Info className="text-primary shrink-0 transition-colors" size={20} />
              <p className="text-xs text-foreground/80 font-medium leading-relaxed transition-colors">
                You've reached the free limit of 3 medicines. 
                <button className="font-bold ml-1 underline decoration-2 underline-offset-2 text-primary hover:text-primary/80 transition-colors">Upgrade to Pro</button> for unlimited tracking.
              </p>
            </div>
          </Card>
        )}

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="mb-6">
            <InventoryWidget />
          </div>
          
          {profileMedicines.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 rounded-[40px]"
            >
              <div className="w-24 h-24 bg-card rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-xl border border-border">
                <Pill className="text-muted-foreground/30" size={48} />
              </div>
              <h3 className="text-foreground font-bold text-lg">No medicines added yet</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-[200px] mx-auto">Tap the + button to add your first medication.</p>
            </motion.div>
          ) : (
            <div className="space-y-8 pb-8">
              {groupedMedicines.pending.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Clock size={16} className="text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Pending Doses</h3>
                    <div className="h-[1px] flex-1 bg-border/50 ml-2" />
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] h-5">{groupedMedicines.pending.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {groupedMedicines.pending.map((med, index) => renderMedCard(med, index))}
                  </div>
                </div>
              )}

              {groupedMedicines.scheduled.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Scheduled for Later</h3>
                    <div className="h-[1px] flex-1 bg-border/50 ml-2" />
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">{groupedMedicines.scheduled.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {groupedMedicines.scheduled.map((med, index) => renderMedCard(med, index))}
                  </div>
                </div>
              )}

              {groupedMedicines.taken.length > 0 && (
                <div className="space-y-4 opacity-70 transition-opacity hover:opacity-100">
                  <div className="flex items-center gap-2 px-1">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Taken Today</h3>
                    <div className="h-[1px] flex-1 bg-border/50 ml-2" />
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-5">{groupedMedicines.taken.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {groupedMedicines.taken.map((med, index) => renderMedCard(med, index))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
);
};
