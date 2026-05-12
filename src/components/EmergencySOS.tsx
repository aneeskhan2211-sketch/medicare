import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PhoneCall, AlertTriangle, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export const EmergencySOS: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { profiles, activeProfileId } = useStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const [locationName, setLocationName] = useState('Mumbai');
  const [locationUrl, setLocationUrl] = useState('https://www.google.com/maps?q=19.0760,72.8777');

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
          setLocationName('Mumbai');
        },
        () => setLocationName('Mumbai')
      );
    } else {
      setLocationName('Mumbai');
    }
  }, []);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleAlertContacts = async () => {
    if (activeProfile.emergencyContact?.phone) {
      const snapshot = {
        name: activeProfile.name,
        bloodType: activeProfile.bloodType,
        allergies: activeProfile.allergies,
        conditions: activeProfile.conditions,
      };

      try {
        const response = await fetch('/api/sos/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactPhone: activeProfile.emergencyContact.phone,
            message: `EMERGENCY SOS from ${activeProfile.name || 'me'}! I need help. My current location: ${locationUrl || locationName}`,
            snapshot: snapshot
          })
        });

        if (response.ok) {
          alert("Emergency alert sent successfully.");
        } else {
          alert("Failed to send alert.");
        }
      } catch (e) {
        console.error(e);
        alert("An error occurred while sending the alert.");
      }
    } else {
      alert("No emergency contact phone number is set in your profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-card rounded-3xl overflow-hidden shadow-2xl border border-border max-h-[90vh] flex flex-col"
      >
        <div className="bg-red-500 p-6 relative flex flex-col items-center justify-center shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse mb-3 shadow-lg shadow-red-900/50 shrink-0">
            <PhoneCall className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Emergency SOS</h2>
          <p className="text-red-100 font-medium text-xs mt-1 text-center">Tap a button below to call immediately</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          <div className="space-y-3">
            <button 
              onClick={() => handleCall('112')}
              className="w-full h-14 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <AlertTriangle size={20} /> Ambulance (112 / 108)
            </button>
            <button 
              onClick={() => handleCall('100')}
              className="w-full h-14 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <PhoneCall size={20} /> Police (100)
            </button>
            <button 
              onClick={() => handleCall('101')}
              className="w-full h-14 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <PhoneCall size={20} /> Fire Brigade (101)
            </button>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => activeProfile.emergencyContact?.phone ? handleCall(activeProfile.emergencyContact.phone) : alert('No contact set')}
                className="w-full h-14 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95"
              >
                <span className="flex items-center gap-1 text-sm"><PhoneCall size={14} /> {activeProfile.emergencyContact?.name || 'Family 1'}</span>
                <span className="text-[10px] font-medium opacity-80 text-center px-1 truncate w-full">{activeProfile.emergencyContact?.phone || 'Not Set'}</span>
              </button>
              <button 
                onClick={handleAlertContacts}
                className="w-full h-14 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold rounded-2xl flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <span className="flex items-center gap-1 text-sm"><AlertTriangle size={14} className="text-red-500" /> Send SMS Alert</span>
                <span className="text-[10px] font-medium opacity-80">With Location</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={16} /> Medical ID
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="font-bold text-xs max-w-[200px] truncate text-right text-emerald-500">{locationName}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-bold">{activeProfile.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Blood Type</span>
                <span className="font-bold text-red-500">{activeProfile.bloodType || 'O+'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Allergies</span>
                <span className="font-bold">{activeProfile.allergies?.length ? activeProfile.allergies.join(', ') : 'None known'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Chronic Conditions</span>
                <span className="font-bold">{activeProfile.conditions?.length ? activeProfile.conditions.join(', ') : 'None known'}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 font-medium block mb-2">Current Medications</span>
                <div className="flex flex-wrap gap-2">
                  {useStore.getState().medicines.filter(m => m.profileId === activeProfileId).map(m => (
                    <span key={m.id} className="text-[10px] font-bold bg-white dark:bg-card border border-border px-2 py-1 rounded-md">
                      {m.name} ({m.dosage})
                    </span>
                  ))}
                  {useStore.getState().medicines.filter(m => m.profileId === activeProfileId).length === 0 && (
                    <span className="text-xs font-bold text-muted-foreground">No medications logged</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};
