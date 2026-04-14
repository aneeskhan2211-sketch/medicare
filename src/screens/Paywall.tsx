import React from 'react';
import { X, Check, Crown, Zap, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaywallProps {
  onClose: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose }) => {
  const { setTier, user } = useStore();

  const plans = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: 'Free',
      period: '',
      color: 'bg-emerald-500',
      features: ['Max 3 medicines', '1 family profile', 'Basic reminders', 'Ads enabled', 'Limited AI (5/day)']
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '₹49',
      period: '/mo',
      color: 'bg-indigo-500',
      features: ['Unlimited medicines', '3 family profiles', 'Smart reminders + snooze', 'No ads', '50 AI queries/day']
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: '₹99',
      period: '/mo',
      popular: true,
      color: 'bg-purple-600',
      features: ['Unlimited medicines + profiles', 'Unlimited AI', 'Medicine scan (OCR)', 'Advanced analytics', 'Refill alerts', 'PDF report export']
    },
    {
      id: 'family_plus' as const,
      name: 'Family Plus',
      price: '₹199',
      period: '/mo',
      color: 'bg-amber-500',
      features: ['Up to 6 profiles', 'Caregiver dashboard', 'Emergency alerts', 'Doctor sharing', 'Priority AI', 'Cloud backup']
    }
  ];

  const handleUpgrade = (tier: typeof plans[0]['id']) => {
    setTier(tier);
    toast.success(`Welcome to MediMind ${tier.replace('_', ' ').toUpperCase()}!`);
    onClose();
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="relative p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Choose Your Plan</h2>
          <p className="text-slate-500 text-xs font-medium">India Market Optimized Pricing</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>

      {/* Plans List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 pb-32">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all",
                plan.popular ? "border-purple-500 shadow-xl shadow-purple-100" : "border-slate-100",
                user?.tier === plan.id && "ring-2 ring-primary ring-offset-2"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2", plan.color)}>
                        {plan.id === 'basic' ? <ShieldCheck size={20} /> : plan.id === 'pro' ? <Zap size={20} /> : plan.id === 'premium' ? <Crown size={20} /> : <Users size={20} />}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-slate-900">{plan.price}<span className="text-sm font-normal text-slate-400">{plan.period}</span></p>
                      {plan.id === 'pro' && <p className="text-[10px] text-indigo-500 font-bold">Mass Favorite</p>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="mt-1 w-4 h-4 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={user?.tier === plan.id}
                    className={cn(
                      "w-full h-12 rounded-xl font-bold transition-all",
                      plan.popular 
                        ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200" 
                        : "bg-slate-900 hover:bg-slate-800",
                      user?.tier === plan.id && "bg-slate-100 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {user?.tier === plan.id ? 'Current Plan' : plan.id === 'basic' ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
