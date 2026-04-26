import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Pill } from 'lucide-react';

interface PharmaMedicine {
  id: string;
  name: string;
  company: string;
  price: number;
}

const pharmacyMedicines: PharmaMedicine[] = [
  { id: 'p1', name: 'Paracetamol', company: 'PharmaCo A', price: 50 },
  { id: 'p2', name: 'Ibuprofen', company: 'PharmaCo B', price: 75 },
  { id: 'p3', name: 'Amoxicillin', company: 'PharmaCo C', price: 120 },
];

export const Marketplace: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const handleBuy = (med: PharmaMedicine) => {
    toast.success(`Purchased ${med.name} from ${med.company} for Rs ${med.price}`);
    onClose();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
      <div className="grid gap-4">
        {pharmacyMedicines.map(med => (
          <Card key={med.id} className="p-4 rounded-2xl">
            <CardContent className="flex justify-between items-center p-0">
               <div className='flex items-center gap-3'>
                 <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                   <Pill />
                 </div>
                 <div>
                    <h3 className="font-bold">{med.name}</h3>
                    <p className="text-sm text-slate-500">{med.company} - Rs {med.price}</p>
                 </div>
               </div>
              <Button onClick={() => handleBuy(med)} className="rounded-xl">
                <ShoppingCart size={16} className="mr-2" /> Buy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
