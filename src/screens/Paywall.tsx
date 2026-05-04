import React from 'react';
import { X, Check, Crown, Zap, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-6 bg-card border-b border-border flex justify-between items-center shrink-0 transition-colors">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Choose Your Plan</h2>
          <p className="text-muted-foreground text-xs font-medium">India Market Optimized Pricing</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Plans List */}
      <div className="flex-1 overflow-y-scroll w-full overscroll-contain touch-pan-y min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-6 space-y-6 pb-40 max-w-full">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all bg-card",
                plan.popular ? "border-purple-500 shadow-xl shadow-purple-500/10" : "border-border",
                user?.tier === plan.id && "ring-2 ring-primary ring-offset-2"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg", plan.color)}>
                        {plan.id === 'basic' ? <ShieldCheck size={24} /> : plan.id === 'pro' ? <Zap size={24} /> : plan.id === 'premium' ? <Crown size={24} /> : <Users size={24} />}
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-display font-bold text-foreground">{plan.price}</span>
                        <span className="text-xs font-medium text-muted-foreground">{plan.period ? plan.period : 'Forever Free'}</span>
                      </div>
                      {plan.id === 'pro' && <p className="mt-1 text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">Mass Favorite</p>}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={user?.tier === plan.id}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold transition-all text-base",
                      plan.popular 
                        ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 text-white" 
                        : "bg-primary hover:bg-primary/90 text-white",
                      user?.tier === plan.id && "bg-muted text-muted-foreground hover:bg-muted opacity-80"
                    )}
                  >
                    {user?.tier === plan.id ? 'Current Plan' : plan.id === 'basic' ? 'Get Started' : 'Unlock Now'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
