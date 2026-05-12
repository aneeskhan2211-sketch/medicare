import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity, X, RefreshCw, AlertCircle, Droplet, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { isCameraSupported } from '../lib/featureDetection';

interface PulseScannerProps {
  onResult: (bpm: number, stress: string) => void;
  onClose: () => void;
}

export const PulseScanner: React.FC<PulseScannerProps> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [bpm, setBpm] = useState<number | null>(null);
  const [stress, setStress] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'covering' | 'scanning' | 'result'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [signalBuffer, setSignalBuffer] = useState<number[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestCamera = async () => {
    if (!isCameraSupported()) {
      setError("Camera is not supported on this device.");
      return;
    }
    // Clean up any existing stream tracks first
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Attempt to turn on torch
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.torch) {
          try {
            await track.applyConstraints({ advanced: [{ torch: true }] } as any);
          } catch (e) {
            console.error("Failed to enable torch:", e);
          }
        }
      }
      setPhase('covering');
    } catch (err) {
      setError("Camera access denied. Please enable camera to use the pulse scanner.");
      toast.error("Camera access required");
    }
  };

  useEffect(() => {
    if (phase === 'result') {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getVideoTracks().forEach(track => {
          track.applyConstraints({ advanced: [{ torch: false }] } as any).catch(console.error);
        });
      }
    }
  }, [phase]);

  useEffect(() => {
    // Removed auto-start of camera
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'covering' && phase !== 'scanning') return;

    let animationId: number;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const readings: number[] = [];
    const timestamps: number[] = [];
    const rawReadings: number[] = []; // Store raw values for pre-smoothing
    let startTime = Date.now();

    const processFrame = () => {
      if (video.paused || video.ended) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }
      const numPixels = data.length / 4;
      const rAvg = rSum / numPixels;
      const gAvg = gSum / numPixels;
      const bAvg = bSum / numPixels;

      const now = Date.now();

      if (phase === 'covering') {
        // Robust detection: Red channel should be very dominant, Green and Blue very low
        // Finger over lens usually results in high red and very low green/blue due to skin absorption
        const isCovered = (rAvg > 150 && gAvg < rAvg * 0.4 && bAvg < rAvg * 0.4);
        if (isCovered) {
          setPhase('scanning');
          startTime = now;
        }
      } else if (phase === 'scanning') {
        // Redness check during scanning
        if (rAvg < 120 || gAvg > rAvg * 0.6) {
          setError("Adjust finger position - Cover lens fully");
        } else {
          // Stillness check: monitor volatility of the signal base
          if (rawReadings.length >= 5) {
            const last5 = rawReadings.slice(-5);
            const mean = last5.reduce((a, b) => a + b, 0) / 5;
            const variance = last5.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 5;
            if (variance > 15) { // Threshold for excessive noise
               setError("Keep finger perfectly still");
            } else {
               setError(null);
            }
          }
        }

        // Apply a small moving average pre-filter to raw sensor data
        rawReadings.push(rAvg);
        if (rawReadings.length > 3) {
          const smoothed = (rawReadings[rawReadings.length - 1] + rawReadings[rawReadings.length - 2] + rawReadings[rawReadings.length - 3]) / 3;
          readings.push(smoothed);
          timestamps.push(now);
          if (rawReadings.length > 10) rawReadings.shift();
        } else {
          readings.push(rAvg);
          timestamps.push(now);
        }

        if (readings.length > 2) {
          const ac = readings[readings.length - 1] - readings[readings.length - 2];
          // Detect peak for animation
          if (ac < -0.1 && readings[readings.length - 2] >= readings[readings.length - 3]) {
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 150);
          }

          setSignalBuffer(prev => {
            const next = [...prev, ac];
            return next.slice(-60);
          });
        }

        const elapsed = (now - startTime) / 1000;
        const p = Math.min((elapsed / 15) * 100, 100);
        setProgress(p);

        if (elapsed >= 4 && readings.length % 20 === 0) {
          const estimated = calculateCurrentBPM(readings, timestamps);
          if (estimated) {
            setBpm(Math.round(estimated));
          }
        }

        if (elapsed >= 15) {
            const finalBpm = calculateCurrentBPM(readings, timestamps);
            if (finalBpm && !error) {
              setBpm(Math.round(finalBpm));
              const s = finalBpm > 95 ? 'Elevated' : finalBpm > 85 ? 'Normal' : 'Low';
              setStress(s);
            } else {
              setError("Poor signal quality. Please ensure your finger is still and try again.");
            }
            setPhase('result');
            return;
        }
      }

      animationId = requestAnimationFrame(processFrame);
    };

    animationId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animationId);
  }, [phase]);

  const calculateCurrentBPM = (data: number[], times: number[]) => {
    if (data.length < 50) return null;

    // 1. Digital Signal Processing
    // Step A: DC Removal & Baseline Wandering removal
    // Using a more efficient moving average subtraction
    const dcWindow = 30; // Slightly larger for better low-freq rejection
    const acSignal: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;
        const start = Math.max(0, i - dcWindow);
        const end = Math.min(data.length - 1, i + dcWindow);
        for (let j = start; j <= end; j++) {
            sum += data[j];
            count++;
        }
        acSignal.push(data[i] - (sum / count));
    }

    // Step B: Noise Reduction (Smoothing)
    const lpWindow = 2; // Keep it tight to avoid flattening peaks too much
    const cleanSignal: number[] = [];
    for (let i = 0; i < acSignal.length; i++) {
        let sum = 0;
        let count = 0;
        const start = Math.max(0, i - lpWindow);
        const end = Math.min(acSignal.length - 1, i + lpWindow);
        for (let j = start; j <= end; j++) {
            sum += acSignal[j];
            count++;
        }
        cleanSignal.push(sum / count);
    }

    // 2. Advanced Peak Detection
    const peakIndices: number[] = [];
    const minDistanceBetweenPeaks = 350; // ms (~170 BPM max)
    
    // We'll use a sliding window for dynamic thresholding
    const thresholdWindow = Math.min(100, cleanSignal.length);
    
    for (let i = 2; i < cleanSignal.length - 2; i++) {
        const val = cleanSignal[i];
        
        // Local maxima check
        if (val > cleanSignal[i-1] && val > cleanSignal[i+1] && val > cleanSignal[i-2] && val > cleanSignal[i+2]) {
            // Dynamic threshold calculation for this local region
            const regionStart = Math.max(0, i - thresholdWindow / 2);
            const regionEnd = Math.min(cleanSignal.length - 1, i + thresholdWindow / 2);
            const region = cleanSignal.slice(regionStart, regionEnd);
            
            const regionMean = region.reduce((a, b) => a + b, 0) / region.length;
            const regionVar = region.reduce((a, b) => a + Math.pow(b - regionMean, 2), 0) / region.length;
            const regionStdDev = Math.sqrt(regionVar);
            
            const localThreshold = regionMean + (regionStdDev * 0.6); // 0.6 stddev seems more reliable

            if (val > localThreshold) {
                // Temporal distance (Refractory period)
                if (peakIndices.length === 0 || (times[i] - times[peakIndices[peakIndices.length - 1]]) > minDistanceBetweenPeaks) {
                    peakIndices.push(i);
                }
            }
        }
    }

    if (peakIndices.length < 3) return null;

    // 3. IBI Calculation & Statistical Cleaning
    const intervals: number[] = [];
    for (let i = 1; i < peakIndices.length; i++) {
        intervals.push(times[peakIndices[i]] - times[peakIndices[i-1]]);
    }

    // Remove outliers using IQR (Interquartile Range) method
    const sortedIBIs = [...intervals].sort((a, b) => a - b);
    const q1 = sortedIBIs[Math.floor(sortedIBIs.length * 0.25)];
    const q3 = sortedIBIs[Math.floor(sortedIBIs.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const validIntervals = intervals.filter(ibi => ibi >= lowerBound && ibi <= upperBound && ibi > 300 && ibi < 1500);

    if (validIntervals.length < 2) return null;

    // Use weighted average, giving more weight to recent intervals
    let weightedSum = 0;
    let weightTotal = 0;
    validIntervals.forEach((ibi, idx) => {
        const weight = 1 + (idx / validIntervals.length);
        weightedSum += ibi * weight;
        weightTotal += weight;
    });

    const avgIBI = weightedSum / weightTotal;
    const bpm = 60000 / avgIBI;

    // Final sanity check
    if (bpm < 40 || bpm > 180) return null;

    return bpm;
  };

  const handleApply = () => {
    if (bpm && stress) {
      onResult(bpm, stress);
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white p-6 overflow-hidden">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black tracking-tighter">PULSE SCANNER</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Biometric Analysis</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white hover:bg-white/10">
          <X size={20} />
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        {/* Scanner Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center">
            {phase === 'idle' ? (
              <Button 
                onClick={requestCamera}
                className="w-full h-full rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xl"
              >
                Start Scan
              </Button>
            ) : (
                <>
                {/* Background Pulsing Ring */}
                <AnimatePresence>
                    {(phase === 'scanning' || phase === 'covering') && (
                        <>
                          <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ 
                                scale: isPulsing ? 1.3 : 1.1, 
                                opacity: isPulsing ? 0.4 : 0.15 
                              }}
                              className="absolute inset-0 rounded-full bg-rose-500 blur-3xl opacity-20"
                          />
                          <motion.div 
                              animate={{ 
                                scale: isPulsing ? 1.15 : 1,
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="absolute inset-0 rounded-full border-8 border-rose-500/20"
                          />
                        </>
                    )}
                </AnimatePresence>

                <div className={cn(
                  "relative w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden transition-all duration-300",
                  phase === 'scanning' ? (isPulsing ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]" : "border-rose-500/30") : "border-white/5"
                )}>
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-20"
                    />
                    <canvas ref={canvasRef} width={64} height={64} className="hidden" />

                    {/* Scanning Interface Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <AnimatePresence mode="wait">
                            {phase === 'covering' && (
                                <motion.div 
                                    key="covering"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-center p-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
                                        <Smartphone size={40} className="text-rose-500 animate-bounce" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-rose-500">Lens Detection</p>
                                    <p className="text-xs text-slate-400 mt-2">Place your fingertip over the rear camera lens & flash</p>
                                </motion.div>
                            )}

                            {phase === 'scanning' && (
                                <motion.div 
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center w-full px-8"
                                >
                                    <div className="text-4xl font-black text-rose-500 mb-1 tabular-nums">
                                        {bpm ? bpm : Math.round(progress) + '%'}
                                    </div>
                                    
                                    {error ? (
                                      <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center justify-center gap-2 text-amber-500 mb-4 bg-amber-500/10 py-2 px-3 rounded-xl border border-amber-500/20"
                                      >
                                        <AlertCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
                                      </motion.div>
                                    ) : (
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse mb-4">
                                        {bpm ? 'Analyzing Pulse Wave...' : 'Capturing PPG Signal...'}
                                      </p>
                                    )}
                                    
                                    <div className="h-12 w-full flex items-center justify-center overflow-hidden mb-4 bg-white/5 rounded-xl border border-white/5">
                                      <svg viewBox="0 0 100 20" className="w-full h-full preserve-3d">
                                        <polyline
                                          fill="none"
                                          stroke={error ? "#f59e0b" : "#f43f5e"}
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          points={signalBuffer.map((v, i) => `${(i / 59) * 100},${10 - (v * 20)}`).join(' ')}
                                          className="transition-all duration-75"
                                        />
                                      </svg>
                                    </div>

                                    <Heart 
                                      size={24} 
                                      className={cn(
                                        "mx-auto transition-all duration-150 fill-current", 
                                        error ? "text-amber-500" : "text-rose-500",
                                        isPulsing ? "scale-125 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "scale-100"
                                      )} 
                                    />
                                </motion.div>
                            )}

                            {phase === 'result' && (
                                <motion.div 
                                    key="result"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center w-full px-6"
                                >
                                    {error ? (
                                      <div className="space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
                                          <AlertCircle size={40} className="text-amber-500" />
                                        </div>
                                        <div>
                                          <h3 className="text-xl font-black text-white">Scan Failed</h3>
                                          <p className="text-sm text-slate-400 mt-1">{error}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="text-7xl font-black text-emerald-500 leading-none">
                                            {bpm}
                                        </div>
                                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-2">{bpm && bpm > 100 ? 'Elevated Pulse' : 'Healthy Pulse'}</p>
                                      </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SVG Progress Circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle 
                            cx="128" 
                            cy="128" 
                            r="120" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            className="text-white/5"
                        />
                        <motion.circle 
                            cx="128" 
                            cy="128" 
                            r="120" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={isPulsing ? 6 : 4} 
                            strokeDasharray={754}
                            strokeDashoffset={754 - (754 * progress) / 100}
                            className="text-rose-500 transition-all duration-300"
                            animate={{ 
                              scale: isPulsing ? 1.02 : 1,
                            }}
                        />
                    </svg>
                </div>
                </>
            )}
        </div>

        {/* Phase-based Instructions */}
        <div className="w-full max-w-xs space-y-6 text-center">
            {phase === 'result' ? (
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white/5 border-white/10 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stress</p>
                        <p className="text-lg font-black text-white">{stress}</p>
                    </Card>
                    <Card className="bg-white/5 border-white/10 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none">OPTIMAL</Badge>
                    </Card>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-rose-500">
                        <Droplet size={14} className="fill-rose-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Vascular Detection On</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Hold still. The camera detects micro-color changes in your skin caused by blood flow.
                    </p>
                </div>
            )}
        </div>
      </div>

      <div className="shrink-0 p-6 space-y-4">
        {phase === 'result' ? (
            <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold" 
                  onClick={() => {
                    setError(null);
                    setBpm(null);
                    setStress(null);
                    setSignalBuffer([]);
                    setPhase('idle');
                    requestCamera();
                  }}
                >
                    <RefreshCw size={18} className="mr-2" /> Retry
                </Button>
                <Button 
                  className="flex-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 disabled:grayscale disabled:opacity-50" 
                  onClick={handleApply}
                  disabled={!!error || !bpm}
                >
                    Apply to Vitals
                </Button>
            </div>
        ) : (
            <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10" onClick={onClose}>
                Cancel Scan
            </Button>
        )}
      </div>
    </div>
  );
};
