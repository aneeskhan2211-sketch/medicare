import React from 'react';
import { useStore } from '../store/useStore';
import { User, Settings, Shield, Users, BarChart3, FileText, LogOut, Crown, ChevronRight, Cloud, Flame, Bell, Phone, Plus, UserPlus, Heart, Activity, CreditCard, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileProps {
  onShowPaywall: () => void;
  onShowBranding: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onShowPaywall, onShowBranding }) => {
  const { user, isPremium, syncData, profiles, activeProfileId, setActiveProfile } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [darkMode, setDarkMode] = React.useState(false);

  const handleSync = async () => {
    if (!isPremium) {
      onShowPaywall();
      return;
    }
    await syncData();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`${!darkMode ? 'Dark' : 'Light'} mode enabled`, {
      description: 'Theme settings updated successfully.'
    });
  };

  return (
    <div className="h-full flex flex-col">
        {/* Background Watermark */}
        <div className="absolute top-1/2 right-0 w-64 h-64 opacity-[0.03] pointer-events-none -mr-20 filter blur-[2px]">
          <Shield size={256} className="text-slate-900" />
        </div>
        <div className="absolute bottom-20 left-0 w-48 h-48 opacity-[0.03] pointer-events-none -ml-10 filter blur-[2px]">
          <Heart size={192} className="text-slate-900" />
        </div>

        <header className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-slate-900">Profile</h1>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
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
                className="w-28 h-28 rounded-[40px] bg-white p-1 shadow-2xl shadow-indigo-200/50"
              >
                <div className="w-full h-full rounded-[36px] bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-display font-bold border-4 border-white overflow-hidden">
                  {user?.name?.[0] || 'U'}
                </div>
              </motion.div>
              {isPremium && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-2xl shadow-lg border-4 border-white"
                >
                  <Crown size={20} fill="currentColor" />
                </motion.div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-400 text-sm font-medium">{user?.email}</p>
            </div>
            
            <div className="flex gap-4 w-full max-w-xs mx-auto">
              <div className="flex-1 bg-white p-4 rounded-[24px] card-shadow border border-slate-50 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Flame size={20} className="text-orange-500 fill-orange-500" />
                  <span className="text-xl font-bold text-slate-900">{user?.streak || 0}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Streak</span>
              </div>
              <div className="flex-1 bg-white p-4 rounded-[24px] card-shadow border border-slate-50 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">C</div>
                  <span className="text-xl font-bold text-slate-900">{user?.coins || 0}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coins</span>
              </div>
            </div>
          </section>

          {/* Premium Card */}
          <motion.section 
            whileHover={{ scale: 1.02 }}
            onClick={onShowPaywall}
            className={cn(
              "rounded-[32px] p-6 text-white card-shadow relative overflow-hidden cursor-pointer",
              user?.tier === 'basic' ? "bg-gradient-to-br from-indigo-600 to-indigo-800" : 
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
              <h3 className="font-display font-bold text-lg text-slate-900">Family Profiles</h3>
              <button 
                onClick={() => isPremium ? toast.info('Add profile coming soon!') : onShowPaywall()}
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
                      ? "bg-white border-primary card-shadow" 
                      : "bg-white border-transparent card-shadow opacity-60"
                  )}
                >
                  <Avatar className="w-14 h-14 border-4 border-slate-50 shadow-inner">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="font-bold text-white text-xl" style={{ backgroundColor: profile.color }}>
                      {profile.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-slate-700 truncate w-full text-center">
                    {profile.name.split(' ')[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Emergency Section */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 px-1">Emergency</h3>
            <Card className="border-none bg-red-50 rounded-[20px] overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                  <Phone size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{activeProfile.emergencyContact?.name || 'Emergency Contact'}</h4>
                  <p className="text-xs text-slate-500 font-medium">{activeProfile.emergencyContact?.phone || 'Not set'}</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-red-200">
                  Call
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Settings Menu */}
          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 px-1">Settings</h3>
            <div className="bg-white rounded-[20px] card-shadow overflow-hidden border border-slate-50">
              <div className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all group border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Activity size={22} />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Dark Mode</span>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    darkMode ? "bg-primary" : "bg-slate-200"
                  )}
                >
                  <motion.div 
                    animate={{ x: darkMode ? 26 : 2 }}
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5" 
                  />
                </button>
              </div>
              <MenuButton icon={Bell} label="Notifications" onClick={() => toast.info('Notifications coming soon!')} />
              <MenuButton icon={Shield} label="Privacy & Security" onClick={() => toast.info('Privacy settings coming soon!')} />
              <MenuButton icon={Cloud} label="Data & Sync" onClick={handleSync} />
              <MenuButton icon={CreditCard} label="Subscription" badge={!isPremium ? "FREE" : "PRO"} onClick={onShowPaywall} />
              <MenuButton icon={Heart} label="Health Connect" badge="BETA" onClick={() => toast.info('Health Connect coming soon!')} />
              <MenuButton icon={HelpCircle} label="Help & Support" onClick={() => toast.info('Help & Support coming soon!')} />
            </div>
          </section>

          <Button 
            variant="ghost" 
            onClick={() => toast.info('Sign out coming soon!')}
            className="w-full h-16 rounded-[24px] text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-lg"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">MediMind v2.0.4</p>
            <p className="text-[10px] font-medium text-slate-300">Made with ❤️ for your health</p>
          </div>
        </div>
      </ScrollArea>
    </div>
);
};

const MenuButton = ({ icon: Icon, label, badge, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all group border-b border-slate-50 last:border-none"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
        <Icon size={22} />
      </div>
      <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {badge && (
        <Badge className={cn(
          "border-none font-bold text-[10px] px-2 py-0.5 rounded-lg",
          badge === "PRO" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
        )}>
          {badge}
        </Badge>
      )}
      <ChevronRight size={20} className="text-slate-200 group-hover:text-slate-400 transition-all" />
    </div>
  </button>
);
