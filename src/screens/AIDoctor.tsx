import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, X, Info, Stethoscope, Camera, Upload, ChevronRight, Mic, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getChatResponse } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { LabAnalyzer } from '../components/LabAnalyzer';
import { VoiceInputDialog } from '../components/VoiceInputDialog';

interface AIDoctorProps {
  onClose: () => void;
}

import { AppointmentBooking } from './AppointmentBooking';

export const AIDoctor: React.FC<AIDoctorProps> = ({ onClose }) => {
  const { medicines, reminders, profiles, activeProfileId, settings } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Hello${activeProfile ? ' ' + activeProfile.name : ''}, I am your AI Health Assistant. I have access to your medication schedule and health history. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  // Map settings language to display name if needed, or just use as is
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language || 'English');
  const [showLabAnalyzer, setShowLabAnalyzer] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync internal state with settings if settings change
  useEffect(() => {
    if (settings.language) {
      setSelectedLanguage(settings.language);
    }
  }, [settings.language]);

  const suggestions = [
    "Check my symptoms",
    "Explain side effects",
    "Check interactions",
    "Missed dose advice",
    "Healthy lifestyle tips",
    "Morning routine advice"
  ];

  useEffect(() => {
    const scrollToBottom = () => {
      const container = document.getElementById('chat-messages-container');
      if (!container) return;
      
      // If we are just showing the typing indicator, use default smooth scroll
      if (isTyping) {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        return;
      }
      
      // For long AI responses, scroll slowly so user can read along
      const start = container.scrollTop;
      const end = container.scrollHeight - container.clientHeight;
      if (start >= end) return;
      
      const change = end - start;
      // Calculate duration based on distance so it reads like a teleprompter
      // At least 3 seconds, max 15 seconds for very long messages
      const duration = Math.min(Math.max(change * 15, 3000), 15000); 
      
      let startTime: number | null = null;
      
      const animateScroll = (time: number) => {
        if (!startTime) startTime = time;
        const progress = time - startTime;
        let percent = progress / duration;
        if (percent > 1) percent = 1;
        
        // Linear scroll until the very end, then ease out
        const ease = percent < 0.8 ? percent * 1.1 : 1 - Math.pow(1 - percent, 3);
        const finalPercent = Math.min(ease, 1);
        
        container.scrollTop = start + change * finalPercent;
        
        if (progress < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    };

    // Use a small delay to ensure content has rendered and height is calculated
    const timer = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'user', content: `[Scanned photo: ${file.name}]` }]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await getChatResponse(messages, 'Please analyze this medical image / prescription and provide your expert assessment and immediate advice.', { 
          medicines: medicines, 
          reminders: reminders,
          profile: activeProfile,
          lifestyle: activeProfile?.lifestyle,
          language: selectedLanguage === 'English' ? undefined : selectedLanguage,
          image: { base64, mimeType: file.type }
        });
        
        setIsScanning(false);
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze image');
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't read that clearly. Could you try taking a clearer photo?" }]);
      setIsScanning(false);
      setIsTyping(false);
    }
  };

  const handleSend = async (customMessage?: string, explicitLanguage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    if (!customMessage) setInput('');
    setIsTyping(true);

    try {
      const langContext = explicitLanguage && explicitLanguage !== 'Auto Detect' ? explicitLanguage.split(' ')[0] : (selectedLanguage === 'English' ? undefined : selectedLanguage.split(' ')[0]);

      const response = await getChatResponse(messages, userMessage, { 
        medicines: medicines, 
        reminders: reminders,
        profile: activeProfile,
        lifestyle: activeProfile?.lifestyle,
        language: langContext
      });

      // Check for appointment booking tag
      if (response.includes('[SCHEDULE_APPOINTMENT:') || response.includes('[BOOK_CONSULTATION:')) {
        let doctorName = 'Dr. Arpan';
        const jsonMatch = response.match(/\[SCHEDULE_APPOINTMENT:\s*({.*?})\]/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            doctorName = data.doctor || doctorName;
          } catch(e) {}
        } else {
          const simpleMatch = response.match(/\[BOOK_CONSULTATION:\s*(.*?)\]/);
          if (simpleMatch && simpleMatch[1]) doctorName = simpleMatch[1];
        }
        
        setBookingDoctor(doctorName);
        // Clean up the response tag from UI
        const cleanedResponse = response.replace(/\[SCHEDULE_APPOINTMENT:.*?\]/g, '').replace(/\[BOOK_CONSULTATION:.*?\]/g, '').trim();
        setMessages(prev => [...prev, { role: 'assistant', content: cleanedResponse }]);
        
        setTimeout(() => setShowBooking(true), 1500);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to get response from AI');
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const placeholders: Record<string, Record<string, string>> = {
    'English': { recording: "Listening...", idle: "Ask anything..." },
    'Hindi (हिंदी)': { recording: "सुन रहा हूँ...", idle: "मुझसे कुछ भी पूछें..." },
    'Tamil (தமிழ்)': { recording: "கேட்கிறது...", idle: "என்னிடம் ஏதேனும் கேளுங்கள்..." },
    'Telugu (తెలుగు)': { recording: "వింటోంది...", idle: "నన్ను ఏదైనా అడగండి..." },
    'Bengali (বাংলা)': { recording: "শুনছি...", idle: "আমাকে কিছু জিজ্ঞাসা করুন..." },
    'Marathi (मराठी)': { recording: "ऐकत आहे...", idle: "मला काहीही विचारा..." },
    'Gujarati (ગુજરાતી)': { recording: "સાંભળી રહ્યો છું...", idle: "મને કંઈપણ પૂછો..." },
    'Arabic (العربية)': { recording: "استماع...", idle: "اسألني أي شيء..." },
    'Urdu (اردو)': { recording: "سن رہا ہے...", idle: "مجھ سے کچھ भी पूछیں..." },
    'Punjabi (ਪੰਜਾਬી)': { recording: "ਸੁਣ ਰਿਹਾ ਹੈ...", idle: "ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ..." }
  };

  const getPlaceholder = () => {
    const langPlaceholders = placeholders[selectedLanguage] || placeholders['English'];
    return langPlaceholders.idle;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-10 transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/10">
            <Stethoscope size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">AI Doctor Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.1em]">Active & Verified</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={24} />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0" id="chat-messages-container">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {suggestions.map((s, i) => (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  key={s}
                  onClick={() => handleSend(s)}
                  className="p-4 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all shadow-sm"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{s}</p>
                  <p className="text-[9px] text-muted-foreground mt-1 font-medium">Click to ask</p>
                </motion.button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              key={i} 
              className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0 mb-1">
                  <Stethoscope size={16} />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-4 rounded-[24px] text-sm shadow-sm transition-colors relative leading-relaxed whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-slate-900 dark:bg-blue-600 text-white rounded-br-none" 
                  : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-800"
              )}>
                {msg.role === 'assistant' ? (
                  <div className="markdown-body prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-ol:list-decimal prose-ul:list-disc">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0 mb-1">
                <Stethoscope size={16} />
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] rounded-bl-none text-sm border border-slate-100 dark:border-slate-800 text-muted-foreground shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors pb-safe">
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanning || isTyping}
              className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all disabled:opacity-50"
              title="Camera"
            >
              <Camera size={18} />
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture className="hidden" onChange={handleFileSelect} />
            
            <button 
              onClick={() => galleryInputRef.current?.click()}
              disabled={isScanning || isTyping}
              className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all disabled:opacity-50"
              title="Gallery"
            >
              <Upload size={18} />
            </button>
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

            <button 
              onClick={() => setShowLabAnalyzer(true)}
              disabled={isScanning || isTyping}
              className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all disabled:opacity-50"
              title="Analyze Lab Report"
            >
              <FileText size={18} />
            </button>

            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
              <input
                value={input || ''}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 w-full bg-transparent py-2.5 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                placeholder={getPlaceholder()}
              />
              <button 
                onClick={() => setShowVoiceInput(true)}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Voice Input"
              >
                <Mic size={18} />
              </button>
              <Button 
                onClick={() => handleSend()} 
                loading={isTyping}
                disabled={!input.trim()} 
                variant="ghost"
                className="hover:bg-transparent text-blue-600 p-2 h-auto"
              >
                <Send size={18} className={input.trim() ? "text-blue-600" : "text-slate-300 dark:text-slate-600"} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showLabAnalyzer && <LabAnalyzer onClose={() => setShowLabAnalyzer(false)} />}
      
      <VoiceInputDialog 
         open={showVoiceInput} 
         onOpenChange={setShowVoiceInput} 
         onSend={(text, lang) => handleSend(text, lang)} 
       />
       
      {showBooking && (
        <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-bottom duration-500">
          <AppointmentBooking 
            initialDoctor={bookingDoctor}
            onClose={() => setShowBooking(false)} 
          />
        </div>
      )}
    </div>
  );
};
