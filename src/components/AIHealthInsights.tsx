import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, ArrowRight, Activity, Utensils, Pill, Zap, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AIHealthInsights: React.FC = () => {
  const { healthInsights, isGeneratingInsights, generateAIInsights } = useStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'diet': return <Utensils size={18} className="text-lime-500" />;
      case 'vitals': return <Activity size={18} className="text-rose-500" />;
      case 'medication': return <Pill size={18} className="text-blue-500" />;
      default: return <Zap size={18} className="text-amber-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'moderate': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  return (
    <section id="ai-health-pulse" className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Brain size={18} />
          </div>
          <h2 className="text-lg font-bold font-display">AI Health Pulse</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground font-bold hover:bg-muted/50"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>

      <Card className="border-none bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-5">
          {healthInsights.length === 0 && !isGeneratingInsights ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-white dark:bg-card rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-border">
                <Sparkles className="text-primary animate-pulse" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Discover Hidden Patterns</h3>
                <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-1 leading-relaxed">
                  Analyze how your diet, vitals, and meds affect each other.
                </p>
              </div>
              <Button 
                onClick={generateAIInsights}
                className="w-full bg-primary text-primary-foreground font-bold rounded-xl"
              >
                Analyze My Health Pulse
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-background flex items-center justify-center">
                      <Activity size={10} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-lime-500 border-2 border-background flex items-center justify-center">
                      <Utensils size={10} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                      <Brain size={10} className="text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deep Analysis Found</span>
                </div>
                {isGeneratingInsights && (
                  <div className="flex items-center gap-1.5 text-primary">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-[9px] font-black uppercase">Thinking...</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {healthInsights.slice(0, isExpanded ? undefined : 2).map((insight, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={cn(
                      "p-4 rounded-2xl border transition-all hover:shadow-md bg-white dark:bg-card",
                      insight.severity === 'high' ? 'border-rose-500/20' : 'border-border'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 p-2.5 rounded-xl bg-muted/50">
                        {getIcon(insight.type)}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm leading-tight">{insight.title}</h4>
                          <span className={cn(
                            "text-[8px] font-black px-2 py-0.5 rounded-full border uppercase",
                            getSeverityColor(insight.severity)
                          )}>
                            {insight.severity} Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                        <div className="bg-muted/30 p-2.5 rounded-xl border border-dashed border-border">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-foreground">Correlation Detected:</p>
                              <p className="text-[10px] text-muted-foreground italic leading-tight">
                                "{insight.correlation}"
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px]">
                          <span>Action: {insight.recommendation}</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!isGeneratingInsights && (
                <button 
                  onClick={generateAIInsights}
                  className="w-full py-3 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest"
                >
                  <Sparkles size={14} /> Refresh Insights
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

// Re-using UI components locally if needed or import them
const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={cn("bg-card text-card-foreground shadow", className)}>
    {children}
  </div>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);
