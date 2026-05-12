import React, { useState } from 'react';
import { Medicine } from '../types';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Minus, ShoppingBag, X, MessageCircle, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface RefillDialogProps {
  medicine: Medicine;
  onClose: () => void;
}

export const RefillDialog: React.FC<RefillDialogProps> = ({ medicine, onClose }) => {
  const { updateMedicine } = useStore();
  const [amount, setAmount] = useState(30);

  const handleRefill = () => {
    updateMedicine(medicine.id, {
      stock: medicine.stock + amount,
      totalStock: medicine.totalStock + amount,
    });
    toast.success(`Added ${amount} units to ${medicine.name}`);
    onClose();
  };

  const handleWhatsAppRefill = () => {
    const message = encodeURIComponent(`Hi, I need a refill for ${medicine.name} (${medicine.dosage || ""}). Amount: ${amount} units.`);
    window.open(`https://wa.me/91XXXXXXXXXX?text=${message}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handlePharmacyRefill = () => {
    toast.info('Local Pharmacy Integration', {
      description: `Checking availability for ${medicine.name} at nearby Apollo and Netmeds...`,
      icon: <Truck size={16} />
    });
    
    setTimeout(() => {
      toast.success('Found at Apollo Pharmacy (0.8km away)', {
        description: 'Delivery available in 30 mins.'
      });
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="p-6 flex justify-between items-center border-b border-slate-100">
        <h2 className="text-2xl font-display font-bold text-slate-900">Refill Medicine</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </header>

      <div className="p-6 flex-1 space-y-8">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0 transition-all">
            <Pill size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">{medicine.name}</h3>
            <p className="text-[10px] text-slate-500 font-medium transition-colors">Current stock: {medicine.stock} units</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center block">
            Amount to Add
          </label>
          <div className="flex items-center justify-center gap-6">
            <Button 
              variant="outline" 
              size="icon"
              className="w-14 h-14 rounded-2xl border-slate-200 text-slate-600"
              onClick={() => setAmount(Math.max(1, amount - 10))}
            >
              <Minus size={24} />
            </Button>
            <div className="w-24 text-center">
              <span className="text-5xl font-display font-bold text-indigo-600">{amount}</span>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className="w-14 h-14 rounded-2xl border-slate-200 text-slate-600"
              onClick={() => setAmount(amount + 10)}
            >
              <Plus size={24} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="h-20 flex flex-col gap-2 rounded-2xl border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 font-bold"
            onClick={handleWhatsAppRefill}
          >
            <MessageCircle size={24} />
            <span className="text-xs">Ask on WhatsApp</span>
          </Button>
          <Button 
            variant="outline"
            className="h-20 flex flex-col gap-2 rounded-2xl border-indigo-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50 font-bold"
            onClick={handlePharmacyRefill}
          >
            <MapPin size={24} />
            <span className="text-xs">Nearby Pharmacy</span>
          </Button>
        </div>
      </div>

      <div className="p-6 safe-bottom">
        <Button 
          onClick={handleRefill}
          className="w-full h-14 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-lg"
        >
          <ShoppingBag size={20} />
          Confirm Refill
        </Button>
      </div>
    </div>
  );
};
