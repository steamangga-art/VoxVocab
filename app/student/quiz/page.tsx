"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Volume2, Mic, CheckCircle, SkipForward } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Question {
  id: string;
  word: string;
  meaning: string;
}

export default function StudentQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isPronounced, setIsPronounced] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const { speak } = useTextToSpeech();
  const { listen, isListening, transcript } = useSpeechRecognition();

  useEffect(() => {
    const initQuiz = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) { router.push("/"); return; }
      const user = JSON.parse(userData);
      
      const res = await fetch(`/api/quiz/init?userId=${user.id}`);
      if (!res.ok) { router.push("/student/dashboard"); return; }
      
      const data = await res.json();
      setQuestions(data.questions);
      setLoading(false);
    };
    initQuiz();
  }, [router]);

  useEffect(() => {
    setIsPronounced(false);
    setLastTranscript("");
  }, [currentIndex]);

  useEffect(() => {
    if (transcript && transcript !== lastTranscript && !isPronounced) {
      setLastTranscript(transcript);
      if (transcript.toLowerCase().trim() === questions[currentIndex]?.word.toLowerCase()) {
        setIsPronounced(true);
      }
    }
  }, [transcript, questions, currentIndex, lastTranscript, isPronounced]);

  const handleNext = (isSkipped = false) => {
    if (isSkipped) {
      setAnswers({ ...answers, [questions[currentIndex].id]: "" });
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ userId: JSON.parse(localStorage.getItem("user") || "{}").id, answers }),
    });
    if (res.ok) router.push("/student/dashboard?status=completed");
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        <h2 className="text-xl font-bold mb-6 text-center">Pronounce & Define ({currentIndex + 1}/{questions.length})</h2>
        
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Pronounce this word:</p>
          <p className="text-4xl font-bold text-blue-600">{currentQ.word}</p>
        </div>
        
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => speak(currentQ.word)} className="p-4 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
            <Volume2 size={32} />
          </button>
          <button 
            onClick={listen} 
            disabled={isPronounced}
            className={`p-4 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}
          >
            <Mic size={32} />
          </button>
        </div>

        {isPronounced && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-green-600 font-bold mb-4">
              <CheckCircle /> Pronunciation Correct!
            </div>
            <input 
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              className="w-full text-center p-4 border rounded-xl" 
              placeholder="What does it mean?"
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button 
          onClick={() => handleNext(true)}
          className="flex items-center gap-2 text-gray-500 font-bold hover:text-red-500 transition-colors"
        >
          <SkipForward size={20} /> Skip
        </button>
        <button 
          onClick={() => handleNext(false)} 
          disabled={!isPronounced}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
