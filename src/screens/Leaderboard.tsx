import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Flame, ChevronRight, Share2, Search, TrendingUp, History, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Leaderboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { leaderboard, user } = useStore();

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold">Hall of Fame</h2>
          <p className="text-muted-foreground text-sm">Global Rankings & Achievements</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ChevronRight className="rotate-90" />
        </Button>
      </header>

      <Tabs defaultValue="global" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-2xl h-12 mb-6">
          <TabsTrigger value="global" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Global</TabsTrigger>
          <TabsTrigger value="trophies" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="flex-1 flex flex-col mt-0">
          <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Trophy size={100} className="text-primary" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-background">
                <span className="text-xl font-black">#45</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Your Current Rank</p>
                <h3 className="text-2xl font-black text-foreground">{user?.coins || 0} Points</h3>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Top Performers</h4>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground"><Search size={14} /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground"><Share2 size={14} /></Button>
            </div>
          </div>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 pb-24">
              {leaderboard.map((entry, idx) => (
                <Card key={entry.id} className={cn(
                  "border-none rounded-2xl overflow-hidden shadow-sm transition-all border border-border/50",
                  entry.isCurrentUser ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20 scale-[1.02]" : "bg-card hover:bg-muted/50"
                )}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                      entry.rank === 1 ? "bg-amber-100 text-amber-600" :
                      entry.rank === 2 ? "bg-slate-100 text-slate-500" :
                      entry.rank === 3 ? "bg-orange-100 text-orange-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {entry.rank === 1 ? <Trophy size={18} /> : 
                       entry.rank === 2 ? <Medal size={18} /> : 
                       entry.rank === 3 ? <Medal size={18} /> : entry.rank}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback className="bg-muted font-bold">{entry.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm flex items-center gap-2">
                        {entry.name}
                        {entry.isCurrentUser && <Badge className="bg-primary text-white text-[8px] px-1 h-3.5">YOU</Badge>}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <TrendingUp size={10} className="text-emerald-500" /> +{Math.floor(Math.random() * 500)} this week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-foreground leading-none">{entry.score.toLocaleString()}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Score</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trophies" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="grid grid-cols-2 gap-4 pb-24">
              {[
                { id: '1', title: '7-Day Warrior', desc: 'Maintain a 7-day streak', icon: <Flame size={24} />, color: 'bg-orange-500', unlocked: true },
                { id: '2', title: 'Med Specialist', desc: 'Log 5 different medicines', icon: <Star size={24} />, color: 'bg-indigo-500', unlocked: true },
                { id: '3', title: 'Profile Pro', desc: 'Complete all profiles', icon: <Users size={24} />, color: 'bg-emerald-500', unlocked: true },
                { id: '4', title: 'Health Guru', desc: 'Take 50 doses total', icon: <Trophy size={24} />, color: 'bg-amber-500', unlocked: false },
                { id: '5', title: 'Early Bird', desc: 'Take first dose before 8 AM', icon: <Star size={24} />, color: 'bg-blue-500', unlocked: false },
                { id: '6', title: 'Streak Master', desc: 'Maintain 30-day streak', icon: <Flame size={24} />, color: 'bg-rose-500', unlocked: false },
              ].map((badge) => (
                <Card key={badge.id} className={cn(
                  "border-none rounded-[32px] overflow-hidden aspect-square flex flex-col items-center justify-center p-4 text-center gap-3 relative",
                  badge.unlocked ? "bg-muted/50" : "bg-muted/20 opacity-40 grayscale"
                )}>
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg",
                    badge.color
                  )}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{badge.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-1">{badge.desc}</p>
                  </div>
                  {!badge.unlocked && (
                    <div className="absolute top-2 right-2">
                        <Star size={12} className="text-muted-foreground" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[110]">
        <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30 flex gap-2">
          <History size={20} /> View Competition History
        </Button>
      </div>
    </div>
  );
};

const cn = (...args: any[]) => args.filter(Boolean).join(' ');
