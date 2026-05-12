import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, X, Search, Filter, ArrowUpDown, ShoppingCart, Tag, Plus, Minus, Trash, Percent, Coins, Star, Zap,ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

interface PharmaMedicine {
  id: string;
  name: string;
  company: string;
  price: number;
  coinPrice?: number;
}

interface PremiumUpgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  coinPrice: number;
  icon: React.ReactNode;
}

const premiumUpgrades: PremiumUpgrade[] = [
  {
    id: 'up-1',
    name: 'MediPulse Pro',
    description: 'Unlimited profiles, advanced AI insights, and family sync.',
    price: 499,
    coinPrice: 5000,
    icon: <Star className="text-amber-400" size={24} />
  },
  {
    id: 'up-2',
    name: 'Caregiver Cloud',
    description: 'Real-time alerts for 5 family members and remote monitoring.',
    price: 299,
    coinPrice: 3000,
    icon: <ShieldCheck className="text-blue-400" size={24} />
  },
  {
    id: 'up-3',
    name: 'AI Nutritionist+',
    description: 'Deep nutrient tracking and personalized meal plans.',
    price: 199,
    coinPrice: 2000,
    icon: <Zap className="text-purple-400" size={24} />
  }
];

const pharmacyMedicines: PharmaMedicine[] = [
  { id: 'p1', name: 'Crocin (Paracetamol) 500mg', company: 'GlaxoSmithKline', price: 15.00, coinPrice: 150 },
  { id: 'p2', name: 'Brufen 400 (Ibuprofen)', company: 'Abbott', price: 12.00, coinPrice: 120 },
  { id: 'p3', name: 'Augmentin 625 Duo', company: 'GSK', price: 201.71, coinPrice: 2000 },
  { id: 'p4', name: 'Pantocid 40mg', company: 'Sun Pharma', price: 145.00, coinPrice: 1450 },
  { id: 'p5', name: 'Metformin 500mg', company: 'Generic', price: 18.00 },
  { id: 'p6', name: 'Amlong 5mg (Amlodipine)', company: 'Micro Labs', price: 32.00 },
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
  { id: 'p39', name: 'Zifi 200 (Cefixime)', company: 'FDC', price: 104.47 },
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
  { id: 'p57', name: 'Normaxin', company: 'Systopic', price: 42 },
  { id: 'p58', name: 'Librax', company: 'Abbott', price: 185 },
  { id: 'p59', name: 'Nexito 10 (Escitalopram)', company: 'Sun Pharma', price: 115 },
  { id: 'p60', name: 'Etilaam 0.5 (Etizolam)', company: 'Intas', price: 95 },
  { id: 'p61', name: 'Dolo 650', company: 'Micro Labs', price: 33.52 },
  { id: 'p62', name: 'Okacet (Cetirizine)', company: 'Cipla', price: 18 },
  { id: 'p63', name: 'Cheston Cold', company: 'Cipla', price: 42 },
  { id: 'p64', name: 'Ecosprin AV 75', company: 'USV', price: 45 },
  { id: 'p65', name: 'Concor 5', company: 'Merck', price: 80 },
  { id: 'p66', name: 'Sorbitrate 5mg', company: 'Abbott', price: 25 },
  { id: 'p67', name: 'Amoxyclav 625', company: 'Abbott', price: 115 },
  { id: 'p68', name: 'Zincovit Tablet', company: 'Apex', price: 105 },
  { id: 'p69', name: 'Pudin Hara Pearls', company: 'Dabur', price: 20 },
  { id: 'p70', name: 'Gelusil MPS Liquid', company: 'Pfizer', price: 115 },
  { id: 'p71', name: 'Unienzyme Tablet', company: 'Torrent', price: 62 },
  { id: 'p72', name: 'Thyrox 50', company: 'Macleods', price: 120 },
  { id: 'p73', name: 'Ascoril LS Syrup', company: 'Glenmark', price: 118 },
  { id: 'p74', name: 'Azee 500 Tablet', company: 'Cipla', price: 130 },
  { id: 'p75', name: 'Domstal 10mg', company: 'Torrent', price: 32 },
  { id: 'p76', name: 'Neurobion Forte', company: 'P&G Health', price: 38 },
  { id: 'p77', name: 'Himalaya Septilin', company: 'Himalaya', price: 145 },
  { id: 'p78', name: 'Bresol Tablet', company: 'Himalaya', price: 130 },
  { id: 'p79', name: 'Dettol Antiseptic Liquid 250ml', company: 'Reckitt', price: 125 },
  { id: 'p80', name: 'Savlon Liquid 500ml', company: 'ITC', price: 165 },
  { id: 'p81', name: 'Isabgol Husk 100g', company: 'Baidyanath', price: 95 },
  { id: 'p82', name: 'Omez 20 Capsule', company: 'Dr. Reddys', price: 62.50 },
  { id: 'p83', name: 'Crocine Advance', company: 'GSK', price: 22 },
  { id: 'p84', name: 'Disprin Regular', company: 'Reckitt', price: 12 },
  { id: 'p85', name: 'Eno Fruit Salt Lemon', company: 'GSK', price: 60.00 },
  { id: 'p86', name: 'Telma 40', company: 'Glenmark', price: 220.50 },
  { id: 'p87', name: 'Amlokind-AT', company: 'Mankind', price: 65.00 },
  { id: 'p88', name: 'Zerodol-SP', company: 'Ipca', price: 115.50 },
  { id: 'p89', name: 'Allegra 120mg', company: 'Sanofi', price: 215.30 },
  { id: 'p90', name: 'Betadine 10% Ointment', company: 'Win-Medicare', price: 135.00 },
  { id: 'p91', name: 'Soframycin Skin Cream', company: 'Sanofi', price: 54.00 },
  { id: 'p92', name: 'Saridon', company: 'Piramal', price: 42.10 },
  { id: 'p93', name: 'Baidyanath Chyawanprash 1kg', company: 'Baidyanath', price: 340.00 },
  { id: 'p94', name: 'Sinarest Tablet', company: 'Centaur', price: 92.50 },
  { id: 'p95', name: 'Alex Syrup', company: 'Glenmark', price: 125.00 },
  { id: 'p96', name: 'Volini Pain Relief Gel 30g', company: 'Sun Pharma', price: 105.00 },
  { id: 'p97', name: 'Vicks Vaporub 50g', company: 'P&G', price: 155.00 },
  { id: 'p98', name: 'Benadryl DR Syrup 150ml', company: 'J&J', price: 128.00 },
  { id: 'p99', name: 'Evion 400', company: 'P&G Health', price: 35.90 },
  { id: 'p100', name: 'Folvite 5mg', company: 'Pfizer', price: 74.00 },
  { id: 'p101', name: 'Levocet M', company: 'Hetero', price: 145.00 },
  { id: 'p102', name: 'Combiflam', company: 'Sanofi', price: 43.20 },
  { id: 'p103', name: 'Meftal-Spas', company: 'Blue Cross', price: 50.00 },
  { id: 'p104', name: 'Pudin Hara Active Liquid', company: 'Dabur', price: 75.00 },
  { id: 'p105', name: 'Digene Antacid Gel 200ml', company: 'Abbott', price: 145.00 },
  { id: 'p106', name: 'Electral Powder 21.8g', company: 'FDC', price: 21.90 },
  { id: 'p107', name: 'Ecosprin 75', company: 'USV', price: 5.50 },
  { id: 'p108', name: 'Taxim-O 200', company: 'Alkem', price: 150.00 },
  { id: 'p109', name: 'Azithral 500', company: 'Alembic', price: 119.50 },
  { id: 'p110', name: 'Thyronorm 50mcg', company: 'Abbott', price: 168.00 },
  { id: 'p111', name: 'Pantocid DSR', company: 'Sun Pharma', price: 162.00 },
  { id: 'p112', name: 'Urimax 0.4mg', company: 'Cipla', price: 198.00 },
  { id: 'p113', name: 'Ciplox 500', company: 'Cipla', price: 42.00 },
  { id: 'p114', name: 'Liv.52 DS Tablet', company: 'Himalaya', price: 165.00 },
  { id: 'p115', name: 'Becosules Capsules', company: 'Pfizer', price: 48.00 },
];

export const Marketplace: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const { user, spendCoins, setTier, cart, addToCart, updateCartQty, clearCart } = useStore();
  const [activeTab, setActiveTab] = useState<'medicines' | 'upgrades'>('medicines');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filterCompany, setFilterCompany] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);

  const userCoins = user?.coins || 0;

  const cartWithDetails = useMemo(() => {
    return cart.map(item => ({
      med: pharmacyMedicines.find(m => m.id === item.medId)!,
      qty: item.qty
    })).filter(item => item.med !== undefined);
  }, [cart]);

  const companies = useMemo(() => {
    const list = Array.from(new Set(pharmacyMedicines.map(med => med.company)));
    return ['All', ...list.sort()];
  }, []);

  const processedData = useMemo(() => {
    let result = [...pharmacyMedicines];

    if (searchQuery) {
      const queryParts = searchQuery.toLowerCase().split(' ').filter(Boolean);
      result = result.filter(med => {
        const searchable = `${med.name.toLowerCase()} ${med.company.toLowerCase()}`;
        return queryParts.every(part => searchable.includes(part));
      });
    }

    if (filterCompany !== 'All') {
      result = result.filter(med => med.company === filterCompany);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [searchQuery, sortBy, filterCompany]);

  const handleAddToCart = (med: PharmaMedicine) => {
    addToCart(med.id);
    toast.success(`${med.name} added to cart`);
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'MED20') {
      setDiscountApplied(0.2);
      toast.success('Coupon MED20 applied! 20% off.');
    } else {
      setDiscountApplied(0);
      toast.error('Invalid coupon code');
    }
  };

  const cartTotal = cartWithDetails.reduce((sum, item) => sum + (item.med.price * item.qty), 0);
  const discountAmount = cartTotal * discountApplied;
  const platformFee = cartTotal * 0.05; // 5% commission/platform fee
  const finalTotal = cartTotal - discountAmount + platformFee;
  const totalCoinsNeeded = cartWithDetails.reduce((sum, item) => sum + ((item.med.coinPrice || 0) * item.qty), 0);

  const handleCheckout = (paymentMethod: 'cash' | 'coins' = 'cash') => {
    if (paymentMethod === 'coins') {
      if (spendCoins(totalCoinsNeeded)) {
        toast.success(`Success! ${totalCoinsNeeded} Coins spent on health refills.`);
        clearCart();
        setShowCart(false);
      } else {
        toast.error('Insufficient Health Coins.');
      }
    } else {
      toast.success('Order placed successfully! Partner pharmacy will deliver soon.');
      clearCart();
      setShowCart(false);
    }
  };

  const buyUpgrade = (upgrade: PremiumUpgrade, method: 'cash' | 'coins') => {
    if (method === 'coins') {
      if (spendCoins(upgrade.coinPrice)) {
        if (upgrade.id === 'up-1') setTier('premium');
        toast.success(`${upgrade.name} Unlocked!`, { description: `You spent ${upgrade.coinPrice} coins.` });
      } else {
        toast.error('Insufficient Coins');
      }
    } else {
      toast.success(`Purchasing ${upgrade.name} for ₹${upgrade.price}...`, { description: 'Redirecting to secure gateway.' });
    }
  };

  if (showCart) {
    return (
      <div className="h-full flex flex-col bg-background relative z-10">
        <header className="p-6 bg-card border-b border-border flex justify-between items-center transition-colors">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Your Cart
          </h2>
          <button onClick={() => setShowCart(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartWithDetails.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Your cart is empty</div>
          ) : (
            <div className="space-y-4">
              {cartWithDetails.map(item => (
                <div key={item.med.id} className="flex justify-between items-center p-3 rounded-xl border border-border bg-card">
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="font-bold text-sm truncate">{item.med.name}</h4>
                    <p className="text-xs text-muted-foreground text-primary font-medium">₹{item.med.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateCartQty(item.med.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-foreground"><Minus size={14} /></button>
                    <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.med.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground"><Plus size={14} /></button>
                  </div>
                </div>
              ))}

              <div className="mt-6 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3">
                  <Percent size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0 flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Coupon Code (e.g. MED20)" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-background border border-amber-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button onClick={applyCoupon} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Apply</button>
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount (MED20)</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">Platform Fee <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded uppercase">5%</span></span>
                    <span>₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {cartWithDetails.length > 0 && (
          <div className="p-6 border-t border-border bg-card space-y-3">
            <button 
              onClick={() => handleCheckout('cash')} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Pay ₹{finalTotal.toFixed(2)}
            </button>
            <button 
              onClick={() => handleCheckout('coins')}
              disabled={userCoins < totalCoinsNeeded}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-amber-500/30"
            >
              <Coins size={18} /> Pay with {totalCoinsNeeded} Coins
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="p-6 bg-card border-b border-border flex flex-col gap-4 transition-colors">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Health <span className="text-primary">Market</span></h2>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full flex items-center gap-2 border border-amber-500/20">
              <Coins size={16} />
              <span className="text-sm font-bold">{userCoins}</span>
            </div>
            <button onClick={() => setShowCart(true)} className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
              <ShoppingCart size={24} />
              {cart.reduce((s, i) => s + i.qty, 0) > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex px-1 space-x-6 border-b border-border">
          <button
            onClick={() => setActiveTab('medicines')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'medicines' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            MEDS & REFILLS
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'upgrades' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            PREMIUM SHOP
          </button>
        </div>

        {activeTab === 'medicines' ? (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-3 mt-2">
              <Tag className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Get 20% Off Your First Order!</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Use code <strong className="font-bold py-0.5 px-1 bg-emerald-500/20 rounded text-emerald-800 dark:text-emerald-300">MED20</strong> at checkout.</p>
              </div>
            </div>
            
            <div className="w-full">
              <label className="flex items-center justify-between p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                <div>
                  <p className="font-bold text-sm text-foreground">Upload Prescription</p>
                  <p className="text-xs text-muted-foreground mt-0.5">We'll transcribe it and add to cart</p>
                </div>
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                  Upload
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  if (e.target.files?.length) {
                    toast.success('Prescription uploaded! Processing...');
                    setTimeout(() => toast.success('Items added to cart based on prescription.'), 2000);
                  }
                }} />
              </label>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search medicines or companies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border border-border text-foreground rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <ArrowUpDown size={16} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full bg-muted border border-border text-foreground rounded-xl py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>
                </div>
                
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Filter size={16} />
                  </div>
                  <select
                    value={filterCompany}
                    onChange={e => setFilterCompany(e.target.value)}
                    className="w-full bg-muted border border-border text-foreground rounded-xl py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  >
                    {companies.map(company => (
                      <option key={company} value={company}>
                        {company === 'All' ? 'All Companies' : company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl mt-2">
            <h3 className="font-bold text-sm text-primary mb-1">Redeem Your Streaks!</h3>
            <p className="text-xs text-muted-foreground">Use Health Coins earned from daily adherence to unlock premium features forever.</p>
          </div>
        )}
      </header>
      <div className="flex-1 overflow-y-auto w-full touch-pan-y min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-6">
          {activeTab === 'medicines' ? (
            <div className="grid gap-4">
              {processedData.length > 0 ? (
                processedData.map(med => (
                  <Card key={med.id} className="p-3 rounded-xl border border-border shadow-sm">
                    <CardContent className="flex justify-between items-center p-0 gap-3">
                       <div className='flex items-center gap-2.5 min-w-0'>
                         <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0 transition-colors">
                           <Pill size={18} />
                         </div>
                         <div className="min-w-0">
                            <h3 className="font-bold text-sm truncate">{med.name}</h3>
                            <p className="text-[10px] text-muted-foreground font-medium truncate">{med.company}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                         <div className="flex flex-col items-end">
                           <div className="font-bold text-sm text-foreground">₹{med.price.toFixed(2)}</div>
                           {med.coinPrice && (
                             <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                               <Coins size={10} /> {med.coinPrice}
                             </div>
                           )}
                         </div>
                         <button onClick={() => handleAddToCart(med)} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                           <Plus size={16} />
                         </button>
                       </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="font-medium">No medicines found</p>
                  <p className="text-sm">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {premiumUpgrades.map(upgrade => (
                <Card key={upgrade.id} className="p-5 rounded-3xl border border-border shadow-sm bg-gradient-to-br from-card to-muted/30">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center shadow-inner border border-border">
                      {upgrade.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{upgrade.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">{upgrade.description}</p>
                      
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => buyUpgrade(upgrade, 'cash')}
                          className="flex-1 bg-foreground text-background font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                          Buy for ₹{upgrade.price}
                        </button>
                        <button 
                          onClick={() => buyUpgrade(upgrade, 'coins')}
                          disabled={userCoins < upgrade.coinPrice}
                          className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 border border-amber-500/20 transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <Coins size={16} /> {upgrade.coinPrice} Coins
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

