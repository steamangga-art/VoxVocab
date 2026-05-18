"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Volume2, Clock } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Question {
  id: string;
  word: string;
  meaning: string;
  type: "MCQ" | "SPELL";
  options?: string[];
}

export default function StudentQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const { speak } = useTextToSpeech();

  useEffect(() => {
    // 1. Fetch questions and security check
    const initQuiz = async () => {
      const res = await fetch("/api/quiz/init");
      if (!res.ok) router.push("/student/dashboard"); // Access Guard
      const data = await res.json();
      setQuestions(data.questions);
      setLoading(false);
    };
    initQuiz();
  }, [router]);

  // 4. Timer Logic
  useEffect(() => {
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(60);
    } else {
      submitQuiz();
    }
  }, [currentIndex, questions, answers]);

  const submitQuiz = async () => {
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    if (res.ok) router.push("/student/dashboard?status=completed");
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8 bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full transition-all" style={{ width: `${(currentIndex / questions.length) * 100}%` }} />
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-bold text-gray-500">Question {currentIndex + 1} of 10</span>
        <div className="flex items-center text-red-500 font-mono text-xl">
          <Clock className="w-5 h-5 mr-2" /> {timeLeft}s
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        {currentQ.type === "SPELL" ? (
          <div className="space-y-6 text-center">
            <button onClick={() => speak(currentQ.word)} className="mx-auto p-4 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
              <Volume2 className="w-12 h-12" />
            </button>
            <input 
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              className="w-full text-center text-2xl p-4 border-b-2 border-blue-600 outline-none" 
              placeholder="Type the spelling..."
            />
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">What does "{currentQ.word}" mean?</h2>
            {currentQ.options?.map((opt) => (
              <button 
                key={opt}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                className={`w-full p-4 rounded-xl border ${answers[currentQ.id] === opt ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">
          {currentIndex === 9 ? "Finish Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
