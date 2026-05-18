"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, GraduationCap, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { useToast } from "@/components/layout/Toast";
import Modal from "@/components/layout/Modal";
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
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const pageSize = 10;

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
  }, [selectedClass, searchQuery, currentPage, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Student deleted successfully", "success");
      fetchData();
    } catch {
      showToast("Failed to delete student", "error");
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <Modal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId.id)}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteId?.name || 'this student'} (Class: ${deleteId?.class?.className || 'N/A'})? This action cannot be undone.`}
      />
      {editStudent && (
        <EditStudentModal 
          isOpen={!!editStudent}
          onClose={() => setEditStudent(null)}
          student={editStudent}
          onSuccess={fetchData}
        />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500">View and track all student progress</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex items-center bg-gray-50 px-4 py-2 rounded-xl w-full">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent outline-none px-3 py-1 text-sm w-full" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Words Collected</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Last Active</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded"></div></td>
                  </tr>
                ))
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                        {student.class?.className || "No Class"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-blue-500" />
                        <span className="text-sm font-bold text-gray-700">{student._count.vocabularies} words</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{new Date(student.updatedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditStudent(student)} className="text-xs text-blue-600 font-bold hover:underline">Edit</button>
                        <button onClick={() => setDeleteId(student)} className="text-xs text-red-600 font-bold hover:underline">Delete</button>
                        <Link href={`/admin/students/${student.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
