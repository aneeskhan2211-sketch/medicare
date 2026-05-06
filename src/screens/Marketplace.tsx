import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Pill, X } from 'lucide-react';

interface PharmaMedicine {
  id: string;
  name: string;
  company: string;
  price: number;
}

const pharmacyMedicines: PharmaMedicine[] = [
  { id: 'p1', name: 'Crocin (Paracetamol) 500mg', company: 'GlaxoSmithKline', price: 15 },
  { id: 'p2', name: 'Brufen 400 (Ibuprofen)', company: 'Abbott', price: 12 },
  { id: 'p3', name: 'Augmentin 625 Duo', company: 'GSK', price: 201 },
  { id: 'p4', name: 'Pantocid 40mg', company: 'Sun Pharma', price: 145 },
  { id: 'p5', name: 'Metformin 500mg', company: 'Generic', price: 18 },
  { id: 'p6', name: 'Amlong 5mg (Amlodipine)', company: 'Micro Labs', price: 32 },
  { id: 'p7', name: 'Zyrtec (Cetirizine) 10mg', company: 'Dr. Reddys', price: 18 },
  { id: 'p8', name: 'Voveran SR 100mg', company: 'Novartis', price: 165 },
  { id: 'p9', name: 'Telma 40 (Telmisartan)', company: 'Glenmark', price: 92 },
  { id: 'p10', name: 'Azithral 500mg', company: 'Alembic', price: 118 },
  { id: 'p11', name: 'Shelcal 500 (Calcium + D3)', company: 'Torrent', price: 112 },
  { id: 'p12', name: 'Evion 400 (Vitamin E)', company: 'P&G Health', price: 35 },
  { id: 'p13', name: 'Digene Tablet (Mint)', company: 'Abbott', price: 22 },
  { id: 'p14', name: 'Saridon (Pain Relief)', company: 'Bayer', price: 38 },
  { id: 'p15', name: 'Combiflam (Ibuprofen+Para)', company: 'Sanofi', price: 42 },
  { id: 'p16', name: 'Liv 52 (Health Tonic)', company: 'Himalaya', price: 135 },
  { id: 'p17', name: 'Atorva 10 (Atorvastatin)', company: 'Zydus', price: 74 },
  { id: 'p18', name: 'Becosules (Vitamin B Complex)', company: 'Pfizer', price: 45 },
  { id: 'p19', name: 'Limcee 500mg (Vitamin C)', company: 'Abbott', price: 24 },
  { id: 'p20', name: 'Orofer XT (Iron)', company: 'Emcure', price: 172 },
  { id: 'p21', name: 'Glycomet 500 (Metformin)', company: 'USV', price: 25 },
  { id: 'p22', name: 'Rantac 150 (Ranitidine)', company: 'J.B. Chemicals', price: 38 },
  { id: 'p23', name: 'Allegra 120mg (Fexofenadine)', company: 'Sanofi', price: 212 },
  { id: 'p24', name: 'Montair LC (Montelukast)', company: 'Cipla', price: 198 },
  { id: 'p25', name: 'Wikoryl (Cold & Flu)', company: 'Alembic', price: 48 },
  { id: 'p26', name: 'Dolo 650 (Paracetamol)', company: 'Micro Labs', price: 30 },
  { id: 'p27', name: 'Taxim O 200 (Cefixime)', company: 'Alkem', price: 105 },
  { id: 'p28', name: 'Ecosprin 75', company: 'USV', price: 5 },
  { id: 'p29', name: 'Thyronorm 50mg', company: 'Abbott', price: 185 },
  { id: 'p30', name: 'Glycinorm M 80/500', company: 'IPCA', price: 124 },
  { id: 'p31', name: 'Ventorlin (Asthalin) Inhaler', company: 'Cipla', price: 142 },
  { id: 'p32', name: 'Foracort 200 Inhaler', company: 'Cipla', price: 485 },
  { id: 'p33', name: 'Supradyn Daily Multivitamin', company: 'Bayer', price: 55 },
  { id: 'p34', name: 'Revital H Capsule', company: 'Sun Pharma', price: 310 },
  { id: 'p35', name: 'Cetzine 10mg (Cetirizine)', company: 'GSK', price: 22 },
  { id: 'p36', name: 'Deriphyllin Tablet', company: 'Zydus', price: 18 },
  { id: 'p37', name: 'Clavam 625 Duo', company: 'Alkem', price: 195 },
  { id: 'p38', name: 'Montek LC', company: 'Sun Pharma', price: 175 },
  { id: 'p39', name: 'Zifi 200 (Cefixime)', company: 'FDC', price: 92 },
  { id: 'p40', name: 'Metolar XR 25', company: 'Ipca Labs', price: 68 },
  { id: 'p41', name: 'Rosuvas 10 (Rosuvastatin)', company: 'Sun Pharma', price: 148 },
  { id: 'p42', name: 'Janumet 50/500', company: 'MSD', price: 540 },
  { id: 'p43', name: 'Glizid M (Glipizide+Met)', company: 'Panacea Biotec', price: 85 },
  { id: 'p44', name: 'Losar 50 (Losartan)', company: 'Torrent', price: 98 },
  { id: 'p45', name: 'Cylin 10 (Cilnidipine)', company: 'Exeltis', price: 125 },
  { id: 'p46', name: 'Nexpro 40 (Esomeprazole)', company: 'Torrent', price: 155 },
  { id: 'p47', name: 'Ganaton 50 (Itopride)', company: 'Abbott', price: 245 },
  { id: 'p48', name: 'Eltroxin 50mcg', company: 'GSK', price: 165 },
  { id: 'p49', name: 'Folvite (Folic Acid)', company: 'Pfizer', price: 32 },
  { id: 'p50', name: 'Betadine Ointment 10g', company: 'Win-Medicare', price: 65 },
  { id: 'p51', name: 'Volini Gel 15g', company: 'Sun Pharma', price: 85 },
  { id: 'p52', name: 'Moov Cream 25g', company: 'Reckitt', price: 110 },
  { id: 'p53', name: 'Bifilac Capsule', company: 'Tablets India', price: 145 },
  { id: 'p54', name: 'Stugeron 25mg', company: 'Janssen', price: 158 },
  { id: 'p55', name: 'Avil 25mg', company: 'Sanofi', price: 12 },
  { id: 'p56', name: 'Vertin 16mg', company: 'Abbott', price: 215 },
  { id: 'p57', name: 'Normaxin (Chlordiazepoxide+)', company: 'Systopic', price: 42 },
  { id: 'p58', name: 'Librax', company: 'Abbott', price: 185 },
  { id: 'p59', name: 'Nexito 10 (Escitalopram)', company: 'Sun Pharma', price: 115 },
  { id: 'p60', name: 'Etilaam 0.5 (Etizolam)', company: 'Intas', price: 95 },
];

export const Marketplace: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const handleBuy = (med: PharmaMedicine) => {
    toast.success(`Purchased ${med.name} from ${med.company} for Rs ${med.price}`);
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="p-6 bg-card border-b border-border flex justify-between items-center transition-colors">
        <h2 className="text-2xl font-bold text-foreground">Rate</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted">
          <X size={24} />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto w-full touch-pan-y min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="grid gap-4 p-6">
        {pharmacyMedicines.map(med => (
          <Card key={med.id} className="p-3 rounded-xl border border-border shadow-sm">
            <CardContent className="flex justify-between items-center p-0 gap-3">
               <div className='flex items-center gap-2.5 min-w-0'>
                 <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0 transition-colors">
                   <Pill size={18} />
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{med.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{med.company} • Rs {med.price}</p>
                 </div>
               </div>
              <Button onClick={() => handleBuy(med)} size="sm" className="rounded-lg h-8 px-3 font-bold text-xs shrink-0 transition-all">
                <ShoppingCart size={12} className="mr-1.5" /> Buy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
};
