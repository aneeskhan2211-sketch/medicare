import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, Wallet as WalletIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface WalletProps {
  onClose: () => void;
}

export const Wallet: React.FC<WalletProps> = ({ onClose }) => {
  const { user, addBalance, withdrawBalance } = useStore();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please login to use the wallet');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    try {
      const response = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val, userId: user.id }),
      });
      const data = await response.json();
      
      if (data.success) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const options = {
            key: data.key_id,
            amount: val * 100,
            currency: "INR",
            name: "MediMind Wallet",
            order_id: data.orderId,
            handler: function (response: any) {
              addBalance(val);
              toast.success(`Rs ${val} added successfully!`);
              setAmount('');
            },
            theme: { color: "#4f46e5" }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        toast.error('Payment failed');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleWithdraw = async () => {
    if (!user) {
      toast.error('Please login to use the wallet');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (!upiId) {
        toast.error('Enter UPI ID');
        return;
    }
    if ((user?.balance || 0) < val) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val, userId: user.id, upiId }),
      });
      if (response.ok) {
        withdrawBalance(val);
        toast.success(`Rs ${val} withdrawn via UPI!`);
        setAmount('');
        setUpiId('');
      } else {
        toast.error('Withdrawal failed');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Wallet</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200">
          <X size={24} />
        </button>
      </header>

      <Card className="bg-indigo-600 text-white p-6 rounded-[24px]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/80 font-medium">Available Balance</p>
            <h3 className="text-4xl font-bold">Rs {(user?.balance ?? 0).toFixed(2)}</h3>
          </div>
          <WalletIcon size={48} className="text-white/20" />
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="font-bold">Add / Withdraw Money</h4>
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (Rs)"
          className="w-full p-4 rounded-2xl border border-slate-200 bg-white"
        />
        <input 
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="Enter UPI ID (for withdrawal)"
          className="w-full p-4 rounded-2xl border border-slate-200 bg-white"
        />
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleAdd} className="bg-green-500 hover:bg-green-600 h-14 rounded-2xl font-bold">
            <ArrowUpCircle className="mr-2" /> Add
          </Button>
          <Button onClick={handleWithdraw} className="bg-red-500 hover:bg-red-600 h-14 rounded-2xl font-bold">
            <ArrowDownCircle className="mr-2" /> Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};
