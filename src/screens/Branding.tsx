import React, { useState, useEffect } from 'react';
import { generateLogo } from '../services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const Branding: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [fullLogo, setFullLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateLogos = async () => {
    setIsLoading(true);
    try {
      const iconPrompt = "A premium, modern app icon for a health-tech mobile app named 'Medicare'. The icon features a minimalist capsule shape in a vibrant emerald green with a subtle, sophisticated gradient to a calming blue. Inside the capsule, there is a very subtle, clean neural network or brain-inspired pattern representing AI. The design is flat, minimal, and has soft rounded edges. The icon is centered on a crisp white background. The overall aesthetic is trustworthy, intelligent, and calming, similar to the refined design of Apple Health or Headspace. High-quality, 1024x1024, square format.";
      const fullLogoPrompt = "A professional, minimal full logo for a health-tech mobile app named 'Medicare'. On the left, a clean emblem consisting of an emerald green capsule shape with a subtle AI/brain element. To the right of the emblem, the word 'Medicare' is written in a bold, modern, sans-serif font in a deep slate gray. Directly below 'Medicare', the tagline 'Apno ka khayal' is written in a smaller, elegant, and lighter weight font. The entire logo is presented on a clean white background. The color scheme features emerald green with a soft gradient to blue. The design is premium, flat, and trustworthy. High resolution.";

      const [icon, logo] = await Promise.all([
        generateLogo(iconPrompt),
        generateLogo(fullLogoPrompt)
      ]);

      setAppIcon(icon);
      setFullLogo(logo);
      toast.success('Logos generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate logos. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateLogos();
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-12">
      <header className="p-6 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Medicare Branding</h1>
          <p className="text-sm text-slate-500 italic">Apno ka khayal</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </header>

      <div className="p-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">App Icon</h2>
            <Button variant="outline" size="sm" onClick={generateLogos} disabled={isLoading} className="gap-2">
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Regenerate
            </Button>
          </div>
          <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 bg-white">
            <CardContent className="p-8 flex flex-col items-center gap-6">
              <div className="w-48 h-48 rounded-[40px] shadow-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-400">Designing...</span>
                  </div>
                ) : appIcon ? (
                  <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-slate-300 italic text-sm">No icon generated</div>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Download size={16} />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Full Logo</h2>
          <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 bg-white">
            <CardContent className="p-8 flex flex-col items-center gap-6">
              <div className="w-full h-48 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-400">Crafting...</span>
                  </div>
                ) : fullLogo ? (
                  <img src={fullLogo} alt="Full Logo" className="max-w-full max-h-full object-contain p-4" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-slate-300 italic text-sm">No logo generated</div>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Download size={16} />
                  Download SVG
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Brand Guidelines</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Color</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-sm" />
                <span className="text-sm font-mono font-medium text-slate-700">#10B981</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Typography</p>
              <p className="text-sm font-bold text-slate-800">Inter Bold</p>
              <p className="text-[10px] text-slate-500">Modern, Clean, Trustworthy</p>
            </div>
          </div>
        </section>

        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">Design Complete</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              The Medicare branding is designed to feel trustworthy and intelligent. The capsule shape represents the core medicine tracking, while the subtle AI patterns signal the smart features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
