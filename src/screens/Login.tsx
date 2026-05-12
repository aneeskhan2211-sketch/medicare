import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

const AppleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);
import { 
  signInWithPopup, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, appleProvider } from '../lib/firebase';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export const Login: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('phone');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'apple') => {
    let provider;
    switch(providerName) {
      case 'google': provider = googleProvider; break;
      case 'facebook': provider = facebookProvider; break;
      case 'apple': provider = appleProvider; break;
    }

    try {
      // Trigger popup BEFORE setting loading state to preserve user gesture context
      const authPromise = signInWithPopup(auth, provider);
      setLoading(true);
      await authPromise;
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Social Login Error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup blocked! Please allow popups for this site in your browser settings, or try opening the app in a new tab.', {
          duration: 6000,
        });
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need for error message
      } else {
        toast.error(error.message || 'Social login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setupRecaptcha();
    const verifier = (window as any).recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, '+' + phone, verifier);
      setConfirmationResult(result);
      setCooldown(60);
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    setLoading(true);
    try {
      await confirmationResult?.confirm(otp);
      toast.success('Verified successfully!');
    } catch (error: any) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast.success('Continue as guest');
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        toast.error('Guest access is not enabled. Please enable Anonymous Auth in Firebase Console.');
      } else {
        toast.error(error.message || 'Failed to sign in as guest');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset link sent!');
      setShowReset(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-[#FDFEFE] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#4F46E515,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <Lock size={36} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recover Account</h1>
              <p className="text-slate-500 text-sm font-medium">Reset your password via email</p>
            </div>
          </div>

          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[40px] overflow-hidden bg-white">
            <CardContent className="p-10 space-y-8">
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <Input 
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all text-slate-900 text-lg font-medium"
                    />
                  </div>
                </div>
                <Button 
                  loading={loading}
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Send Reset Link
                </Button>
              </form>
              <button 
                onClick={() => setShowReset(false)}
                className="w-full text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                Back to Sign in
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div id="recaptcha-container"></div>
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[120px] opacity-60" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-50 rounded-full blur-[120px] opacity-60" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 cursor-pointer"
          >
            <Pill size={40} strokeWidth={2.5} />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">MediPulse</h1>
            <p className="text-slate-400 font-bold tracking-tight text-sm uppercase">Health Intelligence System</p>
          </div>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-8 space-y-6">
            
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
              <button 
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'phone' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Phone
              </button>
              <button 
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Email
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loginMethod === 'phone' && (
                <motion.div 
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {!confirmationResult ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Phone Number</label>
                          <PhoneInput
                            country={'us'}
                            value={phone}
                            onChange={v => setPhone(v)}
                            containerClass="!w-full h-16"
                            inputClass="!w-full !h-16 !rounded-2xl !border-slate-100 !bg-slate-50/50 !text-lg !text-slate-900 !font-medium !pl-16 shadow-none focus:!ring-4 focus:!ring-indigo-50"
                            buttonClass="!bg-transparent !border-none !pl-4"
                            dropdownClass="!text-slate-900"
                          />
                        </div>
                        <Button 
                          onClick={handleSendOtp}
                          loading={loading}
                          disabled={cooldown > 0}
                          className="w-full h-16 rounded-2xl bg-indigo-600 font-black text-lg shadow-xl shadow-indigo-200"
                        >
                          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send OTP'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Verification Code</label>
                          <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600" size={20} />
                            <Input 
                              maxLength={6}
                              placeholder="000000"
                              value={otp}
                              onChange={e => setOtp(e.target.value)}
                              className="pl-12 h-16 rounded-2xl border-slate-100 bg-slate-50/50 text-center text-3xl font-black tracking-[10px] focus:bg-white"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleVerifyOtp}
                          loading={loading}
                          disabled={otp.length < 6}
                          className="w-full h-16 rounded-2xl bg-indigo-600 font-black text-lg shadow-xl shadow-indigo-200"
                        >
                          Verify & Continue
                        </Button>
                        <button 
                          onClick={() => setConfirmationResult(null)}
                          className="w-full text-xs font-bold text-slate-400 text-center hover:text-indigo-600"
                        >
                          Change Phone Number
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {loginMethod === 'email' && (
                <motion.div 
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="flex p-1 bg-indigo-50/50 rounded-xl mb-4">
                    <button 
                      onClick={() => setIsSignup(false)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isSignup ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-600/60 hover:text-indigo-600'}`}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setIsSignup(true)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isSignup ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-600/60 hover:text-indigo-600'}`}
                    >
                      New Account
                    </button>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {isSignup && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <Input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                            className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input 
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Password</label>
                        {!isSignup && (
                          <button type="button" onClick={() => setShowReset(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input 
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      loading={loading}
                      className="w-full h-14 rounded-2xl bg-indigo-600 font-black text-lg shadow-xl shadow-indigo-100"
                    >
                      {isSignup ? 'Create Account' : 'Sign In'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative my-6 block">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-white px-4 text-slate-300">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                loading={loading}
                onClick={() => handleSocialLogin('google')}
                className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center p-0"
              >
                <div className="scale-[1.2]"><GoogleLogo /></div>
              </Button>
              <Button 
                variant="outline" 
                loading={loading}
                onClick={() => handleSocialLogin('facebook')}
                className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center p-0"
              >
                <div className="scale-[1.2]"><FacebookLogo /></div>
              </Button>
              <Button 
                variant="outline" 
                loading={loading}
                onClick={() => handleSocialLogin('apple')}
                className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center p-0"
              >
                <div className="scale-[1.2]"><AppleLogo /></div>
              </Button>
            </div>

            <Button 
              variant="outline" 
              loading={loading}
              onClick={handleGuestLogin}
              className="w-full h-14 rounded-2xl border-slate-100 font-black text-slate-400 hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase tracking-[2px]"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
          Secure, Encrypted & Medical Grade Auth<br/>
          By joining you agree to <span className="text-indigo-600 underline">T&C</span> and <span className="text-indigo-600 underline">Policies</span>.
        </p>
      </motion.div>
    </div>
  );
};
