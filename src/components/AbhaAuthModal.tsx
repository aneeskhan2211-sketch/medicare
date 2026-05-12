import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, IdCard, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, HeartPulse, FileText, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';

export const AbhaAuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { updateSettings } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = () => {
    if (abhaId.length < 8) {
      toast.error('Please enter a valid ABHA Number or Address');
      return;
    }
    setIsLoading(true);
    // Simulate API call to ABDM
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      toast.success('OTP sent to registered mobile number!');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    // Simulate API call to ABDM for verification and fetching profile
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      toast.success('Successfully authenticated with ABDM!');
      
      // Save to store
      updateSettings({ 
        abhaConnected: true, 
        abhaId: abhaId.includes('@') ? abhaId : `${abhaId.slice(0,2)}-${abhaId.slice(2,6)}-${abhaId.slice(6,10)}-${abhaId.slice(10,14)}` 
      });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col md:items-center md:justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-md rounded-[32px] border border-border shadow-2xl overflow-hidden flex flex-col mt-auto md:mt-0"
      >
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <IdCard size={120} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="https://abdm.gov.in/assets/img/abdm_logo.png" alt="ABDM Logo" className="h-8 bg-white/90 p-1 rounded backdrop-blur-md" onError={(e) => e.currentTarget.style.display='none'} />
                <h2 className="text-xl font-bold">ABHA Integration</h2>
              </div>
              <p className="text-sm text-blue-100">Ayushman Bharat Digital Mission</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl flex gap-3 text-blue-800 dark:text-blue-300">
                  <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Link your ABHA profile to securely fetch medical history, lab reports, and vaccinations straight from government-approved health registries.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">ABHA Number or Address</label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="e.g. 14-digit number or name@abdm"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || !abhaId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Smartphone size={18} />}
                  {isLoading ? 'Verifying...' : 'Request OTP'}
                </button>
                
                <div className="text-center">
                  <a href="https://healthid.ndhm.gov.in/register" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Don't have an ABHA Card? Create one here.
                  </a>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                 <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone size={28} />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Enter OTP</h3>
                  <p className="text-sm text-muted-foreground">Sent to mobile registered with ABHA</p>
                </div>

                <div className="flex justify-center gap-2">
                   <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full max-w-[200px] text-center tracking-widest text-2xl font-bold bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                  {isLoading ? 'Authenticating...' : 'Verify & Link'}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 flex flex-col items-center text-center py-4"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-inner">
                   <CheckCircle2 size={40} />
                </div>
                
                <div>
                  <h3 className="font-bold text-2xl text-foreground mb-2">ABHA Linked!</h3>
                  <p className="text-sm text-muted-foreground">Your health records have been successfully synchronized.</p>
                </div>

                <div className="w-full bg-muted border border-border rounded-xl p-4 mt-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 text-left">Fetched Records</h4>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <HeartPulse size={16} className="text-rose-500" /> Prescriptions (12)
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText size={16} className="text-blue-500" /> Lab Reports (5)
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck size={16} className="text-emerald-500" /> Vax Certs (2)
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Activity size={16} className="text-amber-500" /> Care Contexts (4)
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-foreground text-background font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Continue to App
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
