import React from 'react';
import { Package, AlertTriangle, ShoppingCart, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const InventoryWidget: React.FC = () => {
  const { medicines, activeProfileId, requestRefill } = useStore();
  const activeMeds = medicines.filter(m => m.profileId === activeProfileId);
  
  const lowStockMeds = activeMeds.filter(m => {
    const threshold = m.lowStockThreshold || 10;
    return m.stock <= threshold;
  });

  const expiringMeds = activeMeds.filter(m => {
    if (!m.expiryDate) return false;
    const expiry = new Date(m.expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  if (lowStockMeds.length === 0 && expiringMeds.length === 0) {
    return (
      <Card className="border-none bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[28px] p-6 text-center border border-emerald-500/20">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Package size={24} />
        </div>
        <h4 className="font-bold text-sm text-foreground">Stock is Healthy</h4>
        <p className="text-[11px] text-muted-foreground font-medium mt-1">All medications are well-stocked and valid.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display font-bold text-foreground">Inventory Alerts</h3>
        <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-full">
          {lowStockMeds.length + expiringMeds.length} Actions
        </span>
      </div>

      <div className="space-y-3">
        {lowStockMeds.map(med => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-[28px] opacity-10 blur group-hover:opacity-20 transition duration-700"></div>
            <Card className="relative bg-card border border-border shadow-sm rounded-[24px] overflow-hidden">
               <CardContent className="p-4 flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm truncate max-w-[120px]">{med.name}</h4>
                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-0.5">Low Stock: {med.stock} Left</p>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => requestRefill(med.id)}
                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
                 >
                   <ShoppingCart size={14} /> ORDER NOW
                 </button>
               </CardContent>
               <div className="bg-rose-500/5 px-4 py-1.5 border-t border-rose-500/10 flex justify-between items-center">
                 <span className="text-[9px] font-bold text-muted-foreground">Threshold: {med.lowStockThreshold || 10} units</span>
                 <Info size={10} className="text-muted-foreground/40" />
               </div>
            </Card>
          </motion.div>
        ))}

        {expiringMeds.map(med => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[28px] opacity-10 blur group-hover:opacity-20 transition duration-700"></div>
            <Card className="relative bg-card border border-border shadow-sm rounded-[24px] overflow-hidden">
               <CardContent className="p-4 flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm truncate max-w-[120px]">{med.name}</h4>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">Expires: {med.expiryDate}</p>
                    </div>
                 </div>
                 
                 <ChevronRight className="text-muted-foreground/30 group-hover:text-amber-500 transition-colors" />
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Clock = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
)
