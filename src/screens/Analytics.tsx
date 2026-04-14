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
  Download, Flame, Trophy, Info, Lock, Activity, Target, Zap, ChevronRight, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { toast } from 'sonner';

export const Analytics: React.FC = () => {
  const { reminders, isPremium, user } = useStore();

  // Mock data for graphs
  const weeklyData = [
    { name: 'Mon', taken: 3, missed: 0 },
    { name: 'Tue', taken: 2, missed: 1 },
    { name: 'Wed', taken: 3, missed: 0 },
    { name: 'Thu', taken: 1, missed: 2 },
    { name: 'Fri', taken: 3, missed: 0 },
    { name: 'Sat', taken: 2, missed: 0 },
    { name: 'Sun', taken: 3, missed: 0 },
  ];

  const monthlyAdherence = [
    { date: 'Week 1', value: 85 },
    { date: 'Week 2', value: 92 },
    { date: 'Week 3', value: 78 },
    { date: 'Week 4', value: 95 },
  ];

  const COLORS = ['#5B3DF5', '#EF4444'];
  const pieData = [
    { name: 'Taken', value: 17 },
    { name: 'Missed', value: 3 },
  ];

  const handleExportPDF = () => {
    toast.success('Generating health report...', {
      description: 'Your monthly adherence report is being prepared.',
      icon: <FileText size={16} className="text-indigo-500" />
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Background Watermark */}
      <div className="absolute top-1/2 right-0 w-64 h-64 opacity-[0.03] pointer-events-none -mr-20 filter blur-[2px]">
        <Activity size={256} className="text-slate-900" />
      </div>
      <div className="absolute bottom-20 left-0 w-48 h-48 opacity-[0.03] pointer-events-none -ml-10 filter blur-[2px]">
        <Activity size={192} className="text-slate-900" />
      </div>

      <header className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-400 text-xs font-medium">Your health progress</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleExportPDF}
          className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"
        >
          <Download size={20} />
        </motion.button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-32 relative z-10">
          {/* Adherence Ring & Main Stats */}
          <section className="grid grid-cols-2 gap-4">
            <Card className="border-none bg-primary text-white rounded-[32px] card-shadow p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
              <Activity size={24} className="text-white/60" />
              <div className="text-center">
                <h3 className="text-3xl font-display font-bold">92%</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Adherence</p>
              </div>
            </Card>
            <Card className="border-none bg-white rounded-[32px] card-shadow p-6 flex flex-col items-center justify-center gap-2 border border-slate-50">
              <Flame size={24} className="text-orange-500 fill-orange-500" />
              <div className="text-center">
                <h3 className="text-3xl font-display font-bold text-slate-900">{user?.streak || 0}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Day Streak</p>
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
              <h3 className="font-display font-bold text-lg text-slate-900">Weekly Activity</h3>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold">This Week</Badge>
            </div>
            <Card className="border-none bg-white rounded-[32px] card-shadow p-6 border border-slate-50">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94A3B8', fontWeight: 600}} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#F8FAFC', radius: 8}}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="taken" fill="#5B3DF5" radius={[6, 6, 6, 6]} barSize={12} />
                    <Bar dataKey="missed" fill="#EF4444" radius={[6, 6, 6, 6]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-slate-500">Taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-slate-500">Missed</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Insights */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 px-1">Health Insights</h3>
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 4 }}
                className="p-5 bg-white rounded-[28px] card-shadow border border-slate-50 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">Great Progress!</h4>
                  <p className="text-xs text-slate-500 font-medium">Your morning adherence is 100% this week.</p>
                </div>
                <ChevronRight size={18} className="text-slate-200" />
              </motion.div>
              <motion.div 
                whileHover={{ x: 4 }}
                className="p-5 bg-white rounded-[28px] card-shadow border border-slate-50 flex items-center gap-4 border-l-4 border-l-red-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">Missed Dose Alert</h4>
                  <p className="text-xs text-slate-500 font-medium">You missed your evening dose on Thursday.</p>
                </div>
                <ChevronRight size={18} className="text-slate-200" />
              </motion.div>
            </div>
          </section>

          {/* PDF Export Button */}
          <Button 
            onClick={handleExportPDF}
            className="w-full h-14 rounded-[24px] bg-white text-slate-900 border border-slate-100 card-shadow font-bold flex gap-3 hover:bg-slate-50 transition-all"
          >
            <FileText size={20} className="text-primary" />
            Export Monthly Report (PDF)
          </Button>

          {/* Monthly Trend (Premium) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-slate-900">Monthly Trend</h3>
              {!isPremium && <Badge className="bg-amber-100 text-amber-700 border-none font-bold">PRO</Badge>}
            </div>
            
            <Card className="border-none bg-white rounded-[32px] card-shadow p-6 border border-slate-50 relative overflow-hidden">
              <div className={cn("h-64 w-full", !isPremium && "blur-md opacity-20 pointer-events-none")}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAdherence}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94A3B8', fontWeight: 600}} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#5B3DF5" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#5B3DF5', strokeWidth: 3, stroke: '#fff' }}
                      activeDot={{ r: 8, fill: '#5B3DF5', strokeWidth: 4, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {!isPremium && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                    <Lock size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Premium Insights</h4>
                  <p className="text-xs text-slate-500 mt-2 mb-6 max-w-[220px] font-medium leading-relaxed">
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
            <h3 className="font-display font-bold text-lg text-slate-900 px-1">Dose Breakdown</h3>
            <Card className="border-none bg-white rounded-[32px] card-shadow p-6 border border-slate-50 flex items-center gap-8">
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
                    <span className="text-sm font-bold text-slate-600">Taken</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">17</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-bold text-slate-600">Missed</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">3</span>
                </div>
                <div className="pt-3 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-sm font-bold text-slate-900">20</span>
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
