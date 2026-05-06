import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Plus, X, Calendar, Clock, AlertCircle, Trash2, History } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Symptom } from '../types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SymptomTrackerProps {
  onClose?: () => void;
}

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({ onClose }) => {
  const { symptoms, addSymptom, deleteSymptom, activeProfileId, user } = useStore();
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  
  const [formData, setFormData] = useState({
    name: '',
    severity: 'moderate' as Symptom['severity'],
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm')
  });

  const profileSymptoms = symptoms
    .filter(s => s.profileId === activeProfileId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a symptom name');
      return;
    }

    const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

    const newSymptom: Symptom = {
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      userId: user?.id || 'unknown',
      name: formData.name,
      severity: formData.severity,
      notes: formData.notes,
      timestamp
    };

    addSymptom(newSymptom);
    toast.success('Symptom logged successfully');
    setFormData({
      name: '',
      severity: 'moderate',
      notes: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm')
    });
    setActiveTab('history');
  };

  const getSeverityColor = (severity: Symptom['severity']) => {
    switch (severity) {
      case 'mild': return 'bg-emerald-500/10 text-emerald-500';
      case 'moderate': return 'bg-amber-500/10 text-amber-500';
      case 'severe': return 'bg-rose-500/10 text-rose-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 min-h-[500px] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <Activity className="text-indigo-400" size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">Symptom Tracker</h2>
            <p className="text-xs text-slate-400">Log and monitor your health changes</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('log')} 
          className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all", activeTab === 'log' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200')}
        >
          <Plus size={16} /> Log New
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all", activeTab === 'history' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200')}
        >
          <History size={16} /> History
        </button>
      </div>

      <div className="p-4 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'log' ? (
            <motion.form
              key="log"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-4 bg-slate-900 border border-white/5 rounded-3xl p-5">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">What are you feeling?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Headache, Nausea, Fatigue" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFormData({...formData, severity: sev})}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                          formData.severity === sev 
                            ? (sev === 'mild' ? 'border-emerald-500 bg-emerald-500 text-white' :
                               sev === 'moderate' ? 'border-amber-500 bg-amber-500 text-white' :
                               'border-rose-500 bg-rose-500 text-white')
                            : 'border-white/5 bg-slate-950 text-slate-400'
                        )}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Notes (Optional)</label>
                  <textarea 
                    placeholder="Describe how you feel, any triggers, etc." 
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors resize-none text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Save Symptom Log
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {profileSymptoms.length > 0 ? (
                profileSymptoms.map((symptom) => (
                  <div key={symptom.id} className="bg-slate-900 border border-white/5 rounded-3xl p-5 group relative">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white text-lg">{symptom.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", getSeverityColor(symptom.severity))}>
                            {symptom.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {format(new Date(symptom.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteSymptom(symptom.id)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {symptom.notes && (
                      <p className="text-sm text-slate-400 mt-2 line-clamp-3 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                        {symptom.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">No symptoms logged yet</p>
                  <button 
                    onClick={() => setActiveTab('log')}
                    className="text-indigo-400 text-sm font-bold mt-2 hover:underline"
                  >
                    Log your first symptom
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
