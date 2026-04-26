import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Clock, Plus, X, Sparkles, Scan, Check, Camera, Upload, Mic, Bell, Settings2, Coffee, Utensils, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine, MedicineType } from '../types';
import { extractMedicineInfo, getMedicineRecommendations } from '../services/aiService';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { SmartSchedule } from './SmartSchedule';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddMedProps {
  onComplete: () => void;
  autoOpenScanner?: boolean;
  scannerSource?: 'camera' | 'gallery';
  initialData?: any;
}

export const AddMed: React.FC<AddMedProps> = ({ onComplete, autoOpenScanner, scannerSource, initialData }) => {
  const { addMedicine, isPremium, activeProfileId } = useStore();
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
  
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(autoOpenScanner || false);
  const [showSmartSchedule, setShowSmartSchedule] = useState(false);
  const [fieldConfidence, setFieldConfidence] = useState<any>(null);

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

        const info = meds[0];
        setName(info.name);
        setDosage(info.dosage);
        if (info.type && ['pill', 'capsule', 'liquid', 'injection', 'topical'].includes(info.type.toLowerCase())) {
          setType(info.type.toLowerCase() as MedicineType);
        }
        setFrequency(info.frequency);
        setTimes(info.times);
        setInstructions(info.instructions || '');
        if (info.stock) setStock(info.stock.toString());
        if (info.expiryDate) setExpiryDate(info.expiryDate);
        if (info.confidence) setFieldConfidence(info.confidence);
        
        setIsScanning(false);
        setShowScanner(false);
        toast.success('Prescription scanned successfully!');
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

  const handleAdd = () => {
    if (!name || !dosage) {
      toast.error('Please fill in all required fields');
      return;
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
      image: medImage || undefined
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
    <div className="page-container">
      <div className="watermark-pill" />
      <div className="content-layer h-full flex flex-col">
        {/* Background Watermark */}
        <div className="absolute top-1/2 right-0 w-64 h-64 opacity-[0.03] pointer-events-none -mr-20 filter blur-[2px]">
          <Plus size={256} className="text-slate-900" />
        </div>

        <header className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Add Medication</h1>
          <p className="text-slate-400 text-xs font-medium">Set up your schedule</p>
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceInput}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
          >
            <Mic size={20} />
          </motion.button>
          <button onClick={onComplete} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
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
              className="h-28 flex flex-col items-center justify-center gap-2 bg-white rounded-[28px] card-shadow border border-slate-50 group transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Sparkles size={24} />
              </div>
              <span className="text-xs font-bold text-slate-600">AI Assistant</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="h-28 flex flex-col items-center justify-center gap-2 bg-white rounded-[28px] card-shadow border border-slate-50 group transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Scan size={24} />
              </div>
              <span className="text-xs font-bold text-slate-600">Scan Label</span>
            </motion.button>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Medicine Image</label>
            {medImage ? (
              <div className="relative w-full aspect-video rounded-[32px] overflow-hidden border-2 border-slate-200 shadow-md">
                <img src={medImage} alt="Medicine" className="w-full h-full object-cover" />
                
                {/* Fixed position Remove button for easier clicking */}
                <button 
                  className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMedImage(null);
                  }}
                  aria-label="Remove image"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <Button 
                onClick={() => medImageInputRef.current?.click()}
                className="w-full h-32 flex flex-col items-center justify-center gap-3 rounded-[32px] border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-primary/50 hover:bg-indigo-50/50 transition-all font-bold"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                  <Camera size={24} />
                </div>
                Click to upload medicine photo
              </Button>
            )}
            <input ref={medImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleMedImageSelect} />
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Medicine Name</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full bg-white border-none card-shadow rounded-[24px] p-5 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Pill size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Dosage</label>
                <input 
                  type="text" 
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="500mg"
                  className="w-full bg-white border-none card-shadow rounded-[24px] p-5 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as MedicineType)}
                  className="w-full bg-white border-none card-shadow rounded-[24px] p-5 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none font-medium"
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">When to take</label>
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
                        ? "bg-primary/5 border-primary text-primary" 
                        : "bg-white border-transparent text-slate-400 card-shadow"
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
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-white border-none card-shadow rounded-[24px] p-5 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none font-medium"
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
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(e.target.value)}
                      className="w-24 bg-white border-none card-shadow rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
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
                    onClick={() => setShowSmartSchedule(true)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                  >
                    <Sparkles size={12} /> Auto-suggest
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {times.map((time, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white px-3 py-2 rounded-xl card-shadow flex items-center gap-2 border border-slate-100"
                    >
                      <Clock size={14} className="text-primary" />
                      <input 
                        type="time" 
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...times];
                          newTimes[idx] = e.target.value;
                          setTimes(newTimes);
                        }}
                        className="text-sm font-bold text-slate-700 bg-transparent border-none outline-none w-16 focus:ring-0"
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

            {/* Advanced Settings */}
            <div className="space-y-4 p-6 bg-white rounded-[32px] card-shadow">
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
                          snoozeInterval === val ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                        )}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="pt-4 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Reminder Tone</span>
                  <select 
                    value={reminderTone}
                    onChange={(e) => setReminderTone(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg px-3 py-1 text-[10px] font-bold text-slate-600 outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="gentle">Gentle</option>
                    <option value="standard">Standard</option>
                    <option value="loud">Loud</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Current Stock</label>
                <input 
                  type="number" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-white border-none card-shadow rounded-[24px] p-5 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-white border-none card-shadow rounded-[24px] p-5 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 sticky bottom-20 z-30">
        <Button 
          onClick={handleAdd}
          className="w-full h-16 rounded-[24px] text-lg font-bold shadow-xl shadow-primary/30 premium-shadow"
        >
          Save Medication
        </Button>
      </div>

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
