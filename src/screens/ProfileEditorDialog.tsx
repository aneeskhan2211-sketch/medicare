import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Profile } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const ProfileEditorDialog: React.FC<{ open: boolean; onClose: () => void; profile: Profile }> = ({ open, onClose, profile }) => {
  const { updateProfile } = useStore();
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [bloodType, setBloodType] = useState(profile.bloodType || '');
  const [allergies, setAllergies] = useState(profile.allergies?.join(', ') || '');
  const [conditions, setConditions] = useState(profile.conditions?.join(', ') || '');

  const handleSave = () => {
    updateProfile(profile.id, {
      name,
      age: parseInt(age),
      bloodType: bloodType || undefined,
      allergies: allergies ? allergies.split(',').map(a => a.trim()) : undefined,
      conditions: conditions ? conditions.split(',').map(c => c.trim()) : undefined,
    });
    toast.success('Profile updated successfully!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-none rounded-[32px] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-display font-bold">Edit Medical Profile</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Age</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-muted border-none rounded-[20px] p-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
              />
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Medical Conditions (comma separated)</label>
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
            className="w-full h-14 rounded-[20px] text-lg font-bold shadow-lg shadow-primary/30"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
