import React, { useState, useEffect } from 'react';
import { Medicine, Lifestyle, SmartScheduleSuggestion } from '../types';
import { useStore } from '../store/useStore';
import { getSmartSchedule, SmartScheduleResponse } from '../services/aiService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Clock, 
  Info, 
  Check, 
  X, 
  ArrowRight, 
  Coffee, 
  Sun, 
  Moon, 
  Activity,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface SmartScheduleProps {
  medicine: Partial<Medicine>;
  onAccept: (times: string[]) => void;
  onCancel: () => void;
}

export const SmartSchedule: React.FC<SmartScheduleProps> = ({ medicine, onAccept, onCancel }) => {
  const { profiles, activeProfileId, medicines, getAdherenceData } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const adherenceData = getAdherenceData();
  const profileMeds = medicines.filter(m => m.profileId === activeProfileId);
  
  const [isLoading, setIsLoading] = useState(true);
  const [suggestion, setSuggestion] = useState<SmartScheduleResponse | null>(null);
  const [editedTimes, setEditedTimes] = useState<string[]>([]);
  
  const defaultLifestyle: Lifestyle = {
    wakeTime: '07:00',
    sleepTime: '23:00',
    mealTimes: {
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '19:30'
    },
    activityLevel: 'moderate'
  };

  const lifestyle = activeProfile?.lifestyle || defaultLifestyle;

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        setIsLoading(true);
        const result = await getSmartSchedule(medicine, lifestyle, profileMeds, adherenceData);
        setSuggestion(result);
        setEditedTimes(result.suggestedTimes);
      } catch (error) {
        console.error(error);
        toast.error("Failed to generate smart schedule. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, [medicine, lifestyle, profileMeds.length]);

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...editedTimes];
    newTimes[index] = value;
    setEditedTimes(newTimes);
  };

  const addTime = () => {
    setEditedTimes([...editedTimes, '12:00']);
  };

  const removeTime = (index: number) => {
    setEditedTimes(editedTimes.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 bg-white">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600"
          />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900">Analyzing Schedule</h3>
          <p className="text-slate-500 text-sm">MediPulse is calculating the optimal times based on your lifestyle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Smart Schedule</h2>
            <p className="text-xs text-slate-500">AI-Powered Recommendations</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 pb-32">
          {/* Lifestyle Context */}
          <div className="grid gap-4">
            <Card className="p-4 border-none shadow-sm bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={80} />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Lifestyle Context</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Coffee className="text-amber-500" size={16} />
                  <span className="text-sm font-medium text-slate-700">Breakfast: {lifestyle.mealTimes.breakfast}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="text-orange-500" size={16} />
                  <span className="text-sm font-medium text-slate-700">Lunch: {lifestyle.mealTimes.lunch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="text-indigo-500" size={16} />
                  <span className="text-sm font-medium text-slate-700">Dinner: {lifestyle.mealTimes.dinner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="text-emerald-500" size={16} />
                  <span className="text-sm font-medium text-slate-700 capitalize">{lifestyle.activityLevel} Activity</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border-none shadow-sm bg-white">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Other Meds</h4>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg">
                    {profileMeds.length} Active
                   </Badge>
                   <span className="text-[10px] text-slate-400 font-medium">Analyzed for interactions</span>
                </div>
              </Card>
              <Card className="p-4 border-none shadow-sm bg-white">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adherence</h4>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg">
                    {adherenceData.length > 0 ? `${(adherenceData.reduce((acc, curr) => acc + (curr.taken/curr.total), 0) / adherenceData.length * 100).toFixed(0)}%` : 'New'}
                   </Badge>
                   <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Optimizing pattern</span>
                </div>
              </Card>
            </div>
          </div>

          {/* AI Reasoning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 border-none shadow-sm bg-indigo-600 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="flex gap-3">
                <div className="mt-1">
                  <Info size={18} className="text-indigo-200" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-indigo-100 text-sm">AI Recommendation</h4>
                  <p className="text-sm leading-relaxed text-indigo-50">
                    {suggestion?.reasoning}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Suggested Times */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Times</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addTime}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 gap-1"
              >
                <Plus size={14} /> Add Time
              </Button>
            </div>
            
            <div className="space-y-3">
              {editedTimes.map((time, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Clock size={18} />
                    </div>
                    <Input
                      type="time"
                      value={time || ''}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white text-lg font-medium focus-visible:ring-indigo-600"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTime(index)}
                    className="h-14 w-14 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lifestyle Adjustments */}
          {suggestion?.lifestyleAdjustments && (
            <Card className="p-5 border-none shadow-sm bg-amber-50 border-l-4 border-amber-400">
              <div className="flex gap-3">
                <div className="mt-1">
                  <Activity size={18} className="text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm">Lifestyle Tips</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {suggestion.lifestyleAdjustments}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 bg-white border-t border-slate-100 fixed bottom-0 inset-x-0 max-w-md mx-auto">
        <Button 
          onClick={() => onAccept(editedTimes)}
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Apply Smart Schedule
        </Button>
      </div>
    </div>
  );
};
