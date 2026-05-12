import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ChevronLeft, Heart, Activity, Bell, Bluetooth, Ruler, Scale, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  'General Info',
  'Biometrics',
  'Medical History',
  'Goals',
  'Permissions'
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const { user, completeOnboarding, setOnboardingData, onboardingData } = useStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: user?.healthProfile?.age || '',
    gender: user?.healthProfile?.gender || '',
    weight: user?.healthProfile?.weight || '',
    height: user?.healthProfile?.height || '',
    conditions: user?.healthProfile?.conditions || [],
    goals: user?.healthProfile?.goals || [],
  });

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      setOnboardingData({
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        conditions: formData.conditions,
        goals: formData.goals,
      });
      await completeOnboarding();
      toast.success('Onboarding complete!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list: string[], item: string, key: 'conditions' | 'goals') => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item)
      : [...list, item];
    setFormData({ ...formData, [key]: newList });
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex flex-col p-6 max-w-md mx-auto">
      {/* Progress Header */}
      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center px-1">
          <button 
            onClick={prevStep}
            className={`p-2 rounded-full hover:bg-slate-50 transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={24} className="text-slate-400" />
          </button>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-100'}`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[2px]">{STEPS[step]}</h2>
          <p className="text-xs text-slate-400 font-bold tracking-tight">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mt-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Tell us about<br/>yourself</h1>
                <p className="text-slate-400 font-medium tracking-tight">This helps us personalize your health journey.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Current Age</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <Input 
                      type="number"
                      placeholder="e.g. 25"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      className="h-16 pl-12 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Vital<br/>Measurements</h1>
                <p className="text-slate-400 font-medium tracking-tight">Accurate data leads to better AI recommendations.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <Input 
                      type="number"
                      placeholder="e.g. 70"
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      className="h-16 pl-12 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <Input 
                      type="number"
                      placeholder="e.g. 175"
                      value={formData.height}
                      onChange={e => setFormData({ ...formData, height: e.target.value })}
                      className="h-16 pl-12 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Medical<br/>Conditions</h1>
                <p className="text-slate-400 font-medium tracking-tight">Do you have any existing health conditions?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[400px] p-1">
                {['Diabetes', 'Hypertension', 'Asthma', 'Heart Condition', 'Thyroid', 'Arthritis', 'Anxiety', 'Allergies', 'Migraine', 'Obesity'].map(c => (
                  <button
                    key={c}
                    onClick={() => toggleItem(formData.conditions, c, 'conditions')}
                    className={`h-24 p-4 rounded-[24px] text-left flex flex-col justify-between transition-all border ${formData.conditions.includes(c) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                  >
                    <CheckCircle2 size={24} className={formData.conditions.includes(c) ? 'text-white' : 'text-slate-100'} />
                    <span className="font-black text-xs uppercase tracking-widest">{c}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Health<br/>Goals</h1>
                <p className="text-slate-400 font-medium tracking-tight">What would you like to achieve with us?</p>
              </div>

              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[400px] p-1">
                {[
                  { id: 'Weight Loss', icon: Scale },
                  { id: 'Gain Muscle', icon: Activity },
                  { id: 'Better Sleep', icon: Heart },
                  { id: 'Medication Adherence', icon: Activity },
                  { id: 'Lower Stress', icon: Heart },
                  { id: 'General Fitness', icon: Activity }
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleItem(formData.goals, g.id, 'goals')}
                    className={`p-6 rounded-[28px] text-left flex items-center gap-4 transition-all border ${formData.goals.includes(g.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'}`}
                  >
                    <div className={`p-3 rounded-2xl ${formData.goals.includes(g.id) ? 'bg-white/20' : 'bg-slate-50'}`}>
                      <g.icon size={24} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest">{g.id}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Final<br/>Permissions</h1>
                <p className="text-slate-400 font-medium tracking-tight">Grant access to provide a seamless experience.</p>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                      <Bell size={24} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-xs uppercase tracking-widest text-slate-900">Notifications</p>
                      <p className="text-xs text-slate-400 font-bold">Medicine remineders</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                      <Bluetooth size={24} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-xs uppercase tracking-widest text-slate-900">Devices</p>
                      <p className="text-xs text-slate-400 font-bold">Smartwatch & Sensors</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-100">
                      <Activity size={24} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-xs uppercase tracking-widest text-slate-900">Apple Health</p>
                      <p className="text-xs text-slate-400 font-bold">Sync vital data</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pb-10">
        <Button 
          onClick={nextStep}
          disabled={loading}
          className="w-full h-18 rounded-[28px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-2xl shadow-indigo-100 group transition-all"
        >
          {loading ? 'Finalizing...' : step === STEPS.length - 1 ? 'Enter MediPulse' : 'Continue'}
          <ArrowRight size={24} className="ml-2 group-hover:translate-x-2 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
