import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Settings as SettingsComponent } from './Settings';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full rounded-[32px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <SettingsComponent />
      </DialogContent>
    </Dialog>
  );
};
