import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Check, X, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Medicine, MedicineType } from '../types';

import { cn } from '@/lib/utils';

interface ReviewScanProps {
  meds: any[];
  onComplete: () => void;
  onCancel: () => void;
  onEdit: (med: any) => void;
}

export const ReviewScan: React.FC<ReviewScanProps> = ({ meds: initialMeds, onComplete, onCancel, onEdit }) => {
  const { addMedicine, activeProfileId, user } = useStore();
  const [meds, setMeds] = useState(initialMeds.map((m, i) => ({ ...m, id: i, selected: true })));

  const handleEdit = (med: any) => {
    onEdit(med);
  };

  const handleToggle = (id: number) => {
    setMeds(meds.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const handleRemove = (id: number) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getAverageConfidence = (confidence: any) => {
    if (!confidence) return 0;
    const scores = Object.values(confidence).filter(v => typeof v === 'number') as number[];
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const handleSaveAll = () => {
    const selectedMeds = meds.filter(m => m.selected);
    if (selectedMeds.length === 0) {
      toast.error('Please select at least one medication');
      return;
    }

    selectedMeds.forEach(m => {
      const newMed: Medicine = {
        id: Math.random().toString(36).substr(2, 9),
        name: m.name,
        dosage: m.dosage,
        type: (m.type?.toLowerCase() || 'pill') as MedicineType,
        frequency: m.frequency || 'Daily',
        times: m.times || ['08:00'],
        instructions: m.instructions || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: m.expiryDate || undefined,
        expiryDate: m.expiryDate || undefined,
        stock: m.stock || 30,
        totalStock: m.stock || 30,
        profileId: activeProfileId,
        userId: user?.id || 'user-1',
        color: 'indigo',
        snoozeEnabled: true,
        snoozeInterval: 15
      };
      addMedicine(newMed);
    });

    toast.success(`Successfully added ${selectedMeds.length} medications!`);
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Review Prescription</h2>
          <p className="text-sm text-slate-500">We found {meds.length} medications</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {meds.map((med) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "group relative bg-white rounded-2xl p-3 card-shadow border border-slate-100 transition-all",
                med.selected ? "border-indigo-200 ring-2 ring-indigo-50" : "opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => handleToggle(med.id)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0",
                    med.selected ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"
                  )}
                >
                  {med.selected ? <Check size={18} /> : <Plus size={18} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{med.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-slate-500">{med.dosage}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-medium text-slate-500">{med.frequency}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button 
                        onClick={() => handleRemove(med.id)}
                        className="text-slate-200 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleEdit(med)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {meds.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Pill size={32} />
            </div>
            <p className="text-slate-500">No medications selected</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <Button 
          onClick={handleSaveAll}
          disabled={meds.filter(m => m.selected).length === 0}
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-200"
        >
          Add {meds.filter(m => m.selected).length} Medications
        </Button>
      </div>
    </div>
  );
};
