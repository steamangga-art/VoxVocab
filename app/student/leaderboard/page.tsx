"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, Users, Globe, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";

export default function StudentLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<"global" | "class">("class");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    const type = level === "global" ? "global" : "class";
    try {
      const res = await fetch(`/api/leaderboard?type=${type}&userId=${user.id}`);
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
  const paginatedData = leaderboard.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          onClick={() => { setLevel("class"); setCurrentPage(1); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            level === "class" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Users size={18} /> My Class
        </button>
        <button 
          onClick={() => { setLevel("global"); setCurrentPage(1); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            level === "global" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Globe size={18} /> Global Rank
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan={3} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td></tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((student, idx) => {
                  const rank = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {rank === 1 ? <Medal className="text-yellow-500 w-5 h-5 mr-2" /> : 
                           rank === 2 ? <Medal className="text-gray-400 w-5 h-5 mr-2" /> :
                           rank === 3 ? <Medal className="text-amber-600 w-5 h-5 mr-2" /> : null}
                          <span className="font-bold text-gray-700">#{rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600">{student.score} pts</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
