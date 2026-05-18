"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Target, Award, Lock, Menu, GraduationCap } from "lucide-react";
import StudentSidebar from "@/components/layout/StudentSidebar";

interface RolloverModalProps {
  onConfirm: (classId: string) => void;
  classes: { id: string; className: string }[];
}

const RolloverModal = ({ onConfirm, classes }: RolloverModalProps) => {
  const [selected, setSelected] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl">
        <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Naik Kelas!</h2>
        <p className="text-gray-600 mb-6 text-sm">Please select your new class to continue your learning journey for the new academic year.</p>
        <select 
          className="w-full p-3 border rounded-xl mb-6"
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select your class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
        </select>
        <button 
          disabled={!selected}
          onClick={() => onConfirm(selected)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          Save & Unlock Dashboard
        </button>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [needsRollover, setNeedsRollover] = useState(false);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState<"class" | "global">("class");
  const [stats, setStats] = useState({ 
    vocabCount: 0, 
    bestQuizScore: 0, 
    weeklyVocabs: 0, 
    weeklyGoal: 7, 
    quizTakenCount: 0, 
    perfectScoreCount: 0, 
    deadline: "" 
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/";
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      Promise.all([
        fetch("/api/student/stats", {
          method: "POST",
          body: JSON.stringify({ userId: parsedUser.id }),
        }).then(res => res.json()),
        fetch(`/api/leaderboard?type=${activeTab}&userId=${parsedUser.id}`).then(res => res.json())
      ]).then(([statsData, leaderboardData]) => {
        setStats(statsData);
        setLeaderboard(leaderboardData);
        setLoading(false);
      });
    } catch (e) {
      window.location.href = "/";
    }
  }, [activeTab]);

  const handleRollover = async (classId: string) => {
    await fetch("/api/user/rollover", { method: "POST", body: JSON.stringify({ classId }) });
    setNeedsRollover(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {needsRollover && <RolloverModal onConfirm={handleRollover} classes={classes} />}
      
      <div className="p-4 lg:p-8">
        <header className="flex items-center justify-between mb-8 bg-white p-4 lg:p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hello, {user?.name.split(' ')[0]}! 👋</h1>
          </div>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sm:col-span-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Target size={20} />
                </div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Weekly Goals</p>
              </div>
              <p className="text-3xl font-bold mt-1">{stats.weeklyVocabs} / {stats.weeklyGoal}</p>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-4">
                <div className={`h-2 rounded-full transition-all ${stats.weeklyVocabs >= stats.weeklyGoal ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${Math.min((stats.weeklyVocabs / stats.weeklyGoal) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Deadline: {stats.deadline ? new Date(stats.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sm:col-span-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <BookOpen size={20} />
                </div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Learned</p>
              </div>
              <p className="text-3xl font-bold mt-1">{stats.vocabCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sm:col-span-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-green-50 rounded-xl text-green-600">
                  <Award size={20} />
                </div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Best Quiz Score</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold mt-1">{stats.bestQuizScore}/100</p>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold mb-1 ${stats.bestQuizScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {stats.bestQuizScore >= 80 ? 'GOOD' : 'KEEP GOING'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{stats.perfectScoreCount}x Perfect Score</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <button 
              onClick={() => window.location.href = "/student/vocab"}
              className="bg-blue-600 text-white p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <BookOpen className="w-8 h-8" />
              <span className="font-bold">Add New Word</span>
            </button>
            <button 
              disabled={stats.weeklyVocabs < stats.weeklyGoal || stats.quizTakenCount >= 3}
              onClick={() => window.location.href = "/student/quiz"}
              className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${stats.weeklyVocabs >= stats.weeklyGoal && stats.quizTakenCount < 3 ? 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50' : 'bg-white border-2 border-dashed border-gray-200 opacity-60 cursor-not-allowed group'}`}
            >
              <Lock className={`w-8 h-8 ${stats.weeklyVocabs >= stats.weeklyGoal && stats.quizTakenCount < 3 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-bold ${stats.weeklyVocabs >= stats.weeklyGoal && stats.quizTakenCount < 3 ? 'text-green-700' : 'text-gray-400'}`}>
                {stats.quizTakenCount >= 3 ? 'Weekly Limit Reached' : (stats.weeklyVocabs >= stats.weeklyGoal ? 'Start Weekly Quiz' : 'Next Weekly Quiz')}
              </span>
              <span className="text-[10px] text-gray-400">({stats.quizTakenCount} / 3 attempts)</span>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500 font-bold">
                Deadline: {stats.deadline ? new Date(stats.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
              </span>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-6 border-b border-gray-100 w-full">
                <button 
                  onClick={() => setActiveTab("class")} 
                  className={`pb-3 text-sm font-bold transition-all ${activeTab === 'class' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Class Rank
                </button>
                <button 
                  onClick={() => setActiveTab("global")} 
                  className={`pb-3 text-sm font-bold transition-all ${activeTab === 'global' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Global Rank
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {leaderboard.map((item, i) => (
                <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl ${i === 0 ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 font-bold ${i === 0 ? 'text-blue-600' : 'text-gray-400'}`}>#{i + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 uppercase">
                      {item.name[0]}
                    </div>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-blue-600">{item.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
