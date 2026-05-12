import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Share2, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const tips = [
  "Take medication at the same time daily to build a consistent body rhythm.",
  "Store your medications in a cool, dry place away from direct sunlight.",
  "Always check the patient info leaflet if you've missed a dose.",
  "Keep an updated digital list of all your medications for emergencies.",
  "Staying hydrated helps your body absorb and process medicine efficiently.",
  "Never stop a prescribed antibiotic course early, even if you feel better.",
  "Check with your pharmacist before taking herbal supplements with prescriptions.",
  "Regular walking for just 15 minutes can significantly improve heart health.",
  "Poor sleep can weaken your immune system; prioritize 7-9 hours of rest.",
  "Limit processed sugar intake to reduce chronic inflammation in the body."
];

export const HealthTips: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const { healthInsights, generateAIInsights, isGeneratingInsights } = useStore();

  // Use AI insights if available as additional tips
  const allTips = React.useMemo(() => {
    const combined = [...tips];
    if (healthInsights && healthInsights.length > 0) {
      healthInsights.forEach(insight => {
        combined.unshift(`${insight.title}: ${insight.description}`);
      });
    }
    return combined;
  }, [healthInsights]);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % allTips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, allTips.length]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setIndex((prev) => (prev - 1 + allTips.length) % allTips.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setIndex((prev) => (prev + 1) % allTips.length);
  };

  const addCoins = useStore(state => state.addCoins);

  const handleShare = async (tipIndex: number) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Health Tip',
          text: allTips[tipIndex],
        });
        addCoins(5);
        toast.success('Shared! You earned 5 coins!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          toast.error('Could not share.');
        }
      }
    } else {
      const mailtoLink = `mailto:?subject=Health Tip&body=${encodeURIComponent(allTips[tipIndex])}`;
      window.location.href = mailtoLink;
      addCoins(5);
      toast.success('Shared! You earned 5 coins!');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="font-display text-sm font-black uppercase tracking-widest text-muted-foreground/80">
              {healthInsights.length > 0 && index < healthInsights.length ? 'Personalized Insight' : 'Expert Wisdom'}
            </h3>
        </div>
        <div className="flex items-center gap-2">
          {isGeneratingInsights ? (
            <div className="flex items-center gap-1 text-[8px] font-bold text-primary animate-pulse">
              <Play size={8} className="animate-spin" /> ANALYZING...
            </div>
          ) : (
            <button 
              onClick={() => setIsAutoPlay(!isAutoPlay)} 
              className="text-muted-foreground/60 hover:text-primary p-1.5 rounded-full hover:bg-primary/5 transition-all outline-none"
              title={isAutoPlay ? "Pause Auto-play" : "Start Auto-play"}
            >
              {isAutoPlay ? <Pause size={10} /> : <Play size={10} />}
            </button>
          )}
          <div className="flex gap-1">
            <button 
              onClick={handlePrev}
              className="text-muted-foreground/60 hover:text-primary p-1.5 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all outline-none"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNext}
              className="text-muted-foreground/60 hover:text-primary p-1.5 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all outline-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative h-[100px] sm:h-[110px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute inset-0"
          >
            <Card className={cn(
              "h-full border-none shadow-xl rounded-[28px] overflow-hidden group relative transition-all duration-500",
              healthInsights.length > 0 && index < healthInsights.length
                ? "bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-indigo-950"
                : "bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black"
            )}>
               {/* Decorative background */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-all duration-700" />
               <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-700" />
               
              <CardContent className="h-full p-0 flex items-center justify-between gap-4 px-6 relative z-10">
                <div className="flex items-center gap-5 flex-1 cursor-pointer" onClick={() => setIsAutoPlay(!isAutoPlay)}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500",
                    healthInsights.length > 0 && index < healthInsights.length
                      ? "bg-white/20 text-white backdrop-blur-md"
                      : "bg-primary/20 text-primary border border-primary/10"
                  )}>
                    {healthInsights.length > 0 && index < healthInsights.length 
                      ? <Lightbulb size={24} strokeWidth={2.5} className="animate-pulse" />
                      : <Lightbulb size={24} strokeWidth={2.5} />
                    }
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-[13px] sm:text-[15px] font-bold leading-snug line-clamp-3",
                      healthInsights.length > 0 && index < healthInsights.length ? "text-white" : "text-slate-100"
                    )}>
                      {allTips[index]}
                    </p>
                    {healthInsights.length > 0 && index < healthInsights.length && (
                      <div className="flex items-center gap-1.5 opacity-60">
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Generated Insight</span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleShare(index)} 
                    className={cn(
                      "p-3 rounded-2xl border transition-all shrink-0",
                      healthInsights.length > 0 && index < healthInsights.length
                        ? "text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/10"
                        : "text-slate-400 hover:text-primary bg-white/5 hover:bg-white/10 border-white/5"
                    )}
                    aria-label="Share tip"
                >
                  <Share2 size={18} />
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center gap-1.5">
        {allTips.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoPlay(false);
              setIndex(i);
            }}
            className="group py-2 px-0.5"
            aria-label={`Go to tip ${i + 1}`}
          >
            <div className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index 
                ? (healthInsights.length > 0 && i < healthInsights.length ? "w-8 bg-white" : "w-8 bg-primary") 
                : "w-1.5 bg-slate-200/20 group-hover:bg-slate-200/40"
            )} />
          </button>
        ))}
      </div>

      {healthInsights.length === 0 && !isGeneratingInsights && (
        <button 
          onClick={generateAIInsights}
          className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest border border-indigo-500/20 mt-2"
        >
          <Sparkles size={14} /> Analyze My Data for Personalized Tips
        </button>
      )}
    </section>
  );
};

