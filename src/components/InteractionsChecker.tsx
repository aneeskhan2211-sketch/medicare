import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ShieldCheck, Pill, Search, CheckSquare, Square } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { checkMedicationInteractions } from '../services/aiService';

export const InteractionsChecker: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { medicines, activeProfileId, profiles } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  const toggleMedicine = (medId: string) => {
    setSelectedIds(prev => 
      prev.includes(medId) ? prev.filter(id => id !== medId) : [...prev, medId]
    );
  };

  const checkInteractions = async () => {
    if (selectedIds.length < 2) {
      toast.error('Please select at least two medications to check interactions.');
      return;
    }
    
    setIsChecking(true);
    const selectedMeds = medicines.filter(m => selectedIds.includes(m.id));
    
    try {
      const interactionResults = await checkMedicationInteractions(selectedMeds, activeProfile);
      setResults(interactionResults);
    } catch (error) {
      toast.error('Failed to check interactions.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col"
    >
      <div className="bg-card w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md md:m-auto md:rounded-[40px] md:border md:border-border overflow-hidden flex flex-col shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">Drug Interactions</h2>
            <p className="text-sm text-muted-foreground">Select medications to check</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-card rounded-2xl border border-border">
            <h3 className="p-5 font-bold text-foreground border-b border-border flex items-center gap-2">
              <Pill size={18} className="text-primary" /> Select Medications ({selectedIds.length})
            </h3>
            {medicines.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No medications added yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {medicines.map(med => (
                  <li key={med.id} 
                      onClick={() => toggleMedicine(med.id)}
                      className="text-sm font-medium text-foreground px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {selectedIds.includes(med.id) ? (
                        <CheckSquare className="text-primary" size={20} />
                      ) : (
                        <Square className="text-muted-foreground" size={20} />
                      )}
                      {med.name}
                    </div>
                    <span className="text-xs text-muted-foreground">{med.dosage}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={checkInteractions}
            disabled={selectedIds.length < 2 || isChecking}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {isChecking ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</>
            ) : (
              <><Search size={20} /> Analyze Interactions</>
            )}
          </button>

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-2xl p-5 border ${
                  results.severity === 'low' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  results.severity === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' :
                  'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-sm">
                  {results.severity === 'low' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                  {results.interactionFound ? 'Interaction Found' : 'No Major Interactions'}
                </div>
                <p className="text-sm leading-relaxed mb-3">{results.details}</p>
                <p className="text-xs font-bold bg-white/50 p-2 rounded-lg text-foreground">{results.recommendation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
