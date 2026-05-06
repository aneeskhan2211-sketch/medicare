import React from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, Calendar, CheckCircle2, XCircle, 
  Download, Flame, Trophy, Info, Lock, Activity, Target, Zap, ChevronRight, FileText, Sparkles, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { MedicalBackground } from '../components/MedicalBackground';

export const Analytics: React.FC = () => {
  const { reminders, isPremium, user, getAdherenceData, settings, updateSettings } = useStore();

  // Get real adherence data from store
  const adherenceData = getAdherenceData();
  const weeklyData = adherenceData.map(item => ({
    name: format(parseISO(item.date), 'EEE'),
    taken: item.taken,
    missed: Math.max(0, item.total - item.taken),
    fullDate: item.date
  }));

  const adherencePercent = adherenceData.reduce((acc, curr) => acc + curr.total, 0) > 0 
    ? Math.round((adherenceData.reduce((acc, curr) => acc + curr.taken, 0) / adherenceData.reduce((acc, curr) => acc + curr.total, 0)) * 100) 
    : 0;

  const totalTaken = adherenceData.reduce((acc, curr) => acc + curr.taken, 0);
  const totalDoses = adherenceData.reduce((acc, curr) => acc + curr.total, 0);
  const missedCount = totalDoses - totalTaken;

  const monthlyAdherence = [
    { date: 'Week 1', value: 85 },
    { date: 'Week 2', value: 92 },
    { date: 'Week 3', value: 78 },
    { date: 'Week 4', value: 95 },
  ];

  const COLORS = ['#5B3DF5', '#EF4444'];
  const pieData = [
    { name: 'Taken', value: totalTaken || 1 },
    { name: 'Missed', value: missedCount || 0 },
  ];

  const getHealthScore = () => {
    // Adherence counts for 70%
    // Streak counts for 30%
    const score = (adherencePercent * 0.7) + (Math.min(user?.streak || 0, 10) * 3);
    return Math.min(Math.round(score), 100);
  };

  const healthScore = getHealthScore();

  const handleExportPDF = () => {
    toast.success('Generating health report...', {
      description: 'Your monthly adherence report is being prepared.',
      icon: <FileText size={16} className="text-indigo-500" />
    });
  };

  return (
    <div className="h-full flex flex-col transition-colors duration-300 relative overflow-hidden">
      <MedicalBackground />

      <header className="p-6 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border flex justify-between items-center transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-xs font-medium">Your health progress</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const newMode = !settings.darkMode;
              updateSettings({ darkMode: newMode });
              toast.info(newMode ? 'Dark mode activated' : 'Light mode activated');
            }}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border"
          >
            {settings.darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleExportPDF}
            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"
          >
            <Download size={20} />
          </motion.button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-32 relative z-10">
          {/* Adherence Ring & Main Stats */}
          <section className="grid grid-cols-2 gap-4">
            <Card className="border-none bg-primary text-white rounded-[32px] card-shadow p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="text-center relative z-10">
                <h3 className="text-3xl font-display font-bold">{healthScore}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Health Score</p>
              </div>
            </Card>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 flex flex-col items-center justify-center gap-2 border border-border transition-colors">
              <Flame size={24} className="text-orange-500 fill-orange-500" />
              <div className="text-center">
                <h3 className="text-3xl font-display font-bold text-foreground">{user?.streak || 0}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Day Streak</p>
              </div>
            </Card>
          </section>

          {/* AI Clinical Insight Card */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1 flex items-center gap-2">
              <Sparkles size={20} className="text-primary" /> AI Clinical Analysis
            </h3>
            <Card className="border-none bg-gradient-to-br from-indigo-500 to-primary text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Vitality Report</h4>
                    <p className="text-[10px] opacity-70 font-bold uppercase">72 Hour Analysis</p>
                  </div>
                </div>
                
                <p className="text-sm font-medium leading-relaxed">
                  Based on your {adherencePercent}% adherence and consistent log patterns, your metabolic health is stabilized. {healthScore < 80 ? 'We recommend focusing on your afternoon doses to boost your score.' : 'Your consistency is exceptional, suggesting high efficacy of treatment.'}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-[9px] font-bold uppercase opacity-60 mb-1">Consistency</p>
                    <p className="text-xs font-bold">{adherencePercent >= 90 ? 'Critical' : 'High'}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-[9px] font-bold uppercase opacity-60 mb-1">Metabolic Rate</p>
                    <p className="text-xs font-bold">Stable</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Achievement Badges */}
          <section className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-2 rounded-2xl flex gap-2 items-center whitespace-nowrap">
              <Trophy size={14} />
              <span className="font-bold text-xs">5 Day Streak</span>
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-2 rounded-2xl flex gap-2 items-center whitespace-nowrap">
              <CheckCircle2 size={14} />
              <span className="font-bold text-xs">Perfect Week</span>
            </Badge>
            <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-2 rounded-2xl flex gap-2 items-center whitespace-nowrap">
              <Zap size={14} />
              <span className="font-bold text-xs">Fast Recovery</span>
            </Badge>
          </section>

          {/* Weekly Chart */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground">Weekly Activity</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">This Week</Badge>
            </div>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border transition-colors">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: 'currentColor', fontWeight: 600}} 
                      className="text-muted-foreground"
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'currentColor', opacity: 0.1, radius: 8}}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="taken" fill="var(--color-primary)" radius={[6, 6, 6, 6]} barSize={12} />
                    <Bar dataKey="missed" fill="#EF4444" radius={[6, 6, 6, 6]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-muted-foreground">Taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-muted-foreground">Missed</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Insights */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Health Insights</h3>
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 4 }}
                className="p-5 bg-card rounded-[28px] card-shadow border border-border flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">{adherencePercent >= 90 ? 'Great Progress!' : 'Good Start!'}</h4>
                  <p className="text-xs text-muted-foreground font-medium">Your overall adherence is {adherencePercent}% this week.</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground/30" />
              </motion.div>
              <motion.div 
                whileHover={{ x: 4 }}
                className="p-5 bg-card rounded-[28px] card-shadow border border-border flex items-center gap-4 border-l-4 border-l-red-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
                  <XCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">{missedCount > 0 ? 'Dose Alert' : 'Keep it Up!'}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{missedCount > 0 ? `You missed ${missedCount} doses in the last 7 days.` : 'You haven\'t missed any doses this week!'}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground/30" />
              </motion.div>
            </div>
          </section>

          {/* PDF Export Button */}
          <Button 
            onClick={handleExportPDF}
            className="w-full h-14 rounded-[24px] bg-card text-foreground border border-border card-shadow font-bold flex gap-3 hover:bg-muted transition-all"
          >
            <FileText size={20} className="text-primary" />
            Export Monthly Report (PDF)
          </Button>

          {/* Monthly Trend (Premium) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground">Monthly Trend</h3>
              {!isPremium && <Badge className="bg-amber-100 text-amber-700 border-none font-bold">PRO</Badge>}
            </div>
            
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border relative overflow-hidden transition-colors">
              <div className={cn("h-64 w-full", !isPremium && "blur-md opacity-20 pointer-events-none")}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAdherence}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: 'currentColor', fontWeight: 600}} 
                      className="text-muted-foreground"
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-primary)" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: 'var(--color-primary)', strokeWidth: 3, stroke: '#fff' }}
                      activeDot={{ r: 8, fill: 'var(--color-primary)', strokeWidth: 4, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {!isPremium && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-background/40 backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm">
                    <Lock size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Premium Insights</h4>
                  <p className="text-xs text-muted-foreground mt-2 mb-6 max-w-[220px] font-medium leading-relaxed">
                    Get detailed monthly behavior analysis and health reports.
                  </p>
                  <Button className="rounded-2xl bg-primary font-bold shadow-xl shadow-primary/20 px-8 h-12">
                    Upgrade Now
                  </Button>
                </div>
              )}
            </Card>
          </section>

          {/* Dose Breakdown */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Dose Breakdown</h3>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border flex items-center gap-8 transition-colors">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-muted-foreground">Taken</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{totalTaken}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-bold text-muted-foreground">Missed</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{missedCount}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                    <span className="text-sm font-bold text-foreground">{totalDoses}</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
);
};
