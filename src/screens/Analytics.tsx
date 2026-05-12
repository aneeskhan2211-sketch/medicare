import React from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, XCircle, 
  Download, Flame, Trophy, Lock, Activity, Zap, ChevronRight, FileText, Sparkles, Sun, Moon,
  Pill, Droplets, Syringe, ClipboardList, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { MedicalBackground } from '../components/MedicalBackground';
import { DoctorReportWidget } from '../components/DoctorReportWidget';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { LabTrendChart } from '../components/LabTrendChart';
import { getHealthTrajectory } from '../services/aiService';

export const Analytics: React.FC = () => {
    const { reminders, isPremium, user, getAdherenceData, settings, updateSettings, activeProfileId, profiles, medicines, vitals } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [trajectory, setTrajectory] = React.useState<any>(null);
  const [isGeneratingTrajectory, setIsGeneratingTrajectory] = React.useState(false);

  React.useEffect(() => {
    const fetchTrajectory = async () => {
      if (!isPremium || trajectory) return;
      setIsGeneratingTrajectory(true);
      try {
        const data = await getHealthTrajectory(vitals, activeProfile);
        setTrajectory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingTrajectory(false);
      }
    };
    fetchTrajectory();
  }, [isPremium, activeProfileId, vitals, activeProfile]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const vitalsTrendData = React.useMemo(() => {
    return last7Days.map(dateStr => {
      const dayVitals = vitals.filter(v => v.profileId === activeProfileId && v.timestamp.startsWith(dateStr));
      
      const hrItems = dayVitals.filter(v => v.type === 'heart_rate' && !isNaN(Number(v.value)));
      const avgHr = hrItems.length > 0 ? Math.round(hrItems.reduce((acc, v) => acc + Number(v.value), 0) / hrItems.length) : null;
      
      const spo2Items = dayVitals.filter(v => v.type === 'spo2' && !isNaN(Number(v.value)));
      const avgSpo2 = spo2Items.length > 0 ? Math.round(spo2Items.reduce((acc, v) => acc + Number(v.value), 0) / spo2Items.length) : null;

      return {
        date: format(parseISO(dateStr), 'EEE'),
        fullDate: dateStr,
        heartRate: avgHr,
        spo2: avgSpo2
      };
    });
  }, [vitals, activeProfileId, last7Days]);

  const individualAdherence = React.useMemo(() => {
    return medicines
      .filter(m => m.profileId === activeProfileId || !m.profileId) // if profileId exists, match it
      .map(med => {
      const medReminders = reminders.filter(r => r.medicineId === med.id && last7Days.includes(r.date));
      const total = medReminders.length;
      const taken = medReminders.filter(r => r.status === 'taken').length;
      const missed = total - taken;
      const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
      return { ...med, total, taken, missed, percent };
    }).filter(med => med.total > 0).sort((a, b) => b.percent - a.percent);
  }, [medicines, reminders, last7Days, activeProfileId]);

  const getMedIcon = (type: string) => {
    switch (type) {
      case 'liquid': return <Droplets />;
      case 'injection': return <Syringe />;
      case 'topical': return <ClipboardList />;
      default: return <Pill />;
    }
  };

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

  const { get30DayAdherenceData } = useStore();
  const heartbeatData = React.useMemo(() => {
    const rawData = get30DayAdherenceData();
    const data: { time: string; value: number; date: string; opacity: number }[] = [];
    
    rawData.forEach((day, dayIdx) => {
      const rate = day.total > 0 ? day.taken / day.total : 0.5;
      const baseline = 30;
      const pulseHeight = 40 * rate;
      const dateLabel = format(parseISO(day.date), 'MMM d');
      
      // ECG-style pulses per day
      data.push({ time: `${day.date}-1`, value: baseline, date: dateLabel, opacity: 0.3 });
      data.push({ time: `${day.date}-2`, value: baseline + pulseHeight, date: dateLabel, opacity: 1 });
      data.push({ time: `${day.date}-3`, value: baseline - (pulseHeight * 0.3), date: dateLabel, opacity: 1 });
      data.push({ time: `${day.date}-4`, value: baseline, date: dateLabel, opacity: 0.3 });
    });
    return data;
  }, [get30DayAdherenceData]);

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
    toast.info('Generating health report...', {
      description: 'Your PDF will download shortly.',
      icon: <FileText size={16} className="text-indigo-500" />
    });

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(91, 61, 245);
        doc.text('Vitality Report', 14, 25);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 34);
        doc.text(`Patient: ${activeProfile?.name || 'User'}`, 14, 40);

        // Health Summary
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('Monthly Overview', 14, 55);
        
        doc.setFontSize(12);
        doc.setTextColor(60);
        doc.text(`Overall Adherence: ${adherencePercent}%`, 14, 65);
        doc.text(`Current Streak: ${user?.streak || 0} days`, 14, 73);
        doc.text(`Health Score: ${healthScore}/100`, 14, 81);

        // AI Clinical Insights
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('AI Clinical Analysis', 14, 98);
        
        doc.setFontSize(11);
        doc.setTextColor(80);
        const insightText = `Based on your ${adherencePercent}% adherence and consistent log patterns, your metabolic health is stabilized. ${healthScore < 80 ? 'We recommend focusing on your afternoon doses to boost your score.' : 'Your consistency is exceptional, suggesting high efficacy of treatment.'}`;
        const splitText = doc.splitTextToSize(insightText, 180);
        doc.text(splitText, 14, 108);

        // 7-Day Adherence Log
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('Adherence Log (Last 7 Days)', 14, 138);

        const tableData = weeklyData.map(day => [
          format(parseISO(day.fullDate), 'MMM d, yyyy'),
          day.taken.toString(),
          day.missed.toString(),
          day.taken + day.missed > 0 ? `${Math.round((day.taken / (day.taken + day.missed)) * 100)}%` : '0%'
        ]);

        (doc as any).autoTable({
          startY: 144,
          head: [['Date', 'Doses Taken', 'Missed', 'Adherence']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [91, 61, 245], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 4 }
        });

        doc.save(`Health_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast.success('Report downloaded successfully!');
      } catch (error) {
        console.error('Failed to generate PDF', error);
        toast.error('Failed to generate PDF report.');
      }
    }, 500);
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
          <DoctorReportWidget />
          
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

          {/* AI Clinical Insight & Heartbeat Card */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Activity className="text-rose-500" size={20} /> Advanced Adherence Analytics
              </h3>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold">
                HEARTBEAT CHART
              </Badge>
            </div>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heartbeatData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 border border-border p-2 rounded-xl shadow-lg">
                              <p className="text-[10px] font-bold text-muted-foreground">{payload[0].payload.date}</p>
                              <p className="text-xs font-black text-rose-500">Pulse: {Math.round(payload[0].value as number)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f43f5e" 
                      strokeWidth={3} 
                      dot={false}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">AI Clinical Pulse Analysis</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">30-Day Velocity</p>
                  </div>
                </div>
                
                <p className="text-sm font-medium leading-relaxed text-foreground/80">
                  Your 30-day "Heartbeat" shows a consistency rating of {adherencePercent}%. {adherencePercent > 80 ? 'Your recovery pulse is strong and rhythmic.' : 'We detected some irregularities in your afternoon doses.'} Maintaining this rhythm is critical for optimal efficacy.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-muted/50 rounded-2xl p-3 border border-border">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Consistency</p>
                    <p className="text-xs font-black text-foreground">{adherencePercent}%</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-3 border border-border">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Velocity</p>
                    <p className="text-xs font-black text-emerald-500">Fast</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-3 border border-border">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Status</p>
                    <p className="text-xs font-black text-blue-500">Stable</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Lab Result Trends (D3.js) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <FileText className="text-indigo-500" size={20} /> AI Lab Analysis
              </h3>
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-none font-bold">12 MONTH TREND</Badge>
            </div>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border transition-colors">
              <div className="space-y-8">
                <LabTrendChart metricName="Glucose" />
                <div className="border-t border-border pt-8">
                  <LabTrendChart metricName="Hemoglobin" />
                </div>
              </div>
            </Card>
          </section>

          {/* Health Trajectory Prediction */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Activity className="text-emerald-500" size={20} /> AI Health Trajectory
              </h3>
              {!isPremium && <Badge className="bg-amber-100 text-amber-700 border-none font-bold uppercase tracking-widest text-[8px]">PREMIUM ONLY</Badge>}
            </div>
            <Card className={cn(
              "border-none bg-card rounded-[32px] premium-card p-6 border border-border relative overflow-hidden transition-all",
              !isPremium && "opacity-50"
            )}>
              {isGeneratingTrajectory ? (
                <div className="h-48 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm font-bold text-muted-foreground animate-pulse">Predicting Health Trajectory...</p>
                </div>
              ) : trajectory ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        trajectory.trajectory === 'improving' ? "bg-emerald-100 text-emerald-600" :
                        trajectory.trajectory === 'declining' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                      )}>
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest opacity-40">Trajectory</h4>
                        <p className={cn(
                          "text-lg font-black capitalize",
                          trajectory.trajectory === 'improving' ? "text-emerald-500" :
                          trajectory.trajectory === 'declining' ? "text-rose-500" : "text-blue-500"
                        )}>{trajectory.trajectory}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-muted-foreground">Confidence</p>
                      <p className="text-lg font-black text-foreground">{Math.round(trajectory.confidence * 100)}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">12-Month Risk Analysis</p>
                    <div className="grid grid-cols-1 gap-3">
                      {trajectory.riskAnalysis?.map((risk: any, i: number) => (
                        <div key={i} className="p-3 rounded-2xl bg-muted/50 border border-border flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            risk.riskLevel === 'high' ? "bg-rose-500" :
                            risk.riskLevel === 'moderate' ? "bg-amber-500" : "bg-emerald-500"
                          )} />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-bold text-foreground">{risk.condition}</p>
                              <Badge className={cn(
                                "text-[8px] font-black uppercase",
                                risk.riskLevel === 'high' ? "bg-rose-500" :
                                risk.riskLevel === 'moderate' ? "bg-amber-500" : "bg-emerald-500"
                              )}>{risk.riskLevel} Risk</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-1">{risk.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isPremium && <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Lock size={24} />
                      </div>
                      <h4 className="text-lg font-bold">Predictive Health Reports</h4>
                      <p className="text-xs text-muted-foreground">Upgrade to Vitality Premium to see your 12-month health AI predictions.</p>
                      <Button className="rounded-xl px-8 h-12">Upgrade Now</Button>
                    </div>
                  </div>}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center bg-muted/20 rounded-3xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-bold text-muted-foreground">Trajectory analysis unavailable.</p>
                  {!isPremium && <p className="text-xs text-primary font-bold mt-2 cursor-pointer">Upgrade to Premium</p>}
                </div>
              )}
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

          {/* Long-Term Trends (30 Days) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground">30-Day Health Correlation</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">Trends</Badge>
            </div>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border transition-colors">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...Array(30).keys()].map(i => ({
                    date: `Day ${i+1}`,
                    calories: 1800 + Math.random() * 500,
                    activity: 5000 + Math.random() * 5000,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                    <XAxis dataKey="date" hide />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="calories" name="Calories" stroke="#84cc16" strokeWidth={3} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="activity" name="Activity (Steps)" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime-500" />
                  <span className="text-xs font-bold text-muted-foreground">Calorie Intake</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground">Steps Taken</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Vitals Trend Chart */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground">Vitals Trend</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">Last 7 Days</Badge>
            </div>
            <Card className="border-none bg-card rounded-[32px] premium-card p-6 border border-border transition-colors">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: 'currentColor', fontWeight: 600}} 
                      className="text-muted-foreground"
                      dy={10}
                    />
                    <YAxis yAxisId="left" hide domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                      cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.1 }}
                      labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="heartRate" 
                      name="Heart Rate"
                      stroke="#EF4444" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: 'var(--card)' }}
                      activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 3, stroke: 'var(--card)' }}
                      connectNulls
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="spo2" 
                      name="SpO2"
                      stroke="#06B6D4" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#06B6D4', strokeWidth: 2, stroke: 'var(--card)' }}
                      activeDot={{ r: 6, fill: '#06B6D4', strokeWidth: 3, stroke: 'var(--card)' }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-muted-foreground">Heart Rate (BPM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="text-xs font-bold text-muted-foreground">SpO2 (%)</span>
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

          {/* Medicine Adherence Breakdown */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Medicine Adherence</h3>
            <div className="space-y-3">
              {individualAdherence.length === 0 ? (
                <Card className="border-none bg-card rounded-[24px] p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-muted-foreground">No data available for the last 7 days.</p>
                </Card>
              ) : (
                individualAdherence.map(med => {
                  const Icon = getMedIcon(med.type);
                  return (
                    <Card key={med.id} className="border-none bg-card rounded-[24px] premium-card p-4 border border-border transition-colors">
                      <div className="flex items-center gap-4 mb-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-primary shadow-inner shrink-0"
                          style={{ backgroundColor: `${med.color}20`, color: med.color }}
                        >
                          {React.cloneElement(Icon, { size: 20 })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground text-sm truncate">{med.name}</h4>
                          <p className="text-xs text-muted-foreground font-medium">{med.dosage}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base" style={{ color: med.percent >= 80 ? '#10B981' : med.percent >= 50 ? '#F59E0B' : '#EF4444' }}>
                            {med.percent}%
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Adherence</p>
                        </div>
                      </div>
                      
                      {/* Breakdown Stats */}
                      <div className="flex justify-between items-center mb-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{med.taken} Taken</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{med.missed} Missed</span>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                        {med.percent > 0 && (
                          <div 
                            className="h-full bg-emerald-500 transition-all rounded-r-full"
                            style={{ width: `${med.percent}%` }}
                          />
                        )}
                        {med.missed > 0 && (
                          <div 
                            className="h-full bg-red-500 transition-all rounded-l-full"
                            style={{ width: `${100 - med.percent}%` }}
                          />
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
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
