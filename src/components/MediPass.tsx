import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShieldAlert, Phone, Droplet, User, MapPin, ChevronLeft, Share2, Download, Printer, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Profile, Medicine } from '../types';

interface MediPassProps {
  profile: Profile;
  medicines: Medicine[];
  onClose: () => void;
}

export const MediPass: React.FC<MediPassProps> = ({ profile, medicines, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center animate-pulse">
            <Heart size={18} className="fill-white" />
          </div>
          <h2 className="text-xl font-display font-black tracking-tighter">EMERGENCY PASS</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white hover:bg-white/10">
          <ChevronLeft className="rotate-90" />
        </Button>
      </header>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-8 pb-32">
          {/* Virtual Pass Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 blur-2xl bg-gradient-to-br from-rose-500/50 to-indigo-600/50 opacity-20" />
            <div className="relative aspect-[1.6/1] w-full rounded-[32px] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl overflow-hidden p-8 flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none">Medical Information</p>
                  <h3 className="text-2xl font-black tracking-tight">{profile.name}</h3>
                  <div className="flex gap-2 pt-1">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[8px] px-1.5 h-4.5">{profile.age} Years</Badge>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[8px] px-1.5 h-4.5 uppercase">{profile.gender}</Badge>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-2">
                    <Droplet size={20} className="text-rose-500 mb-1" />
                    <span className="text-xl font-black leading-none">{profile.bloodType || 'B+'}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-slate-300">{profile.emergencyContact?.phone || "SOS ONLY"}</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-lg">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEDIPULSE_EMERGENCY_${profile.id}`} alt="QR Code" className="w-full h-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Info Sections */}
          <div className="grid gap-6">
            {/* Allergies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} /> Critical Allergies
              </h4>
              <div className="flex flex-wrap gap-2">
                {(profile.allergies && profile.allergies.length > 0) ? profile.allergies.map((allergy, i) => (
                  <Badge key={i} className="bg-slate-800 text-white border-slate-700 font-bold px-3 py-1 rounded-xl">
                    {allergy}
                  </Badge>
                )) : (
                  <p className="text-sm text-slate-500 italic">No allergies recorded</p>
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Droplet size={14} /> Active Medications
              </h4>
              <div className="space-y-2">
                {medicines.filter(m => m.profileId === profile.id).map((med) => (
                  <div key={med.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{med.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{med.dosage} • {med.frequency}</p>
                    </div>
                    {med.priority === 'critical' && (
                      <Badge className="bg-rose-500/20 text-rose-500 border-none text-[8px] font-black uppercase">CRITICAL</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> Medical Conditions
              </h4>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {profile.conditions?.join(', ') || "No long-term chronic conditions reported."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Persistence Options */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-slate-900 border-t border-white/5 z-[110] space-y-4">
        <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="flex flex-col h-16 rounded-2xl border-white/10 bg-white/5 text-white gap-1 hover:bg-white/10">
                <Download size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Download Pass</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-16 rounded-2xl border-white/10 bg-white/5 text-white gap-1 hover:bg-white/10">
                <Printer size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Print Card</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-16 rounded-2xl border-white/10 bg-white/5 text-white gap-1 hover:bg-white/10">
                <Share2 size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Share to Wallet</span>
            </Button>
        </div>
        <Button className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-500/20">
          Set as Lock-Screen Background
        </Button>
      </div>
    </div>
  );
};
