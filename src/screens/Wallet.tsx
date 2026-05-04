import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WalletProps {
  onClose?: () => void;
}

export const Wallet: React.FC<WalletProps> = ({ onClose }) => {
  const [balance, setBalance] = useState(1500.00); // Mock initial balance

  const handleTransaction = (type: 'add' | 'withdraw', amount: number) => {
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (type === 'withdraw' && amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    // In a real app, this would trigger an API call to a backend payment gateway service
    setBalance(prev => type === 'add' ? prev + amount : prev - amount);
    toast.success(`${type === 'add' ? 'Added' : 'Withdrawn'} ₹${amount} successfully!`);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="flex justify-between items-center bg-card p-4 sticky top-0 z-10 border-b border-border transition-colors">
        <div className="flex items-center gap-3">
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all"
            >
              <X size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-foreground">Wallet</h1>
        </div>
        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <WalletIcon size={18} className="text-primary" />
          <span className="font-bold text-foreground">₹{balance.toFixed(2)}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full touch-pan-y min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/10 rounded-2xl shadow-sm">
              <CardContent className="p-4 flex flex-col gap-2">
                <Button onClick={() => handleTransaction('add', 500)} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                  <ArrowDownLeft size={16} className="mr-2" /> Add Money
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-red-500/5 border-red-500/10 rounded-2xl shadow-sm">
              <CardContent className="p-4 flex flex-col gap-2">
                <Button onClick={() => handleTransaction('withdraw', 200)} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                  <ArrowUpRight size={16} className="mr-2" /> Withdraw
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Recent Transactions</h2>
            <div className="bg-card rounded-[24px] p-6 shadow-sm border border-border">
              <p className="text-muted-foreground text-center py-8">No recent transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
