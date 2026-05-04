import React from 'react';
import { useStore } from '../store/useStore';
import { Pill, Trash2, Edit2, Plus, Info, Clock, ChevronRight, AlertTriangle, Droplets, Syringe, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Medicine, MedicineType } from '../types';

import { ProfileSwitcher } from '../components/ProfileSwitcher';

import { cn } from '@/lib/utils';

interface MedsProps {
  onSelectMed: (med: Medicine) => void;
  onRefillMed: (med: Medicine) => void;
}

export const Meds: React.FC<MedsProps> = ({ onSelectMed, onRefillMed }) => {
  const medicines = useStore(state => state.medicines);
  const deleteMedicine = useStore(state => state.deleteMedicine);
  const reminders = useStore(state => state.reminders);
  const activeProfileId = useStore(state => state.activeProfileId);
  const profiles = useStore(state => state.profiles);
  const user = useStore(state => state.user);

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

  return (
    <div className="pb-32 h-full flex flex-col">
      <div className="p-6 space-y-6">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <ProfileSwitcher />
              <h1 className="text-2xl font-display font-bold text-foreground transition-colors">My Medicines</h1>
              <p className="text-muted-foreground text-sm font-medium transition-colors">{profileMedicines.length} active medications</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Plus size={24} />
            </motion.button>
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
          {profileMedicines.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-card rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-xl border border-border shadow-slate-200/50">
                <Pill className="text-muted-foreground/30" size={48} />
              </div>
              <h3 className="text-foreground font-bold text-lg">No medicines added yet</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-[200px] mx-auto">Tap the + button to add your first medication.</p>
            </motion.div>
          ) : (
            <div className="space-y-5 pb-8">
              {profileMedicines.map((med, index) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  layout
                >
                  <Card 
                    onClick={() => onSelectMed(med)}
                    className="border-none shadow-md overflow-hidden group cursor-pointer active:scale-[0.98] transition-all rounded-[20px] bg-card"
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                      className="h-2" 
                      style={{ backgroundColor: med.color }} 
                    />
                    <CardContent className="p-6 flex items-center gap-5">
                      <motion.div 
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        className="w-16 h-16 rounded-[24px] bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-inner"
                      >
                        {getMedIcon(med.type)}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-foreground text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                                <span className="text-muted-foreground/40 group-hover:text-primary transition-colors">
                                  {React.cloneElement(getMedIcon(med.type), { size: 18 })}
                                </span>
                                {med.name}
                            </h4>
                            <p className="text-sm text-muted-foreground font-bold mt-0.5">{med.dosage}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className={cn(
                              "font-bold px-2 py-0.5 rounded-lg border border-border", 
                              med.stock < 5 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground"
                            )}>
                              {med.stock}/{med.totalStock}
                            </Badge>
                            {med.stock < 5 && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              >
                                <AlertTriangle size={14} className="text-amber-500" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <Badge className="bg-primary/10 text-primary border-none text-[11px] font-bold px-3 py-1.5 rounded-xl h-auto whitespace-normal text-left leading-relaxed inline-block max-w-[200px]">
                                {med.instructions || 'After Meal'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">
                              <Clock size={12} className="shrink-0 text-muted-foreground/50" />
                              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Next: {getNextTime(med)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
);
};
