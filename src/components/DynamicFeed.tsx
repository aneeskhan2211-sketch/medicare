import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Lightbulb, Calendar, Sparkles, ChevronRight, Utensils } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, parseISO, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface DynamicFeedProps {
  onShowDiet: () => void;
}

export const DynamicFeed: React.FC<DynamicFeedProps> = ({ onShowDiet }) => {
  const { reminders, tasks, activeProfileId, healthInsights, meals, symptoms, sideEffectAnalysis, analyzeSideEffects } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  React.useEffect(() => {
    if (symptoms.length > 0 && !sideEffectAnalysis) {
      analyzeSideEffects();
    }
  }, [symptoms, sideEffectAnalysis]);

  // 1. Process Adherence (Reminders for today)
  const profileReminders = reminders.filter(r => r.profileId === activeProfileId && r.date === today);
  const totalDoses = profileReminders.length;
  const takenDoses = profileReminders.filter(r => r.status === 'taken').length;
  
  // 2. Process Upcoming Tasks
  const profileTasks = tasks.filter(t => t.profileId === activeProfileId && t.status === 'pending');
  const upcomingTasks = profileTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = parseISO(t.dueDate);
      return isAfter(dueDate, now) || t.dueDate === today;
  }).slice(0, 3);

  // 3. Process Diet
  const todayMeals = meals.filter(m => m.date === today && m.profileId === activeProfileId);
  const totalCalories = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
  
  // 4. Health Tips (Static + AI Insights)
  const staticTips = [
    "Staying hydrated helps your body absorb and process medicine efficiently.",
    "Limit processed sugar intake to reduce chronic inflammation in the body.",
    "Poor sleep can weaken your immune system; prioritize 7-9 hours of rest."
  ];
  
  const featuredTip = healthInsights.length > 0 
    ? { title: healthInsights[0].title, description: healthInsights[0].description, isAI: true }
    : { title: "Health Reminder", description: staticTips[Math.floor(Math.random() * staticTips.length)], isAI: false };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display font-bold text-foreground transition-colors">Daily Pulse</h3>
        <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Feed</span>
      </div>

      <div className="space-y-4">
        {/* Adherence Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 to-emerald-600 rounded-[28px] opacity-20 blur group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-card border border-border/50 rounded-[24px] p-4 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-500/10 text-lime-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Adherence Score</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">{takenDoses} of {totalDoses} doses taken today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-lime-600 leading-none">{totalDoses > 0 ? Math.round((takenDoses/totalDoses) * 100) : 0}%</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Status</p>
              </div>
            </div>
            
            <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
              {profileReminders.slice(0, 5).map((r, i) => (
                <div key={i} className={cn(
                  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                  r.status === 'taken' 
                    ? "bg-lime-500/10 border-lime-500/20 text-lime-600" 
                    : r.status === 'missed'
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-600"
                    : "bg-muted/50 border-border text-muted-foreground"
                )}>
                  {r.status === 'taken' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>
              ))}
              {profileReminders.length > 5 && (
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-muted/30 border border-border text-muted-foreground text-[10px] font-bold">
                  +{profileReminders.length - 5}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Diet Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="relative group cursor-pointer"
           onClick={onShowDiet}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[28px] opacity-20 blur group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-card border border-border/50 rounded-[24px] p-4 shadow-sm overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                <Utensils size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Diet & Nutrition</h4>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {todayMeals.length > 0 ? `${todayMeals.length} meals tracked today` : 'No meals logged yet'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-emerald-600 leading-none">{totalCalories}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">kcal</p>
            </div>
          </div>
        </motion.div>

        {/* Side Effect Correlation Card */}
        {sideEffectAnalysis && sideEffectAnalysis.correlations && sideEffectAnalysis.correlations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-orange-600 rounded-[28px] opacity-10 blur group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-4 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">Potential Correlation</h4>
                  <p className="text-[10px] text-rose-600/70 font-bold uppercase tracking-widest">Medical Side Effect AI</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                <span className="font-bold text-foreground">{sideEffectAnalysis.correlations[0].symptom}</span> could be potentially linked to your <span className="font-bold text-foreground">{sideEffectAnalysis.correlations[0].med}</span>.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full border border-rose-500/20">
                  {sideEffectAnalysis.correlations[0].likelihood} Likelihood
                </span>
                <button className="text-[9px] font-black text-rose-600 underline decoration-rose-500/30 underline-offset-2">
                  VIEW FULL ANALYSIS
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tasks Section */}
        {upcomingTasks.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Upcoming Tasks
                </p>
                <button className="text-[10px] font-bold text-primary hover:underline">View All</button>
             </div>
             <div className="grid grid-cols-1 gap-2">
                {upcomingTasks.map((task, idx) => (
                    <motion.div
                       key={task.id}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="flex items-center gap-3 bg-card border border-border p-3 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                            <Clock size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{task.title}</p>
                            <p className="text-[9px] text-muted-foreground">{task.dueTime || 'All day'} • Today</p>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                    </motion.div>
                ))}
             </div>
          </div>
        )}

        {/* Dynamic Tip Card */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative"
        >
          <div className={cn(
            "rounded-[24px] p-5 border shadow-sm relative overflow-hidden",
            featuredTip.isAI 
                ? "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20" 
                : "bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20"
          )}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
                {featuredTip.isAI ? <Sparkles size={40} /> : <Lightbulb size={40} />}
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                featuredTip.isAI ? "bg-indigo-500/10 text-indigo-600" : "bg-amber-500/10 text-amber-600"
              )}>
                {featuredTip.isAI ? <Brain size={20} /> : <Lightbulb size={20} />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{featuredTip.title}</h4>
                    {featuredTip.isAI && (
                        <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase">AI Insight</span>
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {featuredTip.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Internal icon for AI if needed
const Brain = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-1.96-2.44 2.5 2.5 0 0 1-2-2.44 2.5 2.5 0 0 1-1.11-4.04V9.5A2.5 2.5 0 0 1 4.5 7 2.5 2.5 0 0 1 7 4.5 2.5 2.5 0 0 1 9.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 1.96-2.44 2.5 2.5 0 0 0 2-2.44 2.5 2.5 0 0 0 1.11-4.04V9.5A2.5 2.5 0 0 0 19.5 7 2.5 2.5 0 0 0 17 4.5 2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);
