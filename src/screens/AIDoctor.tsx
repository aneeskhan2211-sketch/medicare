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
    <div className="h-full flex flex-col bg-background">
      <header className="p-4 bg-card border-b border-border flex justify-between items-center z-10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-foreground">AI Doctor Assistant</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Health Consultant</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={24} />
        </button>
      </header>

      <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] p-2 text-center font-bold border-b border-amber-500/20">
        <Info size={12} className="inline mr-1" />
        DISCLAIMER: AI medical advice is NOT a substitute for professional healthcare. Consult a doctor.
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm transition-colors",
                msg.role === 'user' ? "bg-emerald-600 text-white rounded-tr-none" : "bg-card text-foreground rounded-tl-none border border-border"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card p-3 rounded-2xl rounded-tl-none text-sm border border-border text-muted-foreground animate-pulse transition-colors">Thinking...</div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-card border-t border-border transition-colors">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-muted p-3 rounded-xl outline-none text-sm text-foreground focus:ring-2 focus:ring-emerald-500/50 transition-all"
            placeholder="Describe your symptoms..."
          />
          <Button onClick={handleSend} disabled={isTyping} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 w-11 p-0">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
