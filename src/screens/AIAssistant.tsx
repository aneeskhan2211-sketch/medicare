import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Mic, Sparkles, X, Trash2, Info, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getChatResponse, extractMedicineInfo } from '../services/aiService';
import { Medicine } from '../types';

interface AIAssistantProps {
  onClose: () => void;
  contextMedicine?: Medicine | null;
  onScanComplete?: (meds: any[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, contextMedicine, onScanComplete }) => {
  const { chatHistory, addChatMessage, clearChat, medicines, reminders, incrementAiQuery, spendCoins, user, addMedicine, activeProfileId } = useStore();

  const handleSchedule = (medData: any) => {
    const newMed: Medicine = {
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      name: medData.name,
      dosage: medData.dosage || '1 unit',
      type: 'pill', // Default
      frequency: medData.frequency || 'Daily',
      times: medData.times || ['08:00'],
      stock: medData.stock || 30, // Use if available
      totalStock: medData.stock || 30,
      startDate: new Date().toISOString().split('T')[0],
      instructions: medData.instructions || 'Take as directed',
      mealInstruction: 'after',
      reminderTone: 'standard',
      snoozeEnabled: true,
      snoozeInterval: 10,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      userId: user?.id || 'unknown',
    };
    
    addMedicine(newMed);
    toast.success(`${newMed.name} added to your schedule!`);
  };

  const renderMessageContent = (content: string) => {
    const schedulerMatch = content.match(/\[SCHEDULER\](.*?)\[\/SCHEDULER\]/s);
    if (!schedulerMatch) {
      return content.split('\n').map((line, i) => <p key={i} className={cn(i > 0 && "mt-2")}>{line}</p>);
    }

    const mainContent = content.replace(schedulerMatch[0], '');
    const medData = JSON.parse(schedulerMatch[1]);

    return (
      <>
        {mainContent.split('\n').map((line, i) => <p key={i} className={cn(i > 0 && "mt-2")}>{line}</p>)}
        <Button 
          onClick={() => handleSchedule(medData)}
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl"
        >
          Schedule {medData.name}
        </Button>
      </>
    );
  };
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      toast.info('Listening...', { duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      toast.success('Processed speech!');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error('Speech recognition failed');
    };

    recognition.start();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsTyping(true);
    addChatMessage({ role: 'user', content: `[Scanned ${file.name}]` });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const meds = await extractMedicineInfo(base64, file.type);
        
        if (meds.length === 0) {
          addChatMessage({ role: 'assistant', content: "I'm sorry, I couldn't find any medications in that image. Could you try a clearer photo?" });
        } else if (meds.length === 1) {
          const info = meds[0];
          const avgConfidence = info.confidence ? 
            Object.values(info.confidence).filter(v => typeof v === 'number').reduce((a: any, b: any) => a + b, 0) / 
            Object.values(info.confidence).filter(v => typeof v === 'number').length : 0;
            
          const response = `I've scanned the label! Here's what I found:
        
**Medicine:** ${info.name}
**Dosage:** ${info.dosage}
**Type:** ${info.type}
**Frequency:** ${info.frequency}
${info.stock ? `**Initial Stock:** ${info.stock}\n` : ''}${info.expiryDate ? `**Expiry Date:** ${info.expiryDate}\n` : ''}**Instructions:** ${info.instructions}

*Scan Confidence: ${Math.round(avgConfidence * 100)}%*

Would you like me to add this to your medications?`;
          addChatMessage({ role: 'assistant', content: response });
        } else {
          const response = `I've found ${meds.length} medications in your prescription!
          
${meds.map((m, i) => `${i + 1}. **${m.name}** (${m.dosage}) - ${m.frequency}`).join('\n')}

I can help you add all of these to your schedule at once. Would you like to review them?`;
          addChatMessage({ role: 'assistant', content: response });
          
          if (onScanComplete) {
            setTimeout(() => {
              onScanComplete(meds);
            }, 2000);
          }
        }
        setIsScanning(false);
        setIsTyping(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('Failed to scan label');
      addChatMessage({ role: 'assistant', content: "I'm sorry, I couldn't read that label clearly. Could you try taking a clearer photo?" });
      setIsScanning(false);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = async (force: boolean = false) => {
    if (!input.trim() && !force) return;
    if (isTyping) return;

    const userMessage = input.trim();
    
    if (!force) {
      const success = incrementAiQuery();
      if (!success) {
        toast.error('Daily AI Limit Reached', {
          description: 'Spend 5 coins for an extra query?',
          action: {
            label: 'Spend 5 Coins',
            onClick: () => {
              if (spendCoins(5)) {
                setInput(userMessage);
                handleSend(true);
              } else {
                toast.error('Not enough coins!');
              }
            }
          }
        });
        return;
      }
    }

    addChatMessage({ role: 'user', content: userMessage });
    setInput('');
    setIsTyping(true);

    try {
      const response = await getChatResponse(chatHistory, userMessage, { 
        medicines, 
        reminders,
        currentMedicine: contextMedicine?.name 
      });
      addChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      console.error(error);
      toast.error('Failed to get response from AI');
      addChatMessage({ role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." });
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Remind me to take Paracetamol",
    "I missed my morning dose",
    "How to stay consistent?",
    "Check my stock levels"
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 bg-card border-b border-border flex justify-between items-center z-10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground">Medicare AI</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearChat} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={20} />
          </button>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 w-full touch-pan-y min-h-0" ref={scrollRef} style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="space-y-6 pb-4">
          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-colors",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-card text-foreground rounded-tl-none border border-border"
              )}>
                {renderMessageContent(msg.content)}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-card p-4 rounded-3xl rounded-tl-none border border-border shadow-sm flex gap-1 transition-colors">
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border space-y-4 safe-bottom transition-colors">
        {/* Suggestions */}
        {chatHistory.length < 3 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); handleSend(); }}
                className="whitespace-nowrap bg-muted text-muted-foreground text-xs font-medium px-4 py-2 rounded-full border border-border hover:bg-primary/5 hover:border-primary/20 transition-all font-bold"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanning || isTyping}
              className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all border border-border disabled:opacity-50"
              title="Camera"
            >
              <Camera size={18} />
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            
            <button 
              onClick={() => galleryInputRef.current?.click()}
              disabled={isScanning || isTyping}
              className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all border border-border disabled:opacity-50"
              title="Gallery"
            >
              <Upload size={18} />
            </button>
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="w-full bg-muted border-none rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
            />
            <button 
                onClick={startSpeechRecognition}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                title="Voice Input"
            >
              <Mic size={20} />
            </button>
          </div>
          <Button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-2xl p-0 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
