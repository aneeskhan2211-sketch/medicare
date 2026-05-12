import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Users, Bell, Heart, Plus, ChevronRight, Flame, Trophy, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { toast } from 'sonner';

export const FamilyCircle: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { familyMembers, nudgeFamilyMember, highFiveFamilyMember } = useStore();

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold">Family "Sync" Circle</h2>
          <p className="text-muted-foreground text-sm">Caregiver dashboard for your loved ones</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ChevronRight className="rotate-90" />
        </Button>
      </header>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-6 pb-32">
          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <Button className="rounded-2xl bg-primary shadow-lg shadow-primary/20 h-14 px-6 shrink-0 flex gap-2 font-bold">
              <Plus size={20} /> Add Member
            </Button>
            <Button variant="outline" className="rounded-2xl border-border h-14 px-6 shrink-0 flex gap-2 font-bold text-muted-foreground">
              <Users size={20} /> Manage Group
            </Button>
          </div>

          {/* Family Grid */}
          <div className="grid gap-4">
            {familyMembers.map((member) => (
              <Card key={member.id} className="border-none bg-card rounded-[32px] overflow-hidden shadow-sm border border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border-4 border-background shadow-md">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold text-foreground leading-tight">{member.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{member.relation}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-orange-500 mb-1">
                        <Flame size={16} className="fill-orange-500" />
                        <span className="text-sm font-black">{member.streak}d</span>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">HEALTHY</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Adherence</p>
                        <p className="text-sm font-black text-foreground">{member.medsToday.taken}/{member.medsToday.total} doses taken</p>
                      </div>
                      <Progress value={(member.medsToday.taken / member.medsToday.total) * 100} className="h-2 bg-muted rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button 
                            variant="secondary" 
                            className="rounded-2xl h-12 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold text-xs gap-2"
                            onClick={() => nudgeFamilyMember(member.id)}
                            disabled={member.medsToday.taken === member.medsToday.total}
                        >
                            <Bell size={14} /> Send Nudge
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="rounded-2xl h-12 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 font-bold text-xs gap-2"
                            onClick={() => {
                              toast.info('Remote Monitoring', {
                                description: `Accessing shared medical vault and live vitals for ${member.name}...`,
                                icon: <Heart size={16} />
                              });
                            }}
                        >
                            <Heart size={14} /> Monitor
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Collaborative Stats */}
          <Card className="border-none bg-gradient-to-br from-primary to-indigo-600 text-white rounded-[32px] overflow-hidden shadow-xl shadow-primary/20">
            <CardContent className="p-8 space-y-4">
              <Badge className="bg-white/20 text-white border-none uppercase text-[8px] px-2 py-0.5">Family Power</Badge>
              <h3 className="text-2xl font-display font-bold">Collectively Healthier</h3>
              <p className="text-primary-100 text-sm leading-relaxed max-w-[200px]">
                Your family has maintained a combined 92% adherence this week.
              </p>
              <div className="flex -space-x-3 pt-2">
                {familyMembers.map((m, i) => (
                  <Avatar key={m.id} className="border-2 border-primary w-10 h-10">
                    <AvatarFallback className="bg-primary-foreground/20 text-white text-xs font-bold">{m.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold">
                  +3
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[110]">
        <Button className="w-full h-14 rounded-2xl bg-background border-2 border-primary text-primary font-black text-sm uppercase tracking-widest shadow-lg flex gap-2">
          <MessageCircle size={20} /> Family Chat Room
        </Button>
      </div>
    </div>
  );
};
