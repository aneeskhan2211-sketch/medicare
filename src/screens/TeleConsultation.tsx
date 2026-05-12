import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Share2, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

export const TeleConsultationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [shareLink, setShareLink] = useState<string | null>(null);

  const generateShareableLink = () => {
    // In production, this would call a backend service to create a secure, expiring token
    const mockToken = Math.random().toString(36).substring(7);
    setShareLink(`https://medipulse.app/share/chronicle/${mockToken}`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <h2 className="text-2xl font-display font-bold">Tele-Consultation Bridge</h2>
      </div>

      <Card className="rounded-2xl border-none shadow-sm p-6 bg-primary/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold">Secure Health Chronicle Sharing</h3>
            <p className="text-sm text-muted-foreground">Share your vitals, labs, and med logs securely with your clinician.</p>
          </div>
        </div>
        <Button onClick={generateShareableLink} className="w-full rounded-xl gap-2">
          <Share2 size={18} />
          Generate Secure Access Link
        </Button>
        
        {shareLink && (
          <div className="mt-4 p-4 bg-background rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-1">Shareable Link (Expires in 2 hours):</p>
            <p className="font-mono text-sm break-all">{shareLink}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
