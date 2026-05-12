import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Profile } from '../types';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const THEME_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9f43', '#5f27cd', '#10ac84', '#01a3a4', '#54a0ff'];

export const AddProfileDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { addProfile } = useStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [color, setColor] = useState(THEME_COLORS[0]);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!name || !age) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    // Simulate a bit of saving time for better UX with the spinner
    await new Promise(resolve => setTimeout(resolve, 800));

    const newProfile: Profile = {
      id: Math.random().toString(36).substring(7),
      name,
      age: parseInt(age),
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      gender,
      color,
      avatar,
      bloodType: bloodType || undefined,
      allergies: allergies ? allergies.split(',').map(a => a.trim()) : undefined,
      conditions: conditions ? conditions.split(',').map(c => c.trim()) : undefined,
    };

    addProfile(newProfile);
    setIsSaving(false);
    toast.success(`${name}'s profile added successfully!`);
    setName('');
    setAge('');
    setHeight('');
    setWeight('');
    setGender('male');
    setColor(THEME_COLORS[0]);
    setAvatar(undefined);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-none rounded-[32px] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-display font-bold">Add Family Member</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 pt-2">
          {/* Avatar Settings */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-3xl font-bold text-white" style={{ backgroundColor: color }}>
                  {name ? name[0] : '?'}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-card"
              >
                <Plus size={16} />
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </div>
            
            <div className="flex gap-2">
              {THEME_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform",
                    color === c ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grandma"
                className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Age</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 65"
                  className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>

              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground appearance-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Height (cm)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 170"
                  className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>

              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Blood Type</label>
              <input 
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="e.g. O+, A-, AB+"
                className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Allergies (comma separated)</label>
              <input 
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Peanuts, Penicillin"
                className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Conditions (comma separated)</label>
              <input 
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. Diabetes, Hypertension"
                className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
              />
            </div>
            
          </div>

          <Button 
            onClick={handleSave}
            loading={isSaving}
            className="w-full h-14 rounded-[20px] text-lg font-bold shadow-lg shadow-primary/30"
          >
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
