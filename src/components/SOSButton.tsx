import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Phone, X, MapPin, User, Activity, Flame } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const SOSButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { profiles, activeProfileId } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActivating && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isActivating && countdown === 0) {
      handleConfirmSOS();
    }
    return () => clearTimeout(timer);
  }, [isActivating, countdown]);

  const handleConfirmSOS = () => {
    setIsActivating(false);
    setIsOpen(false);
    setCountdown(3);
    
    // Simulate emergency protocol
    toast.error('Emergency Protocol Activated!', {
      description: `Notifying ${activeProfile.emergencyContact?.name || 'Emergency Contact'} and local services.`,
      duration: 10000,
    });

    // In a real app, this would use the Twilio API or similar to send SMS/Call with GPS
  };

  const handleCancel = () => {
    setIsActivating(false);
    setCountdown(3);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed left-6 bottom-32 z-50 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 border-4 border-white dark:border-slate-900 group"
      >
        <AlertCircle size={28} className="group-hover:animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl p-8 space-y-8 relative"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-500/20">
                  <Phone size={40} className={isActivating ? "animate-bounce" : ""} />
                </div>
                <h2 className="text-2xl font-display font-bold">Emergency SOS</h2>
                <p className="text-muted-foreground text-sm">
                  This will notify your emergency contact and share your location/medical data.
                </p>
              </div>

              {!isActivating ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-3xl space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-primary" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Emergency Contact</p>
                        <p className="text-sm font-bold">{activeProfile.emergencyContact?.name || 'Not Set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-primary" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Location</p>
                        <p className="text-sm font-bold">Mumbai, Maharashtra</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => setIsActivating(true)}
                      className="bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-red-500/20"
                    >
                      Trigger SOS
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsOpen(false)}
                      className="h-12 rounded-2xl font-bold text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 py-10">
                  <div className="relative flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-8 border-red-500/20 flex items-center justify-center">
                      <span className="text-6xl font-display font-bold text-red-600">{countdown}</span>
                    </div>
                    <svg className="absolute w-32 h-32 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-red-600 transition-all duration-1000 ease-linear"
                        strokeDasharray={351.8}
                        strokeDashoffset={351.8 - (351.8 * (3 - countdown)) / 3}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="w-full h-14 rounded-2xl border-red-200 text-red-600 font-bold text-lg hover:bg-red-50"
                  >
                    Cancel Activation
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
