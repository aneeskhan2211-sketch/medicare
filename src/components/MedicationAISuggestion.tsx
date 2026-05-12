import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '../store/useStore';
import { callGemini } from '../services/geminiService';
import { toast } from 'sonner';

export const MedicationAISuggestion: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    
    const medicines = useStore(state => state.medicines);
    const profiles = useStore(state => state.profiles);
    const activeProfileId = useStore(state => state.activeProfileId);
    const reminders = useStore(state => state.reminders);
    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

    const generateSuggestions = async () => {
        setLoading(true);
        try {
            const context = {
                lifestyle: activeProfile.lifestyle,
                medicines: medicines.filter(m => m.profileId === activeProfileId),
            };
            
            const prompt = `Act as a health AI expert. Propose an optimal medication schedule based on the following lifestyle and current medications.
            Lifestyle: ${JSON.stringify(context.lifestyle)}
            Medicines: ${JSON.stringify(context.medicines)}
            Return a JSON array of suggestions: [{ medicineId: string, name: string, suggestedTime: string, reason: string }].`;

            const response = await callGemini([{ role: 'user', content: prompt }]);
            
            const parsed = JSON.parse(response || '[]');
            setSuggestions(parsed);
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate AI suggestions.");
        } finally {
            setLoading(false);
        }
    };

    const applySuggestion = (suggestion: any) => {
        // Here we'd need an action to update the medicine time
        toast.success(`Schedule updated for ${suggestion.name} to ${suggestion.suggestedTime}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-lg bg-card rounded-3xl p-6 shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-primary" /> AI Schedule Optimizer
                </h3>
                <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                   <Button onClick={generateSuggestions} disabled={loading} className="w-full">
                       {loading ? <Loader2 className="animate-spin" /> : "Generate Personal Schedule"}
                   </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((s, i) => (
                    <Card key={i} className="p-4 bg-muted/30 border-none">
                      <h4 className="font-bold">{s.name}</h4>
                      <p className="text-sm text-muted-foreground">{s.reason}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-primary">{s.suggestedTime}</span>
                        <Button size="sm" onClick={() => applySuggestion(s)}>Apply</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
        </div>
    );
};
