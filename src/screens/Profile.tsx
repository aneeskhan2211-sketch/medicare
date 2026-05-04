import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Settings, Shield, Users, BarChart3, FileText, LogOut, Crown, ChevronRight, Cloud, Flame, Bell, Phone, Plus, UserPlus, Heart, Activity, CreditCard, HelpCircle, Wallet as WalletIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsDialog } from './SettingsDialog';

interface ProfileProps {
  onShowPaywall: () => void;
  onShowBranding: () => void;
  onShowWallet: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onShowPaywall, onShowBranding, onShowWallet }) => {
  const { user, isPremium, syncData, profiles, activeProfileId, setActiveProfile, addCoins } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [showSettings, setShowSettings] = useState(false);

  const handleSync = async () => {
    if (!isPremium) {
      onShowPaywall();
      return;
    }
    await syncData();
  };

  const handleReferral = async () => {
    const referralLink = "https://medimind.app/invite?ref=" + user?.id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MediMind',
          text: 'Get Rs 100 worth of bonus coins in MediMind! Join me.',
          url: referralLink,
        });
        addCoins(100);
        toast.success('Referral shared! You earned 100 coins!');
      } catch (err) {
        console.error('Error sharing:', err);
        toast.error('Failed to share.');
      }
    } else {
      // Fallback
      toast.info('Referral link: ' + referralLink);
      addCoins(100);
      toast.success('Referral shared! You earned 100 coins!');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background transition-colors duration-300">
        {/* Background Watermark */}
        <div className="absolute top-1/2 right-0 w-64 h-64 opacity-[0.03] pointer-events-none -mr-20 filter blur-[2px]">
          <Shield size={256} className="text-foreground" />
        </div>
        <div className="absolute bottom-20 left-0 w-48 h-48 opacity-[0.03] pointer-events-none -ml-10 filter blur-[2px]">
          <Heart size={192} className="text-foreground" />
        </div>

        <header className="p-6 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border flex justify-between items-center transition-colors">
        <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground transition-colors"
        >
          <Settings size={20} />
        </motion.button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-32 relative z-10">
          {/* User Profile Header */}
          <section className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-28 h-28 rounded-[40px] bg-card p-1 shadow-2xl shadow-primary/10 border border-border"
              >
                <div className="w-full h-full rounded-[36px] bg-primary/10 flex items-center justify-center text-primary text-4xl font-display font-bold border-4 border-card overflow-hidden">
                  {user?.name?.[0] || 'U'}
                </div>
              </motion.div>
              {isPremium && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-2xl shadow-lg border-4 border-card"
                >
                  <Crown size={20} fill="currentColor" />
                </motion.div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground text-sm font-medium">{user?.email}</p>
            </div>
            
            <div className="flex gap-4 w-full max-w-xs mx-auto">
              <div className="flex-1 bg-card p-4 rounded-[24px] shadow-sm border border-border flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Flame size={20} className="text-orange-500 fill-orange-500" />
                  <span className="text-xl font-bold text-foreground">{user?.streak || 0}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Day Streak</span>
              </div>
              <div className="flex-1 bg-card p-4 rounded-[24px] shadow-sm border border-border flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">C</div>
                  <span className="text-xl font-bold text-foreground">{user?.coins || 0}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Coins</span>
              </div>
            </div>
          </section>

          {/* Premium Card */}
          <motion.section 
            whileHover={{ scale: 1.02 }}
            onClick={onShowPaywall}
            className={cn(
              "rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden cursor-pointer",
              user?.tier === 'basic' ? "bg-gradient-to-br from-primary to-primary/80" : 
              user?.tier === 'pro' ? "bg-gradient-to-br from-indigo-500 to-indigo-700" :
              user?.tier === 'premium' ? "bg-gradient-to-br from-purple-600 to-purple-800" :
              "bg-gradient-to-br from-amber-500 to-amber-700"
            )}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            
            <div className="relative flex justify-between items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown size={20} className={user?.tier !== 'basic' ? "text-white" : "text-amber-400"} fill="currentColor" />
                  <span className="text-sm font-bold tracking-widest uppercase">
                    {user?.tier === 'basic' ? "MediMind Pro" : `MediMind ${user?.tier?.replace('_', ' ').toUpperCase() || 'PRO'}`}
                  </span>
                </div>
                <h3 className="text-xl font-bold">
                  {user?.tier === 'basic' ? "Unlock Family Access" : "You're a Pro Member!"}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {user?.tier === 'basic' ? "Manage health for your entire family." : "Enjoy unlimited profiles and AI features."}
                </p>
              </div>
              <ChevronRight size={24} className="text-white/50" />
            </div>
          </motion.section>

          {/* Family Profiles */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-lg text-foreground">Family Profiles</h3>
              <button 
                onClick={() => isPremium ? toast.info('Add profile feature coming soon!') : onShowPaywall()}
                className="text-primary text-sm font-bold flex items-center gap-1"
              >
                <Plus size={16} /> Add New
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
              {profiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveProfile(profile.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 min-w-[100px] p-4 rounded-[28px] transition-all cursor-pointer border-2",
                    activeProfileId === profile.id 
                      ? "bg-card border-primary shadow-md" 
                      : "bg-card border-transparent shadow-sm opacity-60"
                  )}
                >
                  <Avatar className="w-14 h-14 border-4 border-card shadow-inner">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="font-bold text-white text-xl" style={{ backgroundColor: profile.color }}>
                      {profile.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-foreground truncate w-full text-center">
                    {profile.name.split(' ')[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Emergency Section */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Emergency</h3>
            <Card className="border-none bg-destructive/10 rounded-[20px] overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-destructive shadow-sm">
                  <Phone size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{activeProfile.emergencyContact?.name || 'Emergency Contact'}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{activeProfile.emergencyContact?.phone || 'Not set'}</p>
                </div>
                <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-2xl px-6 h-12 font-bold shadow-lg shadow-destructive/20">
                  Call
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Settings Menu */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Settings</h3>
            <div className="bg-card rounded-[20px] shadow-sm overflow-hidden border border-border">
              <MenuButton icon={Settings} label="General Settings" onClick={() => setShowSettings(true)} />
              <MenuButton icon={WalletIcon} label="My Wallet" onClick={onShowWallet} />
              <MenuButton icon={UserPlus} label="Refer friends & get Rs 100" onClick={handleReferral} />
              <MenuButton icon={Bell} label="Notifications" onClick={() => setShowSettings(true)} />
              <MenuButton icon={Shield} label="Privacy & Security" onClick={() => setShowSettings(true)} />
              <MenuButton icon={Cloud} label="Data & Sync" onClick={handleSync} />
              <MenuButton icon={CreditCard} label="Subscription" badge={!isPremium ? "FREE" : "PRO"} onClick={onShowPaywall} />
              <MenuButton icon={HelpCircle} label="Help & Support" onClick={() => toast.info('Help & Support coming soon!')} />
            </div>
          </section>

          <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />

          <Button 
            variant="ghost" 
            onClick={() => toast.info('Sign out coming soon!')}
            className="w-full h-16 rounded-[24px] text-destructive hover:text-destructive/80 hover:bg-destructive/10 font-bold text-lg"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">MediMind v2.0.4</p>
            <p className="text-[10px] font-medium text-muted-foreground/30">Made with ❤️ for your health</p>
          </div>
        </div>
      </ScrollArea>
    </div>
);
};

const MenuButton = ({ icon: Icon, label, badge, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-all group border-b border-border last:border-none"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-[18px] bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
        <Icon size={22} />
      </div>
      <span className="font-bold text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {badge && (
        <Badge className={cn(
          "border-none font-bold text-[10px] px-2 py-0.5 rounded-lg",
          badge === "PRO" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" : "bg-primary/10 text-primary"
        )}>
          {badge}
        </Badge>
      )}
      <ChevronRight size={20} className="text-muted-foreground/30 group-hover:text-primary transition-all" />
    </div>
  </button>
);
