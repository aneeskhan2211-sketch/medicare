import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WelcomeTutorial: React.FC = () => {
  const [step, setStep] = useState(0);
  const updateSettings = useStore(state => state.updateSettings);

  const steps = [
    {
      title: "Welcome to MediPulse",
      description: "Let's take a quick tour to help you get the most out of your health journey.",
      icon: <span className="text-5xl">👋</span>,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "1. Meet your AI Doctor",
      description: "Get personalized health insights and answers to your medical questions instantly with our intelligent AI Assistant.",
      icon: <span className="text-5xl">🧠</span>,
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      title: "2. Master your Nutrition",
      description: "Log your meals effortlessly and track your daily calorie and macronutrient progress to meet your diet goals.",
      icon: <span className="text-5xl">🥗</span>,
      color: "bg-lime-500/10 text-lime-500"
    },
    {
      title: "3. Monitor Vital Signs",
      description: "Keep a daily log of your vital signs like heart rate and blood pressure to stay ahead of your health.",
      icon: <span className="text-5xl">📊</span>,
      color: "bg-emerald-500/10 text-emerald-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      updateSettings({ hasCompletedOnboarding: true });
    }
  };

  const handleSkip = () => {
    updateSettings({ hasCompletedOnboarding: true });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col"
      >
        <div className="p-8 flex flex-col items-center text-center flex-1 min-h-[300px]">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${steps[step].color}`}>
            {steps[step].icon}
          </div>
          <h2 className="text-2xl font-black mb-3">{steps[step].title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {steps[step].description}
          </p>

          <div className="flex gap-2 mt-auto pt-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === step ? 'bg-primary w-6' : 'bg-primary/20'}`} 
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/50 border-t border-border flex justify-between items-center">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip
          </Button>
          <Button onClick={handleNext} className="rounded-xl px-6 font-bold shadow-md">
            {step < steps.length - 1 ? (
              <>Next <ChevronRight size={16} className="ml-1" /></>
            ) : (
              <>Get Started <Check size={16} className="ml-1" /></>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
