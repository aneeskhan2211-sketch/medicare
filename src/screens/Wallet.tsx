import React from 'react';
import { Coins, X, IndianRupee } from 'lucide-react';
import { MediCoinWallet } from '../components/MediCoinWallet';

interface WalletProps {
  onClose?: () => void;
}

export const Wallet: React.FC<WalletProps> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-200/20">
            <Coins size={24} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">MediCoin Wallet</h1>
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Rewards & Staking</p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center text-[10px] text-slate-400 font-black">
                <IndianRupee size={8} className="mr-0.5" /> INR
              </div>
            </div>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-slate-500 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 no-scrollbar">
        <div className="max-w-md mx-auto">
          <MediCoinWallet />
        </div>
      </div>
    </div>
  );
};
