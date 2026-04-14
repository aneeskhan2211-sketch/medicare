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
  const { medicines, deleteMedicine, reminders, activeProfileId, profiles, user } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const profileMedicines = medicines.filter(m => m.profileId === activeProfileId);
  
  const limits = {
    basic: 3,
    pro: 100,
    premium: 100,
    family_plus: 100
  };
  const limit = user ? limits[user.tier] : 3;

  const getNextTime = (med: Medicine) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const medReminders = reminders.filter(r => r.medicineId === med.id && r.date === today && r.status === 'pending');
    if (medReminders.length === 0) return 'Done for today';
    
    const sorted = medReminders.sort((a, b) => a.time.localeCompare(b.time));
    return sorted[0].time;
  };

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
              <h1 className="text-2xl font-display font-bold text-slate-900">My Medicines</h1>
              <p className="text-slate-500 text-sm font-medium">{profileMedicines.length} active medications</p>
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
          <Card className="bg-indigo-50 border-indigo-100 p-4 rounded-3xl">
            <div className="flex gap-3">
              <Info className="text-indigo-500 shrink-0" size={20} />
              <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                You've reached the free limit of 3 medicines. 
                <button className="font-bold ml-1 underline decoration-2 underline-offset-2">Upgrade to Pro</button> for unlimited tracking.
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
              <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                <Pill className="text-slate-200" size={48} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No medicines added yet</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-[200px] mx-auto">Tap the + button to add your first medication.</p>
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
                    className="border-none card-shadow overflow-hidden group cursor-pointer active:scale-[0.98] transition-all rounded-[20px] bg-white"
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
                        className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-inner"
                      >
                        {getMedIcon(med.type)}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xl group-hover:text-primary transition-colors">{med.name}</h4>
                            <p className="text-sm text-slate-500 font-bold mt-0.5">{med.dosage}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className={cn(
                              "font-bold px-2 py-0.5 rounded-lg", 
                              med.stock < 5 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
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
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className="bg-indigo-50 text-indigo-600 border-none text-[10px] font-bold px-2 py-0.5">
                            {med.instructions || 'After Meal'}
                          </Badge>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Next: {getNextTime(med)}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-200 group-hover:text-primary transition-colors" />
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
