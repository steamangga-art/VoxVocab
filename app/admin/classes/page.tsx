"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, ToggleLeft, ToggleRight, Trash2, Edit3, Loader2 } from "lucide-react";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClass, setNewClass] = useState({ className: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClass),
      });
      if (res.ok) {
        setNewClass({ className: "" });
        setShowAddForm(false);
        fetchClasses();
      }
    } catch (err) {
      console.error("Failed to add class", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-500">Manage school classes</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          {showAddForm ? "Cancel" : <><Plus size={20} /> Create New Class</>}
        </button>
      </header>

      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 max-w-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4">Add New Class</h2>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input 
                required
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                placeholder="e.g., XII RPL 1" 
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <button 
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Class"}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white h-40 rounded-3xl animate-pulse border border-gray-100" />
          ))
        ) : classes.length > 0 ? (
          classes.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <BookOpen size={24} />
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{c.className}</h3>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span className="text-xs font-bold">{c._count?.users || 0} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic bg-white rounded-3xl border-2 border-dashed">
            No classes created yet.
          </div>
        )}
      </div>
    </div>
  );
}
