"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronRight, ChevronLeft, ArrowRightLeft, Edit3, Trash2, Users, MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/layout/Toast";
import EditStudentModal from "@/components/layout/EditStudentModal";
import Link from "next/link";

export default function AdminStudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [rolloverModal, setRolloverModal] = useState(false);
  const [targetClass, setTargetClass] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const classRes = await fetch("/api/classes");
      const classesData = await classRes.json();
      setClasses(classesData);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        q: searchQuery,
      });
      if (selectedClass) params.append("classId", selectedClass);
      
      const studentRes = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await studentRes.json();
      setStudents(data.students || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, searchQuery, currentPage, pageSize, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length && students.length > 0) setSelectedStudents([]);
    else setSelectedStudents(students.map(s => s.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleRollover = async () => {
    try {
      const res = await fetch("/api/admin/rollover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudents, newClassId: targetClass }),
      });
      if (!res.ok) throw new Error("Rollover failed");
      showToast("Students moved successfully", "success");
      setSelectedStudents([]);
      setRolloverModal(false);
      fetchData();
    } catch {
      showToast("Failed to move students", "error");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {rolloverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-6">Move {selectedStudents.length} Students</h2>
            <select className="w-full p-3 bg-gray-50 border rounded-xl mb-6 outline-none" onChange={(e) => setTargetClass(e.target.value)}>
              <option value="">Select Target Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
            <div className="flex gap-4">
              <button onClick={() => setRolloverModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
              <button onClick={handleRollover} disabled={!targetClass} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Confirm Move</button>
            </div>
          </div>
        </div>
      )}

      {editStudent && (
        <EditStudentModal isOpen={!!editStudent} onClose={() => setEditStudent(null)} student={editStudent} onSuccess={fetchData} />
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600" /> Student Management
          </h1>
          <p className="text-gray-500 mt-2">Manage student accounts and class assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedStudents.length > 0 && (
            <button onClick={() => setRolloverModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all">
              <ArrowRightLeft size={18} /> Move ({selectedStudents.length})
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 flex items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="bg-transparent outline-none px-3 w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }} className="bg-gray-50 border px-4 py-3 rounded-xl text-sm font-semibold outline-none">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4">
                <input type="checkbox" checked={selectedStudents.length === students.length && students.length > 0} onChange={toggleSelectAll} className="accent-blue-600" />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Class</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleSelect(student.id)} className="accent-blue-600" />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-gray-600">{student.class?.className || "No Class"}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setEditStudent(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={16}/></button>
                  <button onClick={() => setEditStudent(student)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  <Link href={`/admin/students/${student.id}`} className="p-2 text-gray-400 hover:text-gray-600"><MoreHorizontal size={18}/></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
        <span className="text-sm font-medium text-gray-500">Page {currentPage} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all">Prev</button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all">Next</button>
        </div>
      </div>
    </div>
  );
}
