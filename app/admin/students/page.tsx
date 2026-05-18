"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, GraduationCap, ChevronRight, ChevronLeft, ArrowRightLeft, Edit3, Trash2 } from "lucide-react";
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
    if (selectedStudents.length === students.length) setSelectedStudents([]);
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
    <div className="p-4 lg:p-8">
      {rolloverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Move {selectedStudents.length} Students</h2>
            <select className="w-full p-3 border rounded-xl mb-6" onChange={(e) => setTargetClass(e.target.value)}>
              <option value="">Select Target Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
            <div className="flex gap-4">
              <button onClick={() => setRolloverModal(false)} className="flex-1 py-3 text-gray-600 font-bold">Cancel</button>
              <button onClick={handleRollover} disabled={!targetClass} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Move</button>
            </div>
          </div>
        </div>
      )}

      {editStudent && (
        <EditStudentModal isOpen={!!editStudent} onClose={() => setEditStudent(null)} student={editStudent} onSuccess={fetchData} />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500">Manage school classes and students</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedStudents.length > 0 && (
            <button onClick={() => setRolloverModal(true)} className="bg-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <ArrowRightLeft size={16} /> Move Selected
            </button>
          )}
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-white border px-4 py-3 rounded-xl text-sm font-semibold">
            {[10, 20, 50].map(size => <option key={size} value={size}>{size} per page</option>)}
          </select>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }} className="bg-white border px-4 py-3 rounded-xl text-sm font-semibold">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4"><input type="checkbox" checked={selectedStudents.length === students.length && students.length > 0} onChange={toggleSelectAll} /></th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Class</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4"><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleSelect(student.id)} /></td>
                <td className="px-6 py-4 font-bold">{student.name}</td>
                <td className="px-6 py-4">{student.class?.className || "N/A"}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setEditStudent(student)} className="p-2 text-blue-600"><Edit3 size={16}/></button>
                  <button onClick={() => setEditStudent(student)} className="p-2 text-red-600"><Trash2 size={16}/></button>
                  <Link href={`/admin/students/${student.id}`} className="p-2 text-gray-400"><ChevronRight size={16}/></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border rounded-xl">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border rounded-xl">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
