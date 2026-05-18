import { useState, useEffect, useCallback } from "react";

export const useSpeechRecognition = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-US";
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript);
      };

      setRecognition(rec);
    }
  }, []);

  const listen = useCallback(() => {
    if (recognition) {
      setTranscript("");
      recognition.start();
    }
  }, [recognition]);

  const stop = useCallback(() => {
    if (recognition) recognition.stop();
  }, [recognition]);

  return { listen, stop, isListening, transcript, isSupported };
};
