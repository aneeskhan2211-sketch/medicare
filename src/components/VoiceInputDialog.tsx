import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, RotateCcw, X, Send, AlertCircle, Languages, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (text: string, languageKey: string) => void;
}

const LANGUAGES = [
  { label: 'Auto Detect', value: 'auto' },
  { label: 'English', value: 'en-IN' },
  { label: 'Hindi (हिंदी)', value: 'hi-IN' },
  { label: 'Marathi (मराठी)', value: 'mr-IN' },
  { label: 'Urdu (اردو)', value: 'ur-IN' },
  { label: 'Gujarati (ગુજરાતી)', value: 'gu-IN' },
  { label: 'Bengali (বাংলা)', value: 'bn-IN' },
  { label: 'Arabic (العربية)', value: 'ar-SA' },
  { label: 'Telugu (తెలుగు)', value: 'te-IN' },
  { label: 'Tamil (தமிழ்)', value: 'ta-IN' }
];

// Fallback for getting local storage value
const getSavedLang = () => {
    if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem('voice_input_lang');
        if (val) return val;
    }
    return 'auto';
};

export const VoiceInputDialog: React.FC<VoiceInputDialogProps> = ({ open, onOpenChange, onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState(getSavedLang());
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') {
        setError('Speech recognition is not supported on this device/browser.');
    }
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
        if (selectedLang !== 'auto') {
            recognitionRef.current.lang = selectedLang;
        } else {
            recognitionRef.current.lang = ''; // Let browser auto-detect if possible
        }
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('voice_input_lang', selectedLang);
    }
  }, [selectedLang]);

  useEffect(() => {
    if (open) {
      setTranscript('');
      setError(null);
      setIsEditing(false);
      startRecording();
    } else {
      stopRecording();
    }
  }, [open]);

  const startRecording = async () => {
    if (error && error.includes('supported')) return; 

    // Always try to create a fresh instance if it failed before or to be safe
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported on this device/browser.');
      return;
    }

    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
        setError('Microphone access denied. Please allow microphone usage in your browser settings.');
        setIsRecording(false);
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang === 'auto' ? '' : selectedLang;

    recognition.onresult = (event: any) => {
        let fullText = '';
        for (let j = 0; j < event.results.length; ++j) {
            fullText += event.results[j][0].transcript;
        }
        setTranscript(fullText);
    };

    recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
            setError('Microphone permission completely blocked by browser. Please enable it in browser settings.');
            setIsRecording(false);
        } else {
            console.error('Speech recognition error', event.error);
        }
    };

    recognition.onend = () => {
        setIsRecording(false);
    };

    recognitionRef.current = recognition;
    
    try {
      setTranscript('');
      setError(null);
      setIsEditing(false);
      
      // Start recording
      recognition.start();
      setIsRecording(true);
    } catch (e: any) {
      console.error('Speech recognition access error:', e);
      setIsRecording(false);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError' || e.message.includes('Permission denied')) {
         setError('Microphone permission is blocked. Please check your browser settings and enable microphone access for this site.');
      } else {
         setError('Failed to access microphone. Please ensure your microphone is connected and enabled.');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearText = () => {
    setTranscript('');
  };

  const handleSend = () => {
    if (!transcript.trim()) return;
    stopRecording();
    const langLabel = LANGUAGES.find(l => l.value === selectedLang)?.label || 'Auto Detect';
    onSend(transcript, langLabel);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) stopRecording();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md w-[90vw] bg-card/95 backdrop-blur-md border-border p-6 rounded-[32px]">
        <DialogTitle className="sr-only">Voice Input</DialogTitle>
        <DialogDescription className="sr-only">Speak to transcribe text</DialogDescription>
        
        <div className="flex flex-col items-center space-y-6">
          {/* Header & Language Selector */}
          <div className="w-full flex justify-between items-center bg-muted/50 p-2 rounded-2xl">
            <div className="flex items-center gap-2 px-2 text-muted-foreground">
               <Languages size={18} />
               <span className="text-sm font-medium">Spoken Language</span>
            </div>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-[140px] h-9 bg-background border-border rounded-xl font-medium text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value} className="text-xs font-medium">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-xs font-medium p-3 rounded-xl flex items-start gap-2 w-full text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Status & Animation */}
          {!error && (
             <div className="flex flex-col items-center justify-center space-y-3 h-24">
                <div className="relative flex items-center justify-center">
                    {isRecording && (
                        <>
                            <div className="absolute w-20 h-20 bg-primary/20 rounded-full animate-ping" />
                            <div className="absolute w-16 h-16 bg-primary/40 rounded-full animate-pulse" />
                        </>
                    )}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors ${isRecording ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                       <Mic size={24} />
                    </div>
                </div>
                <p className={`text-sm font-bold tracking-wide ${isRecording ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                    {isRecording ? 'Listening...' : (transcript ? 'Tap Retry to restart' : 'Ready')}
                </p>
             </div>
          )}

          {/* Transcript Preview Box */}
          <div className="w-full relative group">
             {isEditing ? (
                 <textarea
                   value={transcript}
                   onChange={(e) => setTranscript(e.target.value)}
                   className="w-full h-32 bg-muted/30 border border-border rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                   placeholder="Your speech will appear here..."
                   autoFocus
                 />
             ) : (
                 <div 
                   className="w-full h-32 bg-muted/30 border border-border rounded-2xl p-4 text-sm overflow-y-auto text-left text-foreground whitespace-pre-wrap cursor-text"
                   onClick={() => !isRecording && setTranscript(transcript)}
                 >
                   {transcript || <span className="text-muted-foreground/50">Your speech will appear here...</span>}
                 </div>
             )}
             
             {transcript && !isRecording && (
                 <button 
                   onClick={() => setIsEditing(!isEditing)}
                   className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-xl text-muted-foreground hover:text-foreground shadow-sm transition-all"
                 >
                    <Edit2 size={16} />
                 </button>
             )}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-3">
             <Button 
                variant="outline" 
                className="flex-[0.8] rounded-xl h-12 bg-card border-border hover:bg-muted"
                onClick={clearText}
                disabled={!transcript && !isRecording}
             >
                <X size={18} className="mr-1 sm:mr-2" /> Stop
             </Button>
             
             {isRecording ? (
                 <Button 
                    variant="destructive" 
                    className="flex-1 rounded-xl h-12 shadow-lg"
                    onClick={stopRecording}
                 >
                    <Square size={18} className="mr-2 fill-current" /> Pause
                 </Button>
             ) : (
                 <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl h-12 bg-card border-border hover:bg-muted font-bold text-primary border-primary/20"
                    onClick={startRecording}
                 >
                    <RotateCcw size={18} className="mr-2" /> Retry
                 </Button>
             )}
          </div>
          
          <Button 
             className="w-full rounded-xl h-14 text-base font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
             onClick={handleSend}
             disabled={!transcript.trim() || isRecording}
          >
             Tell AI <Send size={18} className="ml-2" />
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
};
