import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Scan, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { identifyPill } from '../services/aiService';

export const PillIdentifier: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setImage(base64Data);
      setIsScanning(true);
      setResult(null);

      try {
        const base64 = base64Data.split(',')[1];
        const res = await identifyPill(base64, file.type);
        setResult(res);
        toast.success('Pill successfully identified!');
      } catch (error) {
        toast.error('Failed to identify the pill. Please try again with a clearer photo.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col"
    >
      <div className="bg-card w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md md:m-auto md:rounded-[40px] md:border md:border-border overflow-hidden flex flex-col shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">AI Pill Identifier</h2>
            <p className="text-sm text-muted-foreground">Take a photo to identify meds</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!image ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Scan className="text-primary" size={48} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center text-foreground">Identify Unknown Pills</h3>
              <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm">
                Lost the packaging? Take a clear photo of the pill showing its color, shape, and any imprints to identify it.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                capture
                onChange={handleCapture}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <Camera size={20} /> Take Photo
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-black h-48 flex items-center justify-center">
                <img src={image} alt="Pill to analyze" className={`max-h-full max-w-full object-contain ${isScanning ? 'opacity-50 blur-sm' : ''}`} />
                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                    <p className="text-sm font-bold text-primary animate-pulse tracking-wide uppercase">Analyzing Shape & Markings...</p>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted rounded-2xl p-5 border border-border space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{result.name}</h4>
                        <p className="text-sm font-bold text-primary uppercase tracking-wider">{result.dosage}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Common Uses</h5>
                      <p className="text-sm text-foreground/90 leading-relaxed">{result.use}</p>
                    </div>

                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Standard Instructions</h5>
                      <p className="text-sm text-foreground/90 leading-relaxed">{result.instructions}</p>
                    </div>
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3 text-amber-700 dark:text-amber-400 mt-4">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p className="text-xs font-medium leading-relaxed">
                        {result.safetyAlert} (Confidence: {(result.confidenceScore * 100).toFixed(0)}%)
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
