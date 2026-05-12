import React, { useState, useEffect } from 'react';
import { generateLogo } from '../services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Download, RefreshCw, X, CheckCircle2, Wand2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const Branding: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [fullLogo, setFullLogo] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const defaultIconPrompt = "A premium, modern app icon for a health-tech mobile app named 'MediPulse'. The icon features a minimalist capsule shape in a vibrant emerald green with a subtle, sophisticated gradient to a calming blue. Inside the capsule, there is a very subtle, clean neural network or brain-inspired pattern representing AI. The design is flat, minimal, and has soft rounded edges. The icon is centered on a crisp white background. The overall aesthetic is trustworthy, intelligent, and calming, similar to the refined design of Apple Health or Headspace. High-quality, square format.";
  const defaultFullLogoPrompt = "A professional, minimal full logo for a health-tech mobile app named 'MediPulse'. On the left, a clean emblem consisting of an emerald green capsule shape with a subtle AI/brain element. To the right of the emblem, the word 'MediPulse' is written in a bold, modern, sans-serif font in a deep slate gray. Directly below 'MediPulse', the tagline 'Apno ka khayal' is written in a smaller, elegant, and lighter weight font. The entire logo is presented on a clean white background. The color scheme features emerald green with a soft gradient to blue. The design is premium, flat, and trustworthy. High resolution.";

  const generateDefaultLogos = async () => {
    setIsLoading(true);
    try {
      const [icon, logo] = await Promise.all([
        generateLogo(defaultIconPrompt),
        generateLogo(defaultFullLogoPrompt)
      ]);

      setAppIcon(icon);
      setFullLogo(logo);
      toast.success('Brand assets generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate assets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please describe your vision first');
      return;
    }

    setIsGeneratingCustom(true);
    try {
      const prompt = `A professional, premium app icon. Theme: ${customPrompt}. Minimalist, high-quality, flat design, centered, 1024x1024.`;
      const icon = await generateLogo(prompt);
      setAppIcon(icon);
      toast.success('Custom icon generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate custom icon.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const downloadImage = (dataUrl: string | null, type: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `MediPulse-${type}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading asset...');
  };

  useEffect(() => {
    generateDefaultLogos();
  }, []);

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto pb-12 transition-colors duration-300">
      <header className="p-6 flex justify-between items-center bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">Identity Studio</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">MediPulse • Apno ka khayal</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <X size={24} />
        </button>
      </header>

      <div className="p-6 space-y-8">
        {/* Custom AI Generation Section */}
        <section className="space-y-4">
          <div id="branding-app-icon-custom-generator" className="flex items-center gap-2">
            <Wand2 id="branding-wand-icon" size={18} className="text-primary" />
            <h2 id="branding-generator-title" className="text-lg font-bold text-foreground">AI Icon Generator</h2>
          </div>
          <Card id="branding-generator-card" className="border-2 border-primary/20 bg-primary/5 shadow-inner">
            <CardContent id="branding-generator-content" className="p-4 space-y-4">
              <p id="branding-generator-desc" className="text-xs text-muted-foreground leading-relaxed">
                Describe the look you want for your MediPulse app icon (e.g., "Minimalist heart with digital pulse in purple and gold, premium 3D glassmorphism")
              </p>
              <div id="branding-generator-input-group" className="flex gap-2">
                <Input 
                  id="branding-custom-prompt-input"
                  placeholder="Describe your design vision... (e.g. Minimalist heart pulse)" 
                  className="bg-card border-border h-11"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateCustom()}
                />
                <Button 
                  id="branding-generate-button"
                  onClick={handleGenerateCustom} 
                  disabled={isGeneratingCustom || !customPrompt.trim()}
                  className="bg-primary hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/20"
                >
                  {isGeneratingCustom ? (
                    <RefreshCw id="branding-refresh-icon" size={18} className="animate-spin" />
                  ) : (
                    <Sparkles id="branding-sparkles-icon" size={18} />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div id="branding-app-icon-preview-header" className="flex items-center justify-between">
            <div id="branding-preview-title-group" className="flex items-center gap-2">
              <ImageIcon id="branding-image-icon-preview" size={18} className="text-muted-foreground" />
              <h2 id="branding-preview-title" className="text-lg font-bold text-foreground">App Icon Preview</h2>
            </div>
            <Button id="branding-reset-button" variant="ghost" size="sm" onClick={generateDefaultLogos} disabled={isLoading} className="text-[10px] uppercase font-black tracking-widest h-8 px-2">
              <RefreshCw id="branding-reset-icon" size={12} className={cn("mr-1", isLoading ? "animate-spin" : "")} />
              Reset to Default
            </Button>
          </div>
          <Card id="branding-preview-card" className="overflow-hidden border-none shadow-xl bg-card group relative">
            <CardContent id="branding-preview-content" className="p-8 flex flex-col items-center gap-6">
              <div id="branding-icon-container" className="w-56 h-56 rounded-[48px] shadow-2xl overflow-hidden bg-muted flex items-center justify-center border border-border/50 relative">
                {(isLoading || isGeneratingCustom) ? (
                  <div id="branding-loading-indicator" className="flex flex-col items-center gap-4">
                    <motion.div 
                      id="branding-loading-spinner"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 90, 180, 270, 360]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-t-4 border-primary rounded-full"
                    />
                    <div id="branding-loading-text" className="space-y-1 text-center">
                      <p className="text-sm font-bold text-foreground">Thinking...</p>
                      <p className="text-[10px] text-muted-foreground animate-pulse">Mixing pixels and magic</p>
                    </div>
                  </div>
                ) : appIcon ? (
                  <motion.img 
                    id="branding-app-icon-image"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={appIcon} 
                    alt="App Icon" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div id="branding-no-icon-msg" className="text-muted-foreground italic text-sm">No icon generated</div>
                )}
              </div>
              <div id="branding-actions-group" className="flex gap-4 w-full">
                <Button 
                  id="branding-download-icon-button"
                  onClick={() => downloadImage(appIcon, 'icon')}
                  disabled={!appIcon}
                  className="flex-1 bg-primary hover:bg-primary/90 gap-2 h-12 shadow-lg shadow-primary/10 transition-all active:scale-95"
                >
                  <Download id="branding-download-icon" size={18} />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Full Logo</h2>
          <Card className="overflow-hidden border-none shadow-xl bg-card">
            <CardContent className="p-8 flex flex-col items-center gap-6">
              <div className="w-full h-48 rounded-3xl bg-muted flex items-center justify-center border border-border/50 overflow-hidden relative">
                {isLoading ? (
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Generating Typography</span>
                  </div>
                ) : fullLogo ? (
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={fullLogo} 
                    alt="Full Logo" 
                    className="max-w-full max-h-full object-contain p-4" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-muted-foreground italic text-sm">No logo generated</div>
                )}
              </div>
              <div className="flex gap-4 w-full">
                <Button 
                  onClick={() => downloadImage(fullLogo, 'logo')}
                  disabled={!fullLogo}
                  className="flex-1 bg-secondary hover:bg-secondary/80 gap-2 h-12 transition-all active:scale-95"
                >
                  <Download size={18} />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-primary">Identity Guidelines</h4>
              <p className="text-xs text-primary/70 leading-relaxed font-medium">
                The MediPulse identity is designed to be calm and trustworthy. Use Emerald (#0F766E) as the primary focus, paired with Slate and Neutral tones for clarity and accessibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
