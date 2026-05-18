"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Volume2, CheckCircle, AlertCircle } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Validation Schema based on PRD requirements
const vocabSchema = z.object({
  word: z.string().min(1, "Word is required").max(100),
  partOfSpeech: z.string().min(1, "Part of speech is required"),
  meaning: z.string().min(1, "Meaning is required"),
  sentence: z.string().min(5, "Context sentence must be at least 5 characters long"),
});

type VocabFormData = z.infer<typeof vocabSchema>;

export default function VocabInputForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isValidating, setIsValidating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ isValid: boolean; feedback: string } | null>(null);
  const { speak, isSpeaking } = useTextToSpeech();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<VocabFormData>({
    resolver: zodResolver(vocabSchema),
    defaultValues: {
      partOfSpeech: "noun",
    },
  });

  const currentWord = watch("word");

  const onSubmit = async (data: VocabFormData) => {
    setIsValidating(true);
    setAiFeedback(null);

    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Please login first");
      return;
    }
    const user = JSON.parse(userData);

    try {
      // Step 1: Call AI Semantic Validator
      const response = await fetch("/api/validate-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setAiFeedback(result);

      if (result.isValid) {
        // Step 2: Save to database
        const saveRes = await fetch("/api/student/vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            userId: user.id,
          }),
        });

        if (saveRes.ok) {
          reset();
          if (onSuccess) onSuccess();
        } else {
          setAiFeedback({ isValid: false, feedback: "Failed to save to database. Please try again." });
        }
      }
    } catch (error) {
      console.error("Validation failed:", error);
      setAiFeedback({ 
        isValid: false, 
        feedback: "Failed to connect to the AI validator. Please try again." 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSpeech = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentWord) {
      speak(currentWord);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Word</h2>
        <button
          onClick={handleSpeech}
          disabled={!currentWord || isSpeaking}
          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors"
          title="Listen to pronunciation"
        >
          <Volume2 className={`w-5 h-5 ${isSpeaking ? "animate-pulse" : ""}`} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Word Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
          <input
            {...register("word")}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="e.g., Development"
          />
          {errors.word && <p className="mt-1 text-xs text-red-500">{errors.word.message}</p>}
        </div>

        {/* Part of Speech */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
          <select
            {...register("partOfSpeech")}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
          </select>
        </div>

        {/* Meaning */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meaning (Indonesian or Simple English)</label>
          <input
            {...register("meaning")}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="e.g., Proses pengembangan atau pertumbuhan"
          />
          {errors.meaning && <p className="mt-1 text-xs text-red-500">{errors.meaning.message}</p>}
        </div>

        {/* Context Sentence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Context Sentence</label>
          <textarea
            {...register("sentence")}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Use the word in a sentence..."
          />
          {errors.sentence && <p className="mt-1 text-xs text-red-500">{errors.sentence.message}</p>}
        </div>

        {/* AI Feedback Display */}
        {aiFeedback && (
          <div className={`p-4 rounded-lg flex items-start space-x-3 ${aiFeedback.isValid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {aiFeedback.isValid ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm font-medium">{aiFeedback.feedback}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isValidating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Validating with AI...
            </>
          ) : (
            "Add to Word Bank"
          )}
        </button>
      </form>
    </div>
  );
}
