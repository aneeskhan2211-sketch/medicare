import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Brain, Zap, Send, Sparkles, ChevronRight, History, Smile, Meh, Frown, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const HealthChronicles: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { symptoms, addSymptom, user, activeProfileId } = useStore();
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'low' | 'bad'>('neutral');
  const [energy, setEnergy] = useState<number>(3);
  const [pain, setPain] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const profileChronicles = symptoms.filter(s => s.profileId === activeProfileId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSave = () => {
    addSymptom({
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      userId: user?.id || 'unknown',
      name: 'Daily Check-in',
      severity: pain > 3 ? 'severe' : pain > 1 ? 'moderate' : 'mild',
      mood,
      energy: energy as any,
      pain: pain as any,
      timestamp: new Date().toISOString(),
      notes
    });
    
    toast.success('Journal entry saved!');
    setNotes('');
    setAiInsight(null);
  };

  const analyzePatterns = () => {
    setIsAnalyzing(true);
    // Simulation of AI analysis
    setTimeout(() => {
      setAiInsight("AI Analysis: We've noticed your energy levels are consistently 20% higher on days you take your Vitamin D in the morning. Great job maintaining adherence!");
      setIsAnalyzing(false);
    }, 2000);
  };

  const getMoodIcon = (m: string) => {
    switch (m) {
      case 'great': return <ThumbsUp className="text-emerald-500" />;
      case 'good': return <Smile className="text-emerald-400" />;
      case 'neutral': return <Meh className="text-blue-400" />;
      case 'low': return <Frown className="text-amber-500" />;
      case 'bad': return <ThumbsDown className="text-rose-500" />;
      default: return <Meh size={24} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold">Health Chronicles</h2>
          <p className="text-muted-foreground text-sm">Log your journey daily</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ChevronRight className="rotate-90" />
        </Button>
      </header>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-8 pb-32">
          {/* New Entry */}
          <Card className="border-none bg-muted/50 rounded-[32px] overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Brain size={14} className="text-primary" />
                  How are you feeling?
                </label>
                <div className="flex justify-between gap-1">
                  {(['bad', 'low', 'neutral', 'good', 'great'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        "flex-1 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all",
                        mood === m ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" : "bg-background/50 text-muted-foreground hover:bg-background"
                      )}
                    >
                      {getMoodIcon(m)}
                      <span className="text-[10px] font-bold capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    Energy Level
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setEnergy(val)}
                        className={cn(
                          "w-full h-10 rounded-lg font-black transition-all",
                          energy === val ? "bg-amber-500 text-white" : "bg-background/50 text-muted-foreground"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Heart size={14} className="text-rose-500" />
                    Pain Level
                  </label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPain(val)}
                        className={cn(
                          "w-full h-10 rounded-lg font-black transition-all",
                          pain === val ? "bg-rose-500 text-white" : "bg-background/50 text-muted-foreground"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</label>
                <Textarea
                  placeholder="Today I felt a bit dizzy after lunch..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-2xl bg-background border-none min-h-[100px] resize-none focus-visible:ring-primary/20"
                />
              </div>

              <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                <Send size={18} className="mr-2" /> Save Journal Entry
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights Segment */}
          <Card className="border-none bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[32px] overflow-hidden shadow-xl shadow-indigo-200 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 animate-pulse">
              <Sparkles size={80} />
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-none">AI UPGRADE</Badge>
              </div>
              <h3 className="text-xl font-display font-bold">Predictive Adherence Discovery</h3>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Connect your mood logs with medication data to find hidden biological patterns.
              </p>
              {aiInsight ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/10 rounded-2xl border border-white/20">
                  <p className="text-sm font-medium italic">{aiInsight}</p>
                </motion.div>
              ) : (
                <Button onClick={analyzePatterns} disabled={isAnalyzing} className="bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-bold w-full uppercase tracking-widest text-[10px] h-12 mt-2">
                  {isAnalyzing ? "Analyzing Trends..." : "Run AI Pattern Analysis"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold flex items-center gap-2">
              <History size={20} className="text-primary" />
              Recent Logs
            </h3>
            <div className="space-y-4">
              {profileChronicles.map((log) => (
                <div key={log.id} className="p-5 bg-card border border-border rounded-[24px] space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        {log.mood ? getMoodIcon(log.mood) : <History size={18} className="text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(log.timestamp), 'hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {log.energy && <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-none text-[8px]">Energy {log.energy}</Badge>}
                      {log.pain !== undefined && <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 border-none text-[8px]">Pain {log.pain}</Badge>}
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed pl-13 border-l-2 border-border ml-5 py-1">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))}
              {profileChronicles.length === 0 && (
                <div className="text-center py-10 text-muted-foreground italic bg-muted/20 rounded-3xl">
                  No health logs found. Start your first log above!
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
