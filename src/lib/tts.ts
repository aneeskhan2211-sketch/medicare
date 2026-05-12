// Basic wrapper around Web Speech API for TTS

export const speak = (text: string, language: string = 'en-US') => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech Synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a voice matching the language
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.includes(language)) || voices[0];
  
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = language;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
};
