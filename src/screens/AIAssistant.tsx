import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Mic, Sparkles, X, Trash2, Info, Camera, Upload, MapPin, Clock, Plus, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getChatResponse, extractMedicineInfo } from '../services/aiService';
import { Medicine, Appointment } from '../types';
import ReactMarkdown from 'react-markdown';
import { VoiceInputDialog } from '../components/VoiceInputDialog';
import { VoiceSettings } from '../components/VoiceSettings';

interface AIAssistantProps {
  onClose: () => void;
  contextMedicine?: Medicine | null;
  onScanComplete?: (meds: any[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, contextMedicine, onScanComplete }) => {
  const { chatHistory, addChatMessage, clearChat, medicines, reminders, incrementAiQuery, spendCoins, user, addMedicine, activeProfileId, addAppointment, vitals, profiles } = useStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const handleBookAppointment = (aptData: any) => {
    const newApt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      profileId: activeProfileId,
      doctorName: aptData.doctor,
      specialty: aptData.specialty,
      date: aptData.date,
      time: aptData.time,
      status: 'upcoming',
      location: 'Medical Center, AI Tower'
    };
    
    addAppointment(newApt);
    toast.success(`Appointment confirmed with ${newApt.doctorName} on ${newApt.date} at ${newApt.time}`);
  };

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
    const medMatch = content.match(/\[SCHEDULER\](.*?)\[\/SCHEDULER\]/s);
    const aptMatch = content.match(/\[SCHEDULE_APPOINTMENT:\s*({.*?})\]/s);

    let displayContent = content;
    let extraUI = null;

    if (medMatch) {
      displayContent = content.replace(medMatch[0], '');
      try {
        const medData = JSON.parse(medMatch[1]);
        extraUI = (
          <Button 
            onClick={() => handleSchedule(medData)}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl"
          >
            Schedule {medData.name}
          </Button>
        );
      } catch (e) {
        console.error("Failed to parse med data", e);
      }
    } else if (aptMatch) {
      displayContent = content.replace(aptMatch[0], '');
      try {
        const aptData = JSON.parse(aptMatch[1]);
        extraUI = (
          <Button 
            onClick={() => handleBookAppointment(aptData)}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            <Sparkles size={16} />
            Confirm Appointment: {aptData.time}
          </Button>
        );
      } catch (e) {
        console.error("Failed to parse appointment data", e);
      }
    }

    return (
      <>
        <div className="markdown-content text-current space-y-3 font-medium [&>p]:leading-relaxed [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:pl-5 [&>ol]:pl-5 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>h4]:font-bold [&>strong]:font-bold [&>strong]:text-current">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
        {extraUI}
      </>
    );
  };
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [locationName, setLocationName] = useState<string | null>('Mumbai');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const defaultSuggestions: Record<string, string[]> = {
      'English': [
        "Check my schedule",
        "I missed a dose",
        "How to stay consistent?",
        "Symptoms check"
      ],
      'Hindi (हिंदी)': [
        "मेरा शेड्यूल जांचें",
        "मुझसे एक खुराक छूट गई",
        "नियमित कैसे रहें?",
        "लक्षणों की जांच"
      ],
      'Tamil (தமிழ்)': [
        "என் அட்டவணையை சரிபார்க்கவும்",
        "நான் ஒரு மருந்தை தவறவிட்டேன்",
        "நிலையானதாக இருப்பது எப்படி?",
        "அறிகுறிகள் சரிபார்ப்பு"
      ],
      'Telugu (తెలుగు)': [
        "నా షెడ్యూల్ తనిఖీ చేయండి",
        "నేను మోతాదును కోల్పోయాను",
        "స్థిరంగా ఉండటం ఎలా?",
        "లక్షణాల తనిఖీ"
      ],
      'Bengali (বাংলা)': [
        "আমার সময়সূচী পরীক্ষা করুন",
        "আমি একটি ডোজ মিস করেছি",
        "কীভাবে ধারাবাহিক থাকবেন?",
        "লক্ষণগুলি পরীক্ষা করুন"
      ],
      'Marathi (मराठी)': [
        "माझे वेळापत्रक तपासा",
        "माझा डोस चुकला",
        "सातत्य कसे ठेवावे?",
        "लक्षणे तपासा"
      ],
      'Gujarati (ગુજરાતી)': [
        "મારું શેડ્યૂલ તપાસો",
        "હું એક ડોઝ ચૂકી ગયો",
        "સુસંગત કેવી રીતે રહેવું?",
        "લક્ષણો તપાસો"
      ],
      'Arabic (العربية)': [
        "تحقق من جدولي",
        "لقد فوتت جرعة",
        "كيف أبقى ملتزماً؟",
        "التحقق من الأعراض"
      ],
      'Urdu (اردو)': [
        "میرا شیڈول چیک کریں",
        "میں نے ایک خوراک چھوڑ دی",
        "مستقل مزاج کیسے رہیں؟",
        "علامات کی جانچ"
      ],
      'Punjabi (ਪੰਜਾਬી)': [
        "ਮੇਰਾ ਸ਼ਡਿਊਲ ਚੈੱਕ ਕਰੋ",
        "ਮੈਂ ਇੱਕ ਖੁਰਾਕ ਭੁੱਲ ਗਿਆ",
        "ਲਗਾਤਾਰ ਕਿਵੇਂ ਰਹਿਣਾ ਹੈ?",
        "ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ"
      ]
    };

    if (contextMedicine) {
      if (selectedLanguage === 'Hindi (हिंदी)') {
        setSuggestions([
          `${contextMedicine.name} के दुष्प्रभाव?`,
          `क्या मैं ${contextMedicine.name} को खाने के साथ ले सकता हूँ?`,
          `अगर मैं ${contextMedicine.name} की एक खुराक भूल जाऊं तो क्या होगा?`,
          `${contextMedicine.name} के इंटरेक्शन`
        ]);
      } else if (selectedLanguage === 'Tamil (தமிழ்)') {
         setSuggestions([
            `${contextMedicine.name} பக்க விளைவுகள்?`,
            `நான் உணவுடன் ${contextMedicine.name} எடுக்கலாமா?`,
            `${contextMedicine.name} ஒரு டோஸைத் தவறவிட்டால் என்ன செய்வது?`,
            `${contextMedicine.name} இன் தொடர்புகள்`
        ]);
      } else if (selectedLanguage === 'Telugu (తెలుగు)') {
         setSuggestions([
            `${contextMedicine.name} దుష్ప్రభావాలు?`,
            `నేను ఆహారంతో ${contextMedicine.name} తీసుకోవచ్చా?`,
            `${contextMedicine.name} ఒక మోతాదును కోల్పోతే ఏమి జరుగుతుంది?`,
            `${contextMedicine.name} పరస్పర చర్యలు`
        ]);
      } else if (selectedLanguage === 'Bengali (বাংলা)') {
         setSuggestions([
            `${contextMedicine.name} এর পার্শ্বপ্রতিক্রিয়া?`,
            `আমি কি খাবারের সাথে ${contextMedicine.name} নিতে পারি?`,
            `আমি যদি ${contextMedicine.name} এর একটি ডোজ মিস করি তবে কী হবে?`,
            `${contextMedicine.name} মিথস্ক্রিয়া`
        ]);
      } else if (selectedLanguage === 'Marathi (मराठी)') {
         setSuggestions([
            `${contextMedicine.name} चे दुष्परिणाम?`,
            `मी अन्नासोबत ${contextMedicine.name} घेऊ शकतो का?`,
            `मी ${contextMedicine.name} चा डोस चुकल्यास काय होईल?`,
            `${contextMedicine.name} परस्परसंवाद`
        ]);
      } else if (selectedLanguage === 'Gujarati (ગુજરાતી)') {
         setSuggestions([
             `${contextMedicine.name} ની આડઅસરો?`,
             `શું હું ખોરાક સાથે ${contextMedicine.name} લઈ શકું?`,
             `જો હું ${contextMedicine.name} નો ડોઝ ચૂકી જાઉં તો શું?`,
             `${contextMedicine.name} ની ક્રિયાપ્રતિક્રિયાઓ`
         ]);
      } else if (selectedLanguage === 'Arabic (العربية)') {
         setSuggestions([
             `الآثار الجانبية لـ ${contextMedicine.name}؟`,
             `هل يمكنني تناول ${contextMedicine.name} مع الطعام؟`,
             `ماذا لو فوتت جرعة من ${contextMedicine.name}؟`,
             `تفاعلات ${contextMedicine.name}`
         ]);
      } else if (selectedLanguage === 'Urdu (اردو)') {
         setSuggestions([
             `${contextMedicine.name} کے مضر اثرات؟`,
             `کیا میں ${contextMedicine.name} کو کھانے کے ساتھ لے سکتا ہوں؟`,
             `اگر میں ${contextMedicine.name} کی ایک خوراک بھول جاؤں تو کیا ہوگا؟`,
             `${contextMedicine.name} کے تعاملات`
         ]);
      } else if (selectedLanguage === 'Punjabi (ਪੰਜਾਬી)') {
         setSuggestions([
             `${contextMedicine.name} ਦੇ ਮਾੜੇ ਪ੍ਰਭਾਵ?`,
             `ਕੀ ਮੈਂ ਭੋਜਨ ਦੇ ਨਾਲ ${contextMedicine.name} ਲੈ ਸਕਦਾ ਹਾਂ?`,
             `ਜੇਕਰ ਮੈਂ ${contextMedicine.name} ਦੀ ਇੱਕ ਖੁਰਾਕ ਭੁੱਲ ਜਾਂਦਾ ਹਾਂ ਤਾਂ ਕੀ ਹੋਵੇਗਾ?`,
             `${contextMedicine.name} ਦੇ ਅੰਤਰਕਿਰਿਆਵਾਂ`
         ]);
      } else {
        setSuggestions([
          `Side effects of ${contextMedicine.name}?`,
          `Can I take ${contextMedicine.name} with food?`,
          `What if I miss a dose of ${contextMedicine.name}?`,
          `${contextMedicine.name} interactions`
        ]);
      }
    } else {
      setSuggestions(defaultSuggestions[selectedLanguage] || defaultSuggestions['English']);
    }
  }, [contextMedicine, selectedLanguage]);

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
        
1. **${info.name}** (${info.dosage}) - ${info.frequency}

I've opened the review list so you can confirm and add it to your schedule.`;
          addChatMessage({ role: 'assistant', content: response });
          
          if (onScanComplete) {
            setTimeout(() => {
              onScanComplete(meds);
            }, 2000);
          }
        } else {
          const response = `I've found ${meds.length} medications in your prescription!
          
${meds.map((m, i) => `${i + 1}. **${m.name}** (${m.dosage}) - ${m.frequency}`).join('\n')}

I've opened the review list so you can confirm all of these at once.`;
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
    const scrollToBottom = () => {
      const container = scrollRef.current;
      if (!container) return;
      
      if (isTyping) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
        return;
      }
      
      const start = container.scrollTop;
      const end = container.scrollHeight - container.clientHeight;
      if (start >= end) return;
      
      const change = end - start;
      const duration = Math.min(Math.max(change * 15, 3000), 15000); 
      
      let startTime: number | null = null;
      
      const animateScroll = (time: number) => {
        if (!startTime) startTime = time;
        const progress = time - startTime;
        let percent = progress / duration;
        if (percent > 1) percent = 1;
        
        const ease = percent < 0.8 ? percent * 1.1 : 1 - Math.pow(1 - percent, 3);
        const finalPercent = Math.min(ease, 1);
        
        container.scrollTop = start + change * finalPercent;
        
        if (progress < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    };

    const timer = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timer);
  }, [chatHistory, isTyping]);

  const handleSend = async (force: boolean = false, customMessage?: string, explicitLang?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend && !force) return;
    if (isTyping && !customMessage) return;

    const userMessage = textToSend;
    
    if (!force) {
      const success = incrementAiQuery();
      if (!success) {
        toast.error('Daily AI Limit Reached', {
          description: 'Spend 5 coins for an extra query?',
          action: {
            label: 'Spend 5 Coins',
            onClick: () => {
              if (spendCoins(5)) {
                if (!customMessage) setInput(userMessage);
                handleSend(true, customMessage, explicitLang);
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
    if (!customMessage) setInput('');
    setIsTyping(true);

    try {
      const langContext = explicitLang && explicitLang !== 'Auto Detect' ? explicitLang.split(' ')[0] : (selectedLanguage === 'English' ? undefined : selectedLanguage.split(' ')[0]);
      
      const response = await getChatResponse(chatHistory, userMessage, { 
        medicines, 
        reminders,
        vitals,
        profile: activeProfile,
        currentMedicine: contextMedicine?.name,
        language: langContext
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

  const placeholders: Record<string, Record<string, string>> = {
    'English': { recording: "Listening...", idle: "Ask me anything..." },
    'Hindi (हिंदी)': { recording: "सुन रहा हूँ...", idle: "मुझसे कुछ भी पूछें..." },
    'Tamil (தமிழ்)': { recording: "கேட்கிறது...", idle: "என்னிடம் ஏதேனும் கேளுங்கள்..." },
    'Telugu (తెలుగు)': { recording: "వింటోంది...", idle: "నన్ను ఏదైనా అడగండి..." },
    'Bengali (বাংলা)': { recording: "শুনছি...", idle: "আমাকে কিছু জিজ্ঞাসা করুন..." },
    'Marathi (मराठी)': { recording: "ऐकत आहे...", idle: "मला काहीही विचारा..." },
    'Gujarati (ગુજરાતી)': { recording: "સાંભળી રહ્યો છું...", idle: "મને કંઈપણ કહો..." },
    'Arabic (العربية)': { recording: "يستمع...", idle: "اسألني أي شيء..." },
    'Urdu (اردو)': { recording: "سن رہا ہے...", idle: "مجھ سے کچھ بھی پوچھیں..." },
    'Punjabi (ਪੰਜਾਬી)': { recording: "ਸੁਣ ਰਿਹਾ ਹੈ...", idle: "ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ..." }
  };

  const getPlaceholder = () => {
    const langPlaceholders = placeholders[selectedLanguage] || placeholders['English'];
    return langPlaceholders.idle;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 bg-card border-b border-border flex justify-between items-center z-10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-[14px] shadow-lg shadow-primary/20 shrink-0">
            <Sparkles size={20} className="text-primary-foreground" />
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
              <Plus size={12} className="text-white" strokeWidth={4} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-foreground">Ask AI</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </div>
              <span className="opacity-50">•</span>
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{currentTime}</span>
              </div>
              {locationName && (
                <>
                  <span className="opacity-50">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    <span>{locationName}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVoiceSettings(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Settings size={20} />
          </button>
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
                  : "bg-white dark:bg-slate-800 text-black dark:text-white rounded-tl-none border border-border"
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
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { setInput(s); setTimeout(() => handleSend(), 100); }}
              className="whitespace-nowrap bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/20 transition-all"
            >
              {s}
            </button>
          ))}
        </div>

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
            <input ref={cameraInputRef} type="file" accept="image/*" capture className="hidden" onChange={handleFileSelect} />
            
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
              value={input || ''}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={getPlaceholder()}
              className={`w-full bg-muted border-none rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-foreground`}
            />
            <button 
                onClick={() => setShowVoiceInput(true)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-muted-foreground hover:text-primary`}
                title="Voice Input"
            >
              <Mic size={20} />
            </button>
          </div>
          <Button 
            onClick={() => handleSend()}
            loading={isTyping}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-2xl p-0 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            <Send size={20} />
          </Button>
        </div>
        
        {/* Language Selector */}
        <div className="relative mt-2">
          <div 
            className="flex gap-2 pb-1 overflow-x-auto no-scrollbar -mx-4 px-4 items-center pr-10" 
            id="lang-scroll-ai"
          >
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Language:</span>
            {['English', 'Hindi (हिंदी)', 'Marathi (मराठी)', 'Gujarati (ગુજરાતી)', 'Tamil (தமிழ்)', 'Telugu (తెలుగు)', 'Bengali (বাংলা)', 'Arabic (العربية)', 'Urdu (اردو)', 'Punjabi (ਪੰਜਾਬી)'].map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                  selectedLanguage === lang 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20' 
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {lang}
              </button>
            ))}
            <div className="w-4 shrink-0" />
          </div>
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          <button 
            onClick={() => document.getElementById('lang-scroll-ai')?.scrollBy({ left: 150, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mt-0.5 bg-background border border-border shadow-sm rounded-full p-0.5 text-muted-foreground hover:text-foreground z-10"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <VoiceInputDialog 
        open={showVoiceInput} 
        onOpenChange={setShowVoiceInput} 
        onSend={(text, lang) => handleSend(true, text, lang)} 
      />
      <VoiceSettings 
        open={showVoiceSettings} 
        onOpenChange={setShowVoiceSettings} 
      />
    </div>
  );
};
