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
    <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-white/20 px-6 py-2 flex justify-between items-center safe-bottom z-50 rounded-t-[24px] card-shadow h-16">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.1, y: -32 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tab.id)}
              className="bg-primary text-white p-4 rounded-[20px] -mt-12 shadow-2xl shadow-primary/40 border-4 border-white transition-transform"
            >
              <Icon size={24} strokeWidth={2.5} />
            </motion.button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all relative py-1 px-2 rounded-xl",
              isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <motion.div
              animate={{ 
                scale: isActive ? 1.1 : 1,
                y: isActive ? -1 : 0
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className={cn(
              "text-[9px] font-bold tracking-tight transition-all",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-sm shadow-primary/50"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
