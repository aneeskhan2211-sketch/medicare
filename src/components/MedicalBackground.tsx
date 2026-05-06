import React from 'react';
import { Heart, Plus, Pill } from 'lucide-react';
import { useStore } from '../store/useStore';

export interface MedicalBackgroundProps {
  heartRate?: number;
  isLiveSync?: boolean; 
}

export const MedicalBackground = ({ heartRate, isLiveSync = false }: MedicalBackgroundProps) => {
  const { vitals, activeProfileId } = useStore();
  
  // Get latest heart rate for active profile as fallback
  const latestHR = vitals
    .filter(v => v.profileId === activeProfileId && v.type === 'heart_rate')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const bpm = heartRate || (latestHR ? parseInt(latestHR.value) : 72);
  
  const pulseDuration = (60 / Math.max(bpm, 30)).toFixed(2);

  // Determine color based on BPM range
  // Teal/green for 50-90 BPM, amber for 91-110 BPM, and red for 111+ BPM.
  const getBpmColor = (rate: number) => {
    if (rate <= 90) return '#00ffaa'; // Teal/Green for normal
    if (rate <= 110) return '#f59e0b'; // Amber for elevated
    return '#ef4444'; // Red for high
  };

  const getBpmBgGradient = (rate: number) => {
    if (rate <= 90) return 'linear-gradient(180deg, var(--background) 0%, rgba(0, 255, 170, 0.08) 100%)';
    if (rate <= 110) return 'linear-gradient(180deg, var(--background) 0%, rgba(245, 158, 11, 0.08) 100%)';
    return 'linear-gradient(180deg, var(--background) 0%, rgba(239, 68, 68, 0.12) 100%)';
  };

  const heartColor = isLiveSync ? getBpmColor(bpm) : '#00ffaa';
  const bgGradient = isLiveSync ? getBpmBgGradient(bpm) : '';
  
  // Each SVG represents 4 beats. We want one beat to pass every pulseDuration.
  // So the total duration to move 50% (one SVG width) should be 4 * pulseDuration.
  const scrollDuration = (4 * parseFloat(pulseDuration)).toFixed(2);

  return (
    <div 
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-700 ${isLiveSync ? '' : 'medical-gradient'}`}
      style={{
        '--heart-bpm': bpm,
        '--pulse-duration': `${pulseDuration}s`,
        '--scroll-duration': `${scrollDuration}s`,
        '--heart-color': heartColor,
        background: bgGradient || undefined
      } as React.CSSProperties}
    >
      {/* Subtle Radial Glow */}
      <div className={`absolute inset-0 radial-glow-premium ${isLiveSync ? 'opacity-50' : ''}`} />
      
      {/* Heartbeat ECG Line - Only show high-impact ECG on Live Sync to localized visual effects */}
      {isLiveSync && (
        <div className="absolute top-[40%] left-0 w-[200%] h-32 opacity-[0.15] overflow-hidden mix-blend-screen">
          <div className="flex w-full h-full animate-heartbeat-scroll">
            <svg viewBox="0 0 1000 100" className="w-1/2 h-full" preserveAspectRatio="none">
              <path d="M0,50 L100,50 L115,30 L130,70 L145,10 L160,90 L175,50 L350,50 L365,30 L380,70 L395,10 L410,90 L425,50 L600,50 L615,30 L630,70 L645,10 L660,90 L675,50 L850,50 L865,30 L880,70 L895,10 L910,90 L925,50 L1000,50" fill="none" stroke="var(--heart-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg viewBox="0 0 1000 100" className="w-1/2 h-full" preserveAspectRatio="none">
              <path d="M0,50 L100,50 L115,30 L130,70 L145,10 L160,90 L175,50 L350,50 L365,30 L380,70 L395,10 L410,90 L425,50 L600,50 L615,30 L630,70 L645,10 L660,90 L675,50 L850,50 L865,30 L880,70 L895,10 L910,90 L925,50 L1000,50" fill="none" stroke="var(--heart-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Pulse Glow Center - Synced with BPM */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[100px] pointer-events-none transition-colors duration-500 ${isLiveSync ? 'animate-pulse-glow' : ''}`}
        style={{ 
          backgroundColor: 'var(--heart-color)',
          opacity: isLiveSync ? undefined : 0.05
        }}
      />

      {/* Floating Icons */}
      <div className={`absolute top-[10%] left-[10%] text-[var(--heart-color)] opacity-[0.03] animate-float transition-colors duration-700`} style={{ animationDelay: '0s' }}>
        <Heart size={isLiveSync ? 70 : 60} />
      </div>
      <div className={`absolute top-[70%] left-[15%] text-[var(--heart-color)] opacity-[0.03] animate-float transition-colors duration-700`} style={{ animationDelay: '2s' }}>
        <Plus size={isLiveSync ? 50 : 40} />
      </div>
      <div className={`absolute top-[20%] right-[10%] text-[var(--heart-color)] opacity-[0.03] animate-float transition-colors duration-700`} style={{ animationDelay: '4s' }}>
        <Pill size={isLiveSync ? 60 : 50} />
      </div>
      <div className={`absolute top-[80%] right-[20%] text-[var(--heart-color)] opacity-[0.03] animate-float transition-colors duration-700`} style={{ animationDelay: '6s' }}>
        <Heart size={isLiveSync ? 55 : 45} />
      </div>
    </div>
  );
};
