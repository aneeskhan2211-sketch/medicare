import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Footprints, Play, Pause, Square, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export const StepTrackerWidget: React.FC = () => {
  const { profiles, activeProfileId, updateProfile } = useStore();
  const profile = profiles.find(p => p.id === activeProfileId);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const threshold = 12.0; 
  const cooldown = 300; 

  useEffect(() => {
    let handleMotion: (event: DeviceMotionEvent) => void;

    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);

      handleMotion = (event: DeviceMotionEvent) => {
        if (isPaused) return;
        const accel = event.accelerationIncludingGravity;
        if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

        const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
        const now = Date.now();

        if (magnitude > threshold && now - lastUpdateRef.current > cooldown) {
          setSteps(prev => prev + 1);
          lastUpdateRef.current = now;
        }
      };

      if (window.DeviceMotionEvent) {
        const DMEvent = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
        if (typeof DMEvent.requestPermission === 'function') {
          DMEvent.requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener('devicemotion', handleMotion);
        }
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (handleMotion) window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isTracking]);

  const toggleTracking = () => {
    if (!isTracking) {
      setIsTracking(true);
      setIsPaused(false);
      toast.success("Walk Tracking Started", { 
        description: "MediPulse is now analyzing your movement." 
      });
    } else {
      handleStop();
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast.info("Tracking Paused");
    } else {
      toast.success("Tracking Resumed");
    }
  };

  const handleStop = () => {
    setIsTracking(false);
    setIsPaused(false);
    if (profile) {
      const currentSteps = profile.lifestyle?.steps || 0;
      updateProfile(profile.id, {
        lifestyle: {
          ...profile.lifestyle,
          steps: currentSteps + steps
        }
      });
    }
    toast.success("Walk Session Saved", { 
      description: `${steps} steps added to your daily total.`
    });
  };

  const handleReset = () => {
    setSteps(0);
    setSessionTime(0);
    setIsTracking(false);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const distance = (steps * 0.0007).toFixed(2); 

  return (
    <Card className="overflow-hidden border-none bg-indigo-600 dark:bg-indigo-900 text-white shadow-md rounded-3xl transition-all hover:bg-indigo-500">
      <CardContent className="p-3.5 relative">
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Footprints size={18} className="text-white" />
            </div>
            <div className="min-w-[80px]">
              <div className="flex items-baseline gap-1">
                <motion.span 
                  key={steps}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-black tracking-tight"
                >
                  {steps.toLocaleString()}
                </motion.span>
                <span className="text-[10px] font-bold text-white/40 uppercase">Steps</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  isTracking && !isPaused ? "bg-emerald-400 animate-pulse" : 
                  isPaused ? "bg-amber-400" : "bg-white/30"
                )} />
                <span className="text-[9px] font-bold text-white/60">
                  {isTracking ? (isPaused ? 'Paused' : `${Math.min(Math.round((steps / 10000) * 100), 100)}%`) : `Goal: 10k`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-around px-1 border-x border-white/10 mx-1">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-bold text-white/40 uppercase">Dist</span>
              <span className="text-[10px] font-bold tabular-nums">{distance}k</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-bold text-white/40 uppercase">Time</span>
              <span className="text-[10px] font-bold tabular-nums">{formatTime(sessionTime).split(':')[0]}m</span>
            </div>
          </div>
          
          <div className="flex gap-1.5 shrink-0">
            {isTracking ? (
              <div className="flex gap-1.5">
                <button 
                  onClick={handlePause}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-95 shadow-md"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play size={14} fill="currentColor" className="ml-0.5" /> : <Pause size={14} fill="currentColor" />}
                </button>
                <button 
                  onClick={handleStop}
                  className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center transition-all active:scale-95 shadow-md shadow-rose-900/20"
                  title="Stop and Save"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                {steps > 0 && (
                  <button 
                    onClick={handleReset}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Reset"
                  >
                    <RefreshCw size={12} className="text-white/60" />
                  </button>
                )}
                <button 
                  onClick={toggleTracking}
                  className="w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center transition-all active:scale-95 shadow-md shadow-indigo-900/20 hover:bg-indigo-50"
                  title="Start Tracking"
                >
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Compact Progress Bar at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div 
             className="h-full bg-white shadow-[0_-2px_10px_white]"
             initial={{ width: 0 }}
             animate={{ width: `${Math.min((steps / 10000) * 100, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
