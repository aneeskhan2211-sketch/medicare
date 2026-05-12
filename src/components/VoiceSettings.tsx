import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useStore } from '../store/useStore';

interface VoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ open, onOpenChange }) => {
  const { settings, updateSettings } = useStore();

  const sensitivity = settings?.sensitivity ?? 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[90vw] bg-card rounded-[32px] p-6">
        <DialogTitle className="text-xl font-bold">Voice Settings</DialogTitle>
        <DialogDescription className="sr-only">Configure voice input.</DialogDescription>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <Label className="text-sm font-bold">Recognition Sensitivity ({sensitivity}%)</Label>
            <Slider 
              value={[sensitivity]} 
              min={0} 
              max={100} 
              step={1}
              onValueChange={(val) => {
                const newSensitivity = Array.isArray(val) ? val[0] : val;
                updateSettings({ sensitivity: newSensitivity });
              }}
              className="py-2"
            />
          </div>
        </div>
        
        <Button className="w-full mt-6 rounded-xl" onClick={() => onOpenChange(false)}>Save Settings</Button>
      </DialogContent>
    </Dialog>
  );
};
