import { useState, useCallback, useEffect } from "react";

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

/**
 * Custom hook for Text-to-Speech using the Web Speech API.
 * Provides a simple interface to speak text with customizable options.
 */
export const useTextToSpeech = (defaultOptions: TTSOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    if (!isSupported) {
      console.warn("Text-to-Speech is not supported in this browser.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Merge options with defaults from PRD: en-US, rate 0.9x
    utterance.lang = options.lang || defaultOptions.lang || "en-US";
    utterance.rate = options.rate || defaultOptions.rate || 0.9;
    utterance.pitch = options.pitch || defaultOptions.pitch || 1.0;
    utterance.volume = options.volume || defaultOptions.volume || 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, defaultOptions]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
};
