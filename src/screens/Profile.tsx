import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Settings, Shield, Users, BarChart3, FileText, LogOut, Crown, ChevronRight, Cloud, Flame, Bell, Phone, Plus, UserPlus, Heart, Activity, CreditCard, HelpCircle, Wallet as WalletIcon, Stethoscope, Syringe, Pill, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsDialog } from './SettingsDialog';
import { AddProfileDialog } from './AddProfileDialog';
import { ProfileEditorDialog } from './ProfileEditorDialog';
import { MedicalBackground } from '../components/MedicalBackground';
import { MediPass } from '../components/MediPass';

interface ProfileProps {
  onShowPaywall: () => void;
  onShowBranding: () => void;
  onShowWallet: () => void;
  onShowAbout: () => void;
  onShowTeleConsultation: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onShowPaywall, onShowBranding, onShowWallet, onShowAbout, onShowTeleConsultation }) => {
  const { user, isPremium, syncData, profiles, activeProfileId, setActiveProfile, addCoins, settings, updateSettings, medicines, logout } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [showSettings, setShowSettings] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMediPass, setShowMediPass] = useState(false);

  const handleLogout = () => {
    toast.promise(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logout();
    }, {
      loading: 'Signing out...',
      success: 'Logged out successfully',
      error: 'Failed to sign out'
    });
  };

  const handleSync = async () => {
    if (!isPremium) {
      onShowPaywall();
      return;
    }
    await syncData();
  };

  const handleReferral = async () => {
    const referralLink = "https://MediPulse.app/invite?ref=" + user?.id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MediPulse',
          text: 'Get Rs 100 worth of bonus coins in MediPulse! Join me.',
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
    <div className="h-full flex flex-col transition-colors duration-300 relative overflow-hidden">
      <MedicalBackground />

      <header className="p-6 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border flex justify-between items-center transition-colors">
        <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
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
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </header>

      <ScrollArea className="flex-1 relative overflow-hidden">
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
              <div className="flex-1 bg-card p-2 rounded-xl premium-card border border-border flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1.5">
                  <Flame size={20} className="text-orange-500 fill-orange-500" />
                  <span className="text-xl font-bold text-foreground">{user?.streak || 0}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Day Streak</span>
              </div>
              <div className="flex-1 bg-card p-2 rounded-xl premium-card border border-border flex flex-col items-center gap-0.5">
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
              "rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden cursor-pointer animate-pulse-green",
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
                    {user?.tier === 'basic' ? "MediPulse Pro" : `MediPulse ${user?.tier?.replace('_', ' ').toUpperCase() || 'PRO'}`}
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
                onClick={() => isPremium ? setShowAddProfile(true) : onShowPaywall()}
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

          {/* Personal Medical Info */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Medical Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-card rounded-xl shadow-sm p-3">
                <div className="text-muted-foreground text-xs font-bold uppercase mb-1">Blood Type</div>
                <div className="font-bold text-xl">{activeProfile.bloodType || 'Not set'}</div>
              </Card>
              <Card className="border-none bg-card rounded-xl shadow-sm p-3">
                <div className="text-muted-foreground text-xs font-bold uppercase mb-1">Allergies</div>
                <div className="font-bold text-sm truncate">{activeProfile.allergies?.join(', ') || 'None'}</div>
              </Card>
            </div>
            <Card className="border-none bg-card rounded-xl shadow-sm p-3">
              <div className="text-muted-foreground text-xs font-bold uppercase mb-1">Medical Conditions</div>
              <div className="font-bold text-sm">{activeProfile.conditions?.join(', ') || 'None'}</div>
            </Card>
            <Button 
              variant="outline"
              onClick={() => setShowEditProfile(true)}
              className="w-full h-12 rounded-[20px] font-bold border-2"
            >
              Edit Medical Profile
            </Button>
          </section>

          {/* Emergency Section */}

          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Emergency</h3>
            <div className="grid gap-4">
              <Card 
                onClick={() => setShowMediPass(true)}
                className="border-none bg-rose-500/10 rounded-2xl premium-card overflow-hidden cursor-pointer group hover:bg-rose-500/20 transition-all border border-rose-500/20"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 10 }}
                    className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform"
                  >
                    <Shield size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">Emergency Medi-Pass</h4>
                    <p className="text-xs text-muted-foreground font-medium">Digital identity for first responders</p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-rose-500 transition-colors" />
                </CardContent>
              </Card>

              <Card className="border-none bg-destructive/10 rounded-xl premium-card overflow-hidden">
                <CardContent className="p-3 flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-destructive shadow-sm"
                  >
                    <Phone size={20} />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-sm">{activeProfile.emergencyContact?.name || 'Emergency Contact'}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">{activeProfile.emergencyContact?.phone || 'Not set'}</p>
                  </div>
                  <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl px-4 h-10 font-bold shadow-lg shadow-destructive/20 animate-pulse-green">
                    Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Settings Menu */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground px-1">Settings</h3>
            <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
              <MenuButton icon={Settings} label="General Settings" onClick={() => setShowSettings(true)} />
              <MenuButton icon={Stethoscope} label="Tele-Consultation" onClick={onShowTeleConsultation} />
              <MenuButton icon={WalletIcon} label="My Wallet" onClick={onShowWallet} />
              <MenuButton icon={UserPlus} label="Refer friends & get Rs 100" onClick={handleReferral} />
              <MenuButton icon={Bell} label="Notifications" onClick={() => setShowSettings(true)} />
              <MenuButton icon={Shield} label="Privacy & Security" onClick={() => setShowSettings(true)} />
              <MenuButton icon={Cloud} label="Data & Sync" onClick={handleSync} />
              <MenuButton icon={CreditCard} label="Subscription" badge={!isPremium ? "FREE" : "PRO"} onClick={onShowPaywall} />
              <MenuButton icon={HelpCircle} label="Help & Support" onClick={() => toast.info('Help & Support coming soon!')} />
              <MenuButton icon={HelpCircle} label="About MediPulse" onClick={onShowAbout} />
            </div>
          </section>

          <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
          <AddProfileDialog open={showAddProfile} onClose={() => setShowAddProfile(false)} />
          <ProfileEditorDialog open={showEditProfile} onClose={() => setShowEditProfile(false)} profile={activeProfile} />

          <AnimatePresence>
            {showMediPass && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-slate-900"
              >
                <MediPass 
                  profile={activeProfile} 
                  medicines={medicines}
                  onClose={() => setShowMediPass(false)} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full h-16 rounded-[24px] text-destructive hover:text-destructive/80 hover:bg-destructive/10 font-bold text-lg"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">MediPulse v2.0.4</p>
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
    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-all group border-b border-border last:border-none"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
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
