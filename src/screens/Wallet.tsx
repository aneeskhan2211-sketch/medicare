import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Wallet: React.FC = () => {
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
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
          <WalletIcon size={18} className="text-teal-700" />
          <span className="font-bold text-teal-900">₹{balance.toFixed(2)}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-teal-50 border-teal-100">
          <CardContent className="p-4 flex flex-col gap-2">
            <Button onClick={() => handleTransaction('add', 500)} className="bg-teal-700 hover:bg-teal-800">
              <ArrowDownLeft size={16} className="mr-2" /> Add Money
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4 flex flex-col gap-2">
            <Button onClick={() => handleTransaction('withdraw', 200)} variant="destructive" className="bg-orange-600 hover:bg-orange-700">
              <ArrowUpRight size={16} className="mr-2" /> Withdraw
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-center py-4">No recent transactions</p>
        </div>
      </div>
    </div>
  );
};
