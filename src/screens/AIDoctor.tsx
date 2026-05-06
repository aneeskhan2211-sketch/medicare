import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getChatResponse } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

interface AIDoctorProps {
  onClose: () => void;
}

export const AIDoctor: React.FC<AIDoctorProps> = ({ onClose }) => {
  const { medicines, reminders, profiles, activeProfileId } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Hello${activeProfile ? ' ' + activeProfile.name : ''}, I am your AI Health Assistant. I have access to your medication schedule and health history. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Use a small delay to ensure content has rendered and height is calculated
    const timer = setTimeout(scrollToBottom, 100);
    
    // Also scroll immediately for better perceived performance
    scrollToBottom();

    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const handleSend = async (customMessage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getChatResponse(messages, userMessage, { 
        medicines: medicines, 
        reminders: reminders,
        profile: activeProfile,
        lifestyle: activeProfile?.lifestyle
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to get response from AI');
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-10 transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/10">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">AI Doctor Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.1em]">Active & Verified</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={24} />
        </Button>
      </header>

      <div className="bg-amber-100 dark:bg-amber-900/20 text-black dark:text-amber-300 text-[10px] px-6 py-2.5 text-center font-bold border-b border-amber-200 dark:border-amber-800/40 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          <Info size={14} className="shrink-0 text-amber-800 dark:text-amber-400" />
          <p>Disclaimer: This AI is for informational purposes only. In case of emergency, call 911 or your local help line.</p>
        </div>
      </div>

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
                  className="p-4 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all shadow-sm"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{s}</p>
                  <p className="text-[9px] text-muted-foreground mt-1 font-medium">Click to ask</p>
                </motion.button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i} 
              className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0 mb-1">
                  <Sparkles size={16} />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-4 rounded-[24px] text-sm shadow-sm transition-colors relative leading-relaxed whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-slate-900 dark:bg-emerald-600 text-white rounded-br-none" 
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
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0 mb-1">
                <Sparkles size={16} />
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] rounded-bl-none text-sm border border-slate-100 dark:border-slate-800 text-muted-foreground shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors pb-10">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-[28px] border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
          <input
            value={input || ''}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
            placeholder="Type your health concern..."
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={isTyping || !input.trim()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 w-12 p-0 shadow-lg shadow-emerald-200 dark:shadow-none shrink-0"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
