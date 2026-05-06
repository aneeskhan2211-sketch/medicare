import React from 'react';
import { Home, Pill, Calendar, User, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'meds', icon: Pill, label: 'Meds' },
    { id: 'calendar', icon: Calendar, label: 'Calendar View' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-white/20 px-4 py-2 flex justify-around items-center safe-bottom z-50 rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] h-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all relative py-2 px-3 rounded-2xl min-w-[64px]",
              isActive ? "text-primary bg-primary/5 animate-pulse-green" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <motion.div
              animate={{ 
                scale: isActive ? 1.2 : 1,
                y: isActive ? -2 : 0
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className={cn(
              "text-[10px] font-bold tracking-tight transition-all",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary/50"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
