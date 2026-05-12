import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Trophy, ArrowUpRight, ArrowDownLeft, ShieldCheck, Download, Share2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const MediCoinWallet: React.FC = () => {
  const { user, getAdherenceData } = useStore();
  const adherence = getAdherenceData();
  const avgAdherence = adherence.length > 0 ? (adherence.reduce((acc, d) => acc + (d.total > 0 ? d.taken / d.total : 0), 0) / adherence.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-900 border-none rounded-[40px] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px] -ml-16 -mb-16" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Coins className="text-amber-400" size={20} />
              </div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">MediCoin Wallet</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Live Staking
            </div>
          </div>

          <div>
            <p className="text-4xl font-black mb-1 flex items-center gap-1">
              <span className="text-amber-400">₵</span> {user?.coins || 0}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                <IndianRupee size={10} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Estimated value: ₹{((user?.coins || 0) * 0.5).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button className="h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white gap-2 font-bold text-xs shadow-none">
              <ArrowUpRight size={16} /> Redeem
            </Button>
            <Button className="h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white gap-2 font-bold text-xs shadow-none">
              <ArrowDownLeft size={16} /> Deposit
            </Button>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Proof of Adherence</h3>
        <Card className="p-6 bg-card rounded-[32px] border border-border shadow-sm">
          <div className="flex gap-4 items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
              <ShieldCheck size={28} />
              {avgAdherence >= 90 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <CheckIcon size={12} className="text-white" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-lg leading-tight">Digital Adherence Certificate</h4>
              <p className="text-xs text-muted-foreground mt-1">Verified on-chain via Proof of Adherence protocol.</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">30-Day Adherence</span>
              <span className="font-black text-emerald-500">{Math.round(avgAdherence)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${avgAdherence}%` }}
                className={cn(
                  "h-full transition-all",
                  avgAdherence >= 90 ? "bg-emerald-500" : avgAdherence >= 70 ? "bg-amber-500" : "bg-rose-500"
                )} 
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {avgAdherence >= 90 
                ? "Excellent! You are eligible for a 15% discount on your next pharmacy order." 
                : "Keep it up! Reach 90% adherence to unlock exclusive rewards and lower insurance premiums."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-2xl gap-2 font-bold text-xs h-12 border-slate-200">
              <Download size={14} /> Download
            </Button>
            <Button variant="outline" className="rounded-2xl gap-2 font-bold text-xs h-12 border-slate-200">
              <Share2 size={14} /> Share
            </Button>
          </div>
        </Card>
      </section>

      <section className="space-y-4 pb-10">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Recent Rewards</h3>
        <div className="space-y-3">
          {[
            { title: 'Morning Dose Taken', amount: 5, time: '2h ago', icon: <Coins size={14} /> },
            { title: '7-Day Streak Bonus', amount: 50, time: 'Yesterday', icon: <Trophy size={14} /> },
            { title: 'Vitals Sync Bonus', amount: 10, time: '2 days ago', icon: <Coins size={14} /> },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.time}</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-500">+{item.amount}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const CheckIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
