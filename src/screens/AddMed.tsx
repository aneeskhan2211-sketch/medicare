import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Clock, Plus, X, Sparkles, Scan, Check, Camera, Upload, Mic, Bell, Settings2, Coffee, Utensils, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine, MedicineType, Lifestyle } from '../types';
import { extractMedicineInfo, getMedicineRecommendations, getSmartSchedule, checkMedicationInteractions } from '../services/aiService';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { SmartSchedule } from './SmartSchedule';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface AddMedProps {
  onComplete: () => void;
  autoOpenScanner?: boolean;
  scannerSource?: 'camera' | 'gallery';
  initialData?: any;
}

export const AddMed: React.FC<AddMedProps> = ({ onComplete, autoOpenScanner, scannerSource, initialData }) => {
  const { addMedicine, isPremium, activeProfileId, profiles } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const medImageInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState<MedicineType>('pill');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [frequency, setFrequency] = useState('Daily');
  const [intervalDays, setIntervalDays] = useState('2');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [instructions, setInstructions] = useState('');
  const [mealInstruction, setMealInstruction] = useState<Medicine['mealInstruction']>('after');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [stock, setStock] = useState('30');
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeInterval, setSnoozeInterval] = useState('10');
  const [reminderTone, setReminderTone] = useState('standard');
  const [medImage, setMedImage] = useState<string | null>(null);
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [doctorName, setDoctorName] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(autoOpenScanner || false);
  const [showSmartSchedule, setShowSmartSchedule] = useState(false);
  const [fieldConfidence, setFieldConfidence] = useState<any>(null);

  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [interactionResult, setInteractionResult] = useState<any>(null);
  const [showInteractionWarning, setShowInteractionWarning] = useState(false);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.5) return 'text-yellow-500';
    return 'text-red-600';
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDosage(initialData.dosage || '');
      if (initialData.type && ['pill', 'capsule', 'liquid', 'injection', 'topical'].includes(initialData.type.toLowerCase())) {
        setType(initialData.type.toLowerCase() as MedicineType);
      }
      setFrequency(initialData.frequency || 'Daily');
      setTimes(initialData.times || ['08:00']);
      setInstructions(initialData.instructions || '');
      if (initialData.stock) setStock(initialData.stock.toString());
      if (initialData.expiryDate) setExpiryDate(initialData.expiryDate);
      if (initialData.prescriptionNumber) setPrescriptionNumber(initialData.prescriptionNumber);
      if (initialData.doctorName) setDoctorName(initialData.doctorName);
      if (initialData.confidence) setFieldConfidence(initialData.confidence);
    }
  }, [initialData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const meds = await extractMedicineInfo(base64, file.type);
        
        if (meds.length === 0) {
          toast.error('No medications found in the image.');
          setIsScanning(false);
          return;
        }

        if (meds.length === 1) {
          const info = meds[0];
          setName(info.name);
          setDosage(info.dosage);
          if (info.type && ['pill', 'capsule', 'liquid', 'injection', 'topical'].includes(info.type.toLowerCase())) {
            setType(info.type.toLowerCase() as MedicineType);
          }
          setFrequency(info.frequency || 'Daily');
          if (info.times && info.times.length > 0) setTimes(info.times);
          setInstructions(info.instructions || '');
          if (info.stock) setStock(info.stock.toString());
          if (info.expiryDate) setExpiryDate(info.expiryDate);
          if (info.prescriptionNumber) setPrescriptionNumber(info.prescriptionNumber);
          if (info.doctorName) setDoctorName(info.doctorName);
          if (info.confidence) setFieldConfidence(info.confidence);
          toast.success(`Found ${info.name}! Fields pre-filled.`);
        } else {
          // Multiple meds found, fill first but warn
          const info = meds[0];
          setName(info.name);
          setDosage(info.dosage);
          if (info.type && ['pill', 'capsule', 'liquid', 'injection', 'topical'].includes(info.type.toLowerCase())) {
            setType(info.type.toLowerCase() as MedicineType);
          }
          setFrequency(info.frequency || 'Daily');
          if (info.times && info.times.length > 0) setTimes(info.times);
          setInstructions(info.instructions || '');
          if (info.stock) setStock(info.stock.toString());
          if (info.expiryDate) setExpiryDate(info.expiryDate);
          if (info.prescriptionNumber) setPrescriptionNumber(info.prescriptionNumber);
          if (info.doctorName) setDoctorName(info.doctorName);
          if (info.confidence) setFieldConfidence(info.confidence);
          toast.info(`Found ${meds.length} medications. Pre-filled the first one (${info.name}).`);
        }
        
        setIsScanning(false);
        setShowScanner(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      toast.error('Failed to scan prescription');
    }
  };

  const handleMedImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAIScheduleSuggestion = async () => {
    if (!activeProfile?.lifestyle) {
      toast.error('Lifestyle data not set.');
      return;
    }
    try {
      toast.info('Analyzing...');
      const adherenceData = useStore.getState().getAdherenceData();
      const profileMeds = useStore.getState().medicines.filter(m => m.profileId === activeProfileId);
      const suggestion = await getSmartSchedule(
        { name, dosage, type, instructions }, 
        activeProfile.lifestyle, 
        profileMeds, 
        adherenceData
      );
      setTimes(suggestion.suggestedTimes);
      toast.success('Suggestions applied!');
    } catch (e) {
      toast.error('Failed to get insights.');
    }
  };

  const handleAdd = async (bypassInteractions = false) => {
    if (!name || !dosage) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (times.length === 0) {
      toast.error('Please add at least one reminder time');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    for (const time of times) {
      if (!timeRegex.test(time)) {
        toast.error(`Invalid time format: ${time}. Please use HH:mm`);
        return;
      }
    }

    if (!bypassInteractions) {
      setIsCheckingInteractions(true);
      try {
        const profileMeds = useStore.getState().medicines.filter(m => m.profileId === activeProfileId);
        // Include the current medicine being added
        const currentMedsList = [...profileMeds, { name, dosage }];
        const result = await checkMedicationInteractions(currentMedsList);
        
        if (result.interactionFound) {
          setInteractionResult(result);
          setShowInteractionWarning(true);
          setIsCheckingInteractions(false);
          return; // Stop and show warning
        }
      } catch (error) {
        console.error("Interaction check failed:", error);
      } finally {
        setIsCheckingInteractions(false);
      }
    }

    const newMed: Medicine = {
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      name,
      dosage,
      type,
      frequency,
      intervalDays: frequency === 'Every X Days' ? parseInt(intervalDays) : undefined,
      selectedDays: frequency === 'Specific Days' ? selectedDays : undefined,
      times,
      stock: parseInt(stock) || 0,
      totalStock: parseInt(stock) || 0,
      startDate: new Date(startDate).toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      instructions,
      mealInstruction,
      reminderTone,
      snoozeEnabled,
      snoozeInterval: parseInt(snoozeInterval) || 10,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      userId: 'user-1',
      image: medImage || undefined,
      prescriptionNumber: prescriptionNumber || undefined,
      doctorName: doctorName || undefined
    };

    try {
      addMedicine(newMed);
      toast.success('Medicine added successfully!');
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleVoiceInput = () => {
    toast.info('Voice input coming soon!', {
      description: 'We are working on AI voice recognition for medications.',
      icon: <Mic size={16} className="text-indigo-500" />
    });
  };

  return (
    <div className="bg-background">
      <div className="h-full flex flex-col">

        <header className="p-6 flex justify-between items-center bg-card/80 backdrop-blur-md sticky top-0 z-30 border-b border-border">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Add Medication</h1>
          <p className="text-muted-foreground text-xs font-medium">Set up your schedule</p>
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceInput}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"
          >
            <Mic size={20} />
          </motion.button>
          <button onClick={onComplete} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-32">
          {/* AI & OCR Actions */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSmartSchedule(true)}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-muted/50 rounded-[28px] border border-border group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Sparkles size={24} />
              </div>
              <span className="text-xs font-bold text-slate-600">AI Assistant</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-muted/50 rounded-[28px] border border-border group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Scan size={24} />
              </div>
              <span className="text-xs font-bold text-slate-600">Scan Label</span>
            </motion.button>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">MEDICINE IMAGE</label>
            {medImage ? (
              <div className="relative w-full aspect-video rounded-[32px] overflow-hidden border-2 border-slate-200 shadow-md group">
                <img src={medImage} alt="Medicine" className="w-full h-full object-cover" />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    className="bg-white/90 backdrop-blur-sm text-slate-900 p-4 rounded-full shadow-lg hover:bg-white transition-all flex items-center justify-center"
                    onClick={() => medImageInputRef.current?.click()}
                    aria-label="Change image"
                  >
                    <Upload size={20} />
                  </button>
                  <button 
                    className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-all flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMedImage(null);
                    }}
                    aria-label="Remove image"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => medImageInputRef.current?.click()}
                className="w-full h-40 flex flex-col items-center justify-center gap-4 rounded-[32px] border-2 border-dashed border-slate-300 bg-indigo-50/30 text-indigo-600 hover:border-primary/50 hover:bg-indigo-50 transition-all font-bold"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-primary border border-border">
                  <Upload size={28} />
                </div>
                <span>Upload a medicine photo</span>
              </Button>
            )}
            <input ref={medImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleMedImageSelect} />
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">MEDICINE NAME</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full bg-muted border-none rounded-[24px] p-4 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Pill size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">DOSAGE</label>
                <input 
                  type="text" 
                  value={dosage || ''}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="500mg"
                  className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">TYPE</label>
                <select 
                  value={type || 'pill'}
                  onChange={(e) => setType(e.target.value as MedicineType)}
                  className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none font-medium text-foreground"
                >
                  <option value="pill">Pill</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="injection">Injection</option>
                  <option value="topical">Topical</option>
                </select>
              </div>
            </div>

            {/* Meal Instructions */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">WHEN TO TAKE</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'before', icon: Coffee, label: 'Before' },
                  { id: 'after', icon: Utensils, label: 'After' },
                  { id: 'with', icon: Droplets, label: 'With' },
                  { id: 'custom', icon: Settings2, label: 'Custom' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMealInstruction(item.id as any)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2",
                      mealInstruction === item.id 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-muted/50 border-transparent text-muted-foreground"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency & Times */}
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Frequency</label>
                <select 
                  value={frequency || 'Daily'}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none font-medium text-foreground"
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Three Times Daily">Three Times Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Specific Days">Specific Days</option>
                  <option value="Every X Days">Every X Days</option>
                </select>
              </div>

              {frequency === 'Every X Days' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Repeat every</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={intervalDays || ''}
                      onChange={(e) => setIntervalDays(e.target.value)}
                      className="w-24 bg-muted border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                      min="1"
                    />
                    <span className="text-sm font-bold text-slate-600">Days</span>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reminder Times</label>
                  <button 
                    onClick={handleAIScheduleSuggestion}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                  >
                    <Sparkles size={12} /> Smart Suggest
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {times.map((time, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-muted px-3 py-2 rounded-xl flex items-center gap-2 border border-border"
                    >
                      <Clock size={14} className="text-primary" />
                      <input 
                        type="time" 
                        value={time || ''}
                        onChange={(e) => {
                          const newTimes = [...times];
                          newTimes[idx] = e.target.value;
                          setTimes(newTimes);
                        }}
                        className="text-sm font-bold text-foreground bg-transparent border-none outline-none w-16 focus:ring-0"
                      />
                      <button onClick={() => setTimes(times.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors ml-1">
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTimes([...times, '09:00'])}
                    className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all"
                  >
                    <Plus size={20} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Instructions / Notes</label>
              <textarea 
                value={instructions || ''}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with warm water, avoid dairy..."
                className="w-full bg-muted border-none rounded-[24px] p-5 focus:ring-2 focus:ring-primary outline-none transition-all font-medium min-h-[120px] resize-none text-foreground"
              />
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4 p-6 bg-muted/30 rounded-[32px] border border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Snooze Reminders</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Remind again if missed</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSnoozeEnabled(!snoozeEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    snoozeEnabled ? "bg-primary" : "bg-slate-200"
                  )}
                >
                  <motion.div 
                    animate={{ x: snoozeEnabled ? 26 : 2 }}
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5" 
                  />
                </button>
              </div>

              {snoozeEnabled && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-4 border-t border-slate-50 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-500">Snooze Interval</span>
                  <div className="flex items-center gap-3">
                    {['5', '10', '15', '30'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSnoozeInterval(val)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                          snoozeInterval === val ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="pt-4 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-2">
                  {['gentle', 'standard', 'loud'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setReminderTone(tone)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize",
                        reminderTone === tone 
                          ? "bg-primary text-white" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Current Stock</label>
                <input 
                  type="number" 
                  value={stock || ''}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={expiryDate || ''}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                  />
                  {!expiryDate && (
                    <span className="absolute left-5 top-4 text-muted-foreground pointer-events-none text-sm">Select date</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prescription Details */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">PRESCRIPTION NUMBER</label>
                <input 
                  type="text" 
                  value={prescriptionNumber || ''}
                  onChange={(e) => setPrescriptionNumber(e.target.value)}
                  placeholder="e.g. RX-99281"
                  className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-widest px-1">DOCTOR'S NAME</label>
                <input 
                  type="text" 
                  value={doctorName || ''}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Arpan"
                  className="w-full bg-muted border-none rounded-[24px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>
            </div>

            {/* Buy Medicine Option */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Buy Medicine (Partner Pharmacies)</label>
              <Button 
                variant="outline"
                onClick={() => toast.info('Connecting to Partner Pharmacies...', { description: 'Browse and buy your medicine with ease.' })}
                className="w-full h-16 rounded-[24px] border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 flex items-center justify-center gap-2"
              >
                <span className="text-2xl">💊</span> Browse Partner Pharmacies
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 sticky bottom-20 z-30">
        <Button 
          onClick={() => handleAdd()}
          disabled={isCheckingInteractions}
          className="w-full h-16 rounded-[24px] text-lg font-bold shadow-xl shadow-primary/30 premium-shadow"
        >
          {isCheckingInteractions ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Checking Interactions...
            </div>
          ) : 'Save Medication'}
        </Button>
      </div>

      {/* Interaction Warning Dialog */}
      <Dialog open={showInteractionWarning} onOpenChange={setShowInteractionWarning}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl max-w-[90vw] w-[400px]">
          <DialogHeader>
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-slate-900">
              Potential Interaction Detected
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Our AI pharmacist found a potential conflict between <span className="font-bold text-slate-900">{name}</span> and your existing medications.
            </DialogDescription>
          </DialogHeader>

          {interactionResult && (
            <div className="space-y-4 py-4">
              <div className={cn(
                "p-4 rounded-2xl border flex flex-col gap-2",
                interactionResult.severity === 'critical' || interactionResult.severity === 'high' 
                  ? "bg-red-50 border-red-100" 
                  : "bg-amber-50 border-amber-100"
              )}>
                <div className="flex items-center justify-between">
                  <Badge className={cn(
                    "font-bold uppercase tracking-widest text-[10px]",
                    interactionResult.severity === 'critical' || interactionResult.severity === 'high' 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-amber-500 hover:bg-amber-600"
                  )}>
                    {interactionResult.severity} Risk
                  </Badge>
                  <div className="flex gap-1">
                    {interactionResult.medicines?.map((m: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded-md border border-slate-200">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {interactionResult.details}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RECOMMENDATION</p>
                  <p className="text-xs text-slate-600 font-bold italic">
                    "{interactionResult.recommendation}"
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground italic px-4">
                Disclaimer: AI tools are for informational purposes only. Consult a doctor for any medical decisions.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-[20px] font-bold"
              onClick={() => setShowInteractionWarning(false)}
            >
              Cancel & Review
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-[20px] font-bold border-slate-200 text-slate-500"
              onClick={() => {
                setShowInteractionWarning(false);
                handleAdd(true); // Bypass interaction check
              }}
            >
              I understand, save anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-6 right-6">
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setShowScanner(false)}>
                <X size={24} />
              </Button>
            </div>
            
            <div className="relative w-full aspect-[3/4] border-2 border-white/20 rounded-[40px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-primary rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary -ml-1 -mt-1 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary -mr-1 -mt-1 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary -ml-1 -mb-1 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary -mr-1 -mb-1 rounded-br-2xl" />
                  
                  {isScanning && (
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(91,61,245,1)]"
                    />
                  )}
                </div>
              </div>
              
              <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-8">
                <p className="text-white text-sm font-bold bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                  Scan your medicine label
                </p>
                <div className="flex gap-6">
                  <button onClick={() => cameraInputRef.current?.click()} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90">
                    <Camera size={32} className="text-white" />
                  </button>
                  <button onClick={() => galleryInputRef.current?.click()} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90">
                    <Upload size={32} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer open={showSmartSchedule} onOpenChange={setShowSmartSchedule}>
        <DrawerContent className="h-[90vh] rounded-t-[40px] border-none shadow-2xl overflow-hidden">
          <SmartSchedule 
            medicine={{ name, dosage, type, instructions }} 
            onAccept={(newTimes) => {
              setTimes(newTimes);
              setShowSmartSchedule(false);
              toast.success('Smart schedule applied!');
            }}
            onCancel={() => setShowSmartSchedule(false)}
          />
        </DrawerContent>
      </Drawer>
    </div>
  </div>
);
};
