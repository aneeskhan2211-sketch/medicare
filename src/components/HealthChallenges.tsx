import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  X, 
  Droplets, 
  Footprints, 
  Moon, 
  Flame, 
  CheckCircle2, 
  Timer,
  Coins,
  ArrowRight,
  Pill,
  Apple,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

const IconMap: { [key: string]: React.ElementType } = {
  Droplets,
  Footprints,
  Moon,
  Flame,
  Trophy,
  Target,
  Pill,
  Apple
};

export const HealthChallenges: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    availableChallenges, 
    userChallenges, 
    activeProfileId, 
    joinChallenge, 
    updateChallengeProgress,
    claimChallengeReward 
  } = useStore();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');

  const profileChallenges = userChallenges.filter(uc => uc.profileId === activeProfileId);
  const activeChallenges = profileChallenges.filter(uc => !uc.isCompleted);
  const completedChallenges = profileChallenges.filter(uc => uc.isCompleted);

  const getChallengeDetails = (challengeId: string) => {
    return availableChallenges.find(c => c.id === challengeId);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-card rounded-[2.5rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold font-display flex items-center gap-2">
                <Trophy className="text-amber-500" /> Health Challenges
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Join challenges, build habits, and earn coins</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <X size={24} />
            </button>
          </div>

          <div className="flex p-1 bg-muted rounded-2xl">
            <button
              onClick={() => setActiveTab('available')}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                activeTab === 'available' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-xl transition-all relative",
                activeTab === 'active' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              My Challenges
              {activeChallenges.length > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full ring-2 ring-card animate-pulse">
                  {activeChallenges.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'available' ? (
              <motion.div 
                key="available"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {availableChallenges.map((challenge) => {
                  const Icon = IconMap[challenge.icon] || Target;
                  const isJoined = profileChallenges.some(pc => pc.challengeId === challenge.id);
                  
                  return (
                    <div 
                      key={challenge.id}
                      className={cn(
                        "group p-5 rounded-3xl border-2 transition-all flex flex-col justify-between",
                        isJoined 
                          ? "border-muted bg-muted/20 opacity-80 cursor-default" 
                          : "border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                      )}
                      onClick={() => !isJoined && joinChallenge(challenge.id)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            challenge.category === 'water' ? "bg-blue-500/10 text-blue-500" :
                            challenge.category === 'steps' ? "bg-emerald-500/10 text-emerald-500" :
                            challenge.category === 'sleep' ? "bg-indigo-500/10 text-indigo-500" :
                            "bg-amber-500/10 text-amber-500"
                          )}>
                            <Icon size={24} />
                          </div>
                          <div className="bg-amber-400/20 text-amber-600 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
                            <Coins size={12} /> {challenge.rewardCoins}
                          </div>
                        </div>
                        <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{challenge.description}</p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Timer size={14} /> {challenge.durationDays} Days Plan
                        </div>
                        {isJoined ? (
                          <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Joined
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Join Now <ArrowRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {activeChallenges.length === 0 && completedChallenges.length === 0 ? (
                  <div className="text-center py-20 opacity-50">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target size={40} />
                    </div>
                    <p className="font-medium">You haven't joined any challenges yet.</p>
                    <button 
                      onClick={() => setActiveTab('available')}
                      className="text-primary font-bold mt-2 hover:underline"
                    >
                      Browse available challenges
                    </button>
                  </div>
                ) : (
                  <>
                    {activeChallenges.map(uc => {
                      const details = getChallengeDetails(uc.challengeId)!;
                      const Icon = IconMap[details.icon] || Target;
                      const progressPercent = (uc.progress / details.targetValue) * 100;

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={uc.id} 
                          className="p-5 rounded-3xl border border-border bg-card relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
                        >
                           <div className="flex gap-4">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                details.category === 'water' ? "bg-blue-500/10 text-blue-500" :
                                details.category === 'steps' ? "bg-emerald-500/10 text-emerald-500" :
                                details.category === 'sleep' ? "bg-indigo-500/10 text-indigo-500" :
                                details.category === 'nutrition' ? "bg-red-500/10 text-red-500" :
                                details.category === 'medication' ? "bg-purple-500/10 text-purple-500" :
                                "bg-amber-500/10 text-amber-500"
                              )}>
                                <Icon size={28} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{details.title}</h4>
                                  <div className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                                    {Math.round(progressPercent)}%
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-4 line-clamp-1">{details.description}</p>
                                
                                <div className="space-y-3">
                                  <div className="relative">
                                    <Progress value={progressPercent} className="h-2" />
                                    {progressPercent >= 25 && <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-1.5 h-1.5 bg-background rounded-full border border-primary" />}
                                    {progressPercent >= 50 && <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-background rounded-full border border-primary" />}
                                    {progressPercent >= 75 && <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-1.5 h-1.5 bg-background rounded-full border border-primary" />}
                                  </div>
                                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-foreground">{uc.progress}</span>
                                      <span className="opacity-50">/ {details.targetValue} {details.unit}</span>
                                    </div>
                                    <Button 
                                      variant="default"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateChallengeProgress(uc.id, 1);
                                      }}
                                      className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90"
                                    >
                                      Log Progress
                                    </Button>
                                  </div>
                                </div>
                              </div>
                           </div>
                        </motion.div>
                      );
                    })}

                    {completedChallenges.length > 0 && (
                      <div className="pt-6">
                        <div className="flex items-center gap-2 mb-4 px-2">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Completed & Rewards</h5>
                        </div>
                        <div className="space-y-3">
                          {completedChallenges.map(uc => {
                            const details = getChallengeDetails(uc.challengeId)!;
                            return (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={uc.id} 
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                  uc.claimedReward 
                                    ? "bg-muted/30 border-border opacity-60" 
                                    : "bg-emerald-500/5 border-emerald-500/20 shadow-sm"
                                )}
                              >
                                <div className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                  uc.claimedReward ? "bg-muted text-muted-foreground" : "bg-emerald-500/20 text-emerald-500"
                                )}>
                                  {uc.claimedReward ? <CheckCircle2 size={24} /> : <Sparkles size={24} className="animate-pulse" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm truncate">{details.title}</h4>
                                  <p className="text-[10px] text-muted-foreground">
                                    {uc.claimedReward ? "Reward successfully added to your balance" : `You've earned ${details.rewardCoins} HC! Claim it now.`}
                                  </p>
                                </div>
                                {uc.claimedReward ? (
                                  <div className="bg-muted text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">
                                    COLLECTED
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm"
                                    onClick={() => claimChallengeReward(uc.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-emerald-500/20"
                                  >
                                    Claim Reward
                                  </Button>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Flame size={24} className="animate-bounce" />
            </div>
            <div>
              <h5 className="font-bold text-sm">Streaks Matter!</h5>
              <p className="text-xs text-muted-foreground">Every day you log progress, your health score increases by 2%.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
