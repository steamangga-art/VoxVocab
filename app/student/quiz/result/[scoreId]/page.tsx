"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface QuizResult {
  word: string;
  userAnswer: string;
  isCorrect: boolean;
  correctMeaning: string;
}

interface QuizScore {
  score: number;
  totalQuestions: number;
  results: QuizResult[];
}

export default function QuizResultPage() {
  const { scoreId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<QuizScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/quiz/result/${scoreId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [scoreId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-sm">
            <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Data not found</h2>
            <p className="text-gray-500 mb-6">The quiz results you are looking for do not exist or have been removed.</p>
            <button onClick={() => router.back()} className="flex items-center gap-2 justify-center w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800">
                <ArrowLeft size={18} /> Go Back
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <h1 className="text-3xl font-bold mb-1">Quiz Results</h1>
            <p className="text-gray-500 text-lg">You achieved a score of <span className="font-bold text-blue-600">{data.score}%</span></p>
        </div>
        
        <div className="space-y-4">
            {data.results.map((r, i) => (
            <div key={i} className={`p-6 rounded-3xl border ${r.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-bold">{r.word}</p>
                    {r.isCorrect ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-600" />}
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${r.isCorrect ? 'text-green-800' : 'text-red-800'}`}>Your answer: <span className="font-semibold">{r.userAnswer || "(skipped)"}</span></p>
                  {!r.isCorrect && (
                    <p className="text-sm text-gray-600">Correct meaning: <span className="font-semibold text-gray-900">{r.correctMeaning}</span></p>
                  )}
                </div>
            </div>
            ))}
        </div>
        <button onClick={() => router.push("/student/dashboard")} className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all">Back to Dashboard</button>
      </div>
    </div>
  );
}
