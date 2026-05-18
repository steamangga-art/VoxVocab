"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Trophy, Target, Award, Lock, ChevronRight, GraduationCap, Menu, Bell } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session protection
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/";
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "STUDENT") {
        window.location.href = "/admin/dashboard";
        return;
      }
      setUser(parsedUser);
      setLoading(false);
    } catch (e) {
      window.location.href = "/";
    }
  }, []);

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
      
      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-white p-4 lg:p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hello, {user?.name.split(' ')[0]}! 👋</h1>
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        <main className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Target size={20} />
                </div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Weekly Goal</p>
              </div>
              <p className="text-3xl font-bold mt-1">7 / 10</p>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-4">
                <div className="bg-blue-600 h-2 rounded-full w-[70%]"></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-green-50 rounded-xl text-green-600">
                  <Award size={20} />
                </div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Last Quiz Score</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold mt-1">92/100</p>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-1">EXCELLENT</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <button className="bg-blue-600 text-white p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <BookOpen className="w-8 h-8" />
              <span className="font-bold">Add New Word</span>
            </button>
            <button className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-3xl flex flex-col items-center gap-3 opacity-60 cursor-not-allowed group">
              <Lock className="w-8 h-8 text-gray-400 group-hover:shake" />
              <span className="font-bold text-gray-400">Next Weekly Quiz</span>
            </button>
          </div>

          {/* Leaderboard Widget */}
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
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${i === 1 ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 font-bold ${i === 1 ? 'text-blue-600' : 'text-gray-400'}`}>#{i}</span>
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      S{i}
                    </div>
                    <span className="font-semibold text-gray-900">Student {i}</span>
                  </div>
                  <span className="font-bold text-blue-600">{1000 - i * 50} pts</span>
                </div>
              ))}
              <button className="w-full py-4 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                View Full Leaderboard
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
