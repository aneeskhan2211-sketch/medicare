import React from 'react';
import { Shield, Users, Sparkles, Activity, ShieldCheck, Cpu, X, HelpCircle, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col bg-background relative z-50">
      <header className="p-6 bg-card border-b border-border flex justify-between items-center transition-colors">
        <div>
           <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
             <HeartPulse className="text-primary" size={24} /> About MediPulse
           </h2>
           <p className="text-sm text-muted-foreground mt-1">Next-Gen AI Healthcare</p>
        </div>
        {onClose && (
          <button 
             onClick={onClose}
             className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
             <X size={20} />
          </button>
        )}
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 w-full touch-pan-y shadow-inner bg-background" style={{ WebkitOverflowScrolling: 'touch' }}>
        <motion.section
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="space-y-4"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-[32px] p-6 text-center">
             <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cpu size={32} />
             </div>
             <h3 className="text-xl font-bold font-display text-foreground mb-2">Our Mission</h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               MediPulse aims to democratize access to world-class medical intelligence. By combining advanced AI models with local vernacular support, we're building a clinical-grade health companion that lives in your pocket.
             </p>
          </div>
        </motion.section>

        <motion.section 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-4"
        >
          <h3 className="font-display font-bold text-lg text-foreground px-1">Key Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
               { icon: Sparkles, title: "AI Doctor", desc: "Clinical-grade AI consultations in multiple vernacular languages.", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
               { icon: Activity, title: "PPG Vitals", desc: "Camera-based heart rate and SpO2 tracking.", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
               { icon: ShieldCheck, title: "ABHA Linked", desc: "Direct integration with Ayushman Bharat health records.", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
               { icon: Shield, title: "Privacy First", desc: "Your medical data never leaves your device without consent.", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-2xl flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${feature.color}`}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="font-display font-bold text-lg text-foreground px-1">The Team</h3>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border border-border shrink-0">
                 <Users size={24} className="text-muted-foreground" />
               </div>
               <div>
                 <h4 className="font-bold text-base text-foreground">Built by Builders</h4>
                 <p className="text-xs text-muted-foreground">Passionate about healthcare tech</p>
               </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are a team of engineers, designers, and medical professionals working together to bridge the gap between advanced technology and everyday healthcare usability for all demographics.
            </p>
          </div>
        </motion.section>
        
        <div className="text-center pt-8 opacity-60">
           <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">MediPulse v1.0.0</p>
           <p className="text-[10px] text-muted-foreground mt-1">© 2026 MediPulse Health App</p>
        </div>
      </div>
    </div>
  );
};
