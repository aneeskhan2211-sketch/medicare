import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { login } = useStore();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    login(email, isSignup ? name : 'John Doe');
    toast.success(isSignup ? 'Account created!' : 'Welcome back!');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Password reset link sent to your email!');
    setShowReset(false);
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-60" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-2">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Reset Password</h1>
            <p className="text-slate-500 text-sm">Enter your email to receive a reset link</p>
          </div>

          <Card className="border-none card-shadow rounded-[32px] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="email"
                      placeholder="john@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 font-bold text-lg shadow-lg shadow-indigo-100">
                  Send Link
                </Button>
              </form>
              <button 
                onClick={() => setShowReset(false)}
                className="w-full text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Back to Login
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mb-32 blur-3xl opacity-60" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-2">
            <Pill size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">MediMind</h1>
          <p className="text-slate-500">Your personal health companion</p>
        </div>

        <Card className="border-none card-shadow rounded-[32px] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex p-1 bg-slate-50 rounded-2xl">
              <button 
                onClick={() => setIsSignup(false)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isSignup ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsSignup(true)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isSignup ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {!isSignup && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 font-bold text-lg shadow-lg shadow-indigo-100 group">
                {isSignup ? 'Create Account' : 'Sign In'}
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => login('guest@example.com', 'Guest User')}
              className="w-full h-14 rounded-2xl border-slate-100 font-bold text-slate-600"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 font-medium">
          By continuing, you agree to our <span className="text-indigo-600 underline">Terms of Service</span> and <span className="text-indigo-600 underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
};
