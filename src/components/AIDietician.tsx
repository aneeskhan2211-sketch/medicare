import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, X, Info, Utensils, Camera, Upload, ChevronRight, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getChatResponse } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { VoiceInputDialog } from '../components/VoiceInputDialog';

interface AIDieticianProps {
  onClose: () => void;
}

export const AIDietician: React.FC<AIDieticianProps> = ({ onClose }) => {
  const { profiles, activeProfileId, medicines, reminders } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Hello${activeProfile ? ' ' + activeProfile.name : ''}, I am your AI Dietician. How can I help you with your diet and nutrition goals today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Weight loss diet plan",
    "High protein meal ideas",
    "Healthy snacks",
    "Low carb dinner options",
    "Review my eating habits"
  ];

  useEffect(() => {
    const scrollToBottom = () => {
      const container = document.getElementById('diet-chat-messages-container');
      if (!container) return;
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const handleSend = async (customMessage?: string, explicitLanguage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage) return;

    const newUserMessages: { role: 'user' | 'assistant', content: string }[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: "" }]);
    if (!customMessage) setInput('');
    setIsTyping(true);

    try {
      const langContext = explicitLanguage && explicitLanguage !== 'Auto Detect' ? explicitLanguage.split(' ')[0] : (selectedLanguage === 'English' ? undefined : selectedLanguage.split(' ')[0]);

      // Using the same service but explicitly stating the system role
      const dPrompt = `Act as an expert AI Senior Dietician. Provide clinical-grade nutritional guidance based on Medical Nutrition Therapy (MNT) principles. Use health context: Conditions: ${activeProfile?.conditions?.join(', ') || 'None'}. Query: ${userMessage}. Highlight actionable advice with <mark> tags.`;
      const response = await getChatResponse(newUserMessages, dPrompt, { 
        profile: activeProfile,
        lifestyle: activeProfile?.lifestyle,
        language: langContext,
        medicines,
        reminders
      });
      
      let i = 0;
      const speed = 20; 
      
      const typeInterval = setInterval(() => {
        if (i < response.length) {
          const char = response.charAt(i);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              return [
                ...newMessages.slice(0, -1),
                { ...lastMsg, content: lastMsg.content + char }
              ];
            }
            return newMessages;
          });
          i++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, speed);
      
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => prev.slice(0, -1).concat({ role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now." }));
      toast.error('Failed to get response from AI');
    }
  };

  const getPlaceholder = () => "Ask about diet, nutrition, weight loss...";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
      <style>{`
        mark {
          background-color: #fef08a; /* yellow-200 */
          color: black;
          padding: 0.1em 0.2em;
          border-radius: 0.2em;
        }
        .dark mark {
          background-color: #ca8a04; /* yellow-600 */
          color: white;
        }
      `}</style>
      <header className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/10">
            <Utensils size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">AI Dietician</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.1em]">Expert Nutritionist</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={24} />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0" id="diet-chat-messages-container">
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
                </motion.button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            (msg.role === 'assistant' && msg.content === '') ? null : (
            <div key={i} className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0 mb-1">
                  <Utensils size={16} />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-4 rounded-[24px] text-sm shadow-sm transition-colors leading-relaxed whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-slate-900 dark:bg-emerald-600 text-white rounded-br-none" 
                  : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-800"
              )}>
                {msg.role === 'assistant' ? (
                  <div className="markdown-body prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
            )
          ))}
          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0 mb-1">
                <Utensils size={16} />
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] rounded-bl-none text-sm border border-slate-100 dark:border-slate-800 text-muted-foreground shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-10 space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-[28px] border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
          <input
            value={input || ''}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 w-full bg-transparent px-4 py-2 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
            placeholder={getPlaceholder()}
          />
          <button 
            onClick={() => setShowVoiceInput(true)}
            className="transition-colors text-slate-400 hover:text-emerald-600"
            title="Voice Input"
          >
            <Mic size={20} />
          </button>
          <Button 
            onClick={() => handleSend()} 
            disabled={isTyping || !input.trim()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-10 w-10 p-0 shadow-lg shadow-emerald-200 dark:shadow-none shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
      <VoiceInputDialog 
        open={showVoiceInput} 
        onOpenChange={setShowVoiceInput} 
        onSend={(text, lang) => handleSend(text, lang)} 
      />
    </div>
  );
};
