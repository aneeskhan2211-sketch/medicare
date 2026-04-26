import React from 'react';
import { Home, Pill, Plus, Calendar, User, BarChart3, CheckSquare } from 'lucide-react';
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
    { id: 'add', icon: Plus, label: 'Add', isCenter: true },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-white/20 px-4 py-2 flex justify-between items-end safe-bottom z-50 rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] h-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <div key={tab.id} className="flex flex-col items-center mb-1">
              <motion.button
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all border-4 border-white mb-1",
                  isActive ? "bg-primary text-white shadow-primary/40" : "bg-white text-slate-400 hover:text-primary shadow-slate-200"
                )}
              >
                <Icon size={28} strokeWidth={2.5} />
              </motion.button>
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-all",
                isActive ? "text-primary opacity-100" : "text-slate-400 opacity-60"
              )}>
                {tab.label}
              </span>
            </div>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all relative py-2 px-3 rounded-2xl min-w-[64px]",
              isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
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
