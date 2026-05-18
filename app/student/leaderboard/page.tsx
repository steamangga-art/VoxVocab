"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Target, Filter, Globe, Users } from "lucide-react";

export default function StudentLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<"global" | "class">("class");
  const [user, setUser] = useState<any>(null);

  const fetchLeaderboard = async (isGlobal: boolean) => {
    setLoading(true);
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const academicYear = "2025/2026"; // Dynamic in production
    let url = `/api/leaderboard?academicYear=${academicYear}`;
    
    if (!isGlobal && parsedUser.classId) {
      url += `&classId=${parsedUser.classId}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setLeaderboard(data.data || []);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(level === "global");
  }, [level]);

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="text-yellow-500" /> Leaderboard
        </h1>
        <p className="text-gray-500">See how you rank against your peers</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-gray-100 rounded-2xl w-full max-w-sm mb-8">
        <button 
          onClick={() => setLevel("class")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            level === "class" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Users size={18} />
          <span>My Class</span>
        </button>
        <button 
          onClick={() => setLevel("global")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            level === "global" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Globe size={18} />
          <span>Global Rank</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mastered</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : leaderboard.length > 0 ? (
                leaderboard.map((student, idx) => (
                  <tr key={student.id} className={`hover:bg-gray-50/50 transition-colors ${student.id === user?.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {idx === 0 ? <Medal className="text-yellow-500 w-5 h-5 mr-1" /> : 
                         idx === 1 ? <Medal className="text-gray-400 w-5 h-5 mr-1" /> :
                         idx === 2 ? <Medal className="text-amber-600 w-5 h-5 mr-1" /> : null}
                        <span className={`font-bold ${idx < 3 ? 'text-gray-900' : 'text-gray-400'}`}>#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.className}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-600">{student.masteredCount} words</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: `${student.accuracy}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-green-600">{student.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">{student.rankScore}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">No data available for this academic year</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
