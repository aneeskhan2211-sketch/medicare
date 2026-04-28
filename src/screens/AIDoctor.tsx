import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getChatResponse } from '../services/aiService';

interface AIDoctorProps {
  onClose: () => void;
}

export const AIDoctor: React.FC<AIDoctorProps> = ({ onClose }) => {
  const { medicines, reminders } = useStore();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello, I am your AI Health Assistant. I can provide general medical information and help with symptoms. Please describe what you are feeling." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getChatResponse(messages, userMessage, { 
        medicines: medicines, 
        reminders: reminders 
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
    <div className="h-full flex flex-col bg-slate-50">
      <header className="p-4 bg-white border-b border-slate-100 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">AI Doctor Assistant</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Health Consultant</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </header>

      <div className="bg-amber-50 text-amber-800 text-[10px] p-2 text-center font-bold">
        <Info size={12} className="inline mr-1" />
        DISCLAIMER: AI medical advice is NOT a substitute for professional healthcare. Consult a doctor.
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm",
                msg.role === 'user' ? "bg-emerald-600 text-white" : "bg-white border border-slate-100"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl text-sm border border-slate-100">Thinking...</div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-100 p-3 rounded-xl outline-none text-sm"
            placeholder="Describe your symptoms..."
          />
          <Button onClick={handleSend} disabled={isTyping} className="bg-emerald-600 rounded-xl">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
