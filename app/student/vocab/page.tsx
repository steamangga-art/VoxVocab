"use client";

import { useState, useEffect } from "react";
import { Volume2, Search, Plus, Filter, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import VocabInputForm from "@/components/vocab-form/VocabInputForm";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function StudentVocabPage() {
  const [vocabs, setVocabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { speak } = useTextToSpeech();

  const filteredVocabs = vocabs.filter((v) =>
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const paginatedVocabs = filteredVocabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchVocabs = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);
    
    try {
      const res = await fetch(`/api/student/vocab?userId=${user.id}`);
      const data = await res.json();
      setVocabs(data);
    } catch (err) {
      console.error("Failed to fetch vocabs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-4 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vocabulary Bank</h1>
          <p className="text-gray-500">Collect and master your English words</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          {showForm ? "View Word Bank" : <><Plus size={20} /> Add New Word</>}
        </button>
      </header>

      {showForm ? (
        <div className="max-w-2xl mx-auto">
          <VocabInputForm onSuccess={() => {
            setShowForm(false);
            fetchVocabs();
          }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center bg-white border border-gray-200 px-4 py-3 rounded-2xl">
              <Search size={20} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search your words..." 
                className="bg-transparent outline-none px-3 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-gray-600 hover:bg-gray-50">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>

          {/* Word List */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white h-48 rounded-3xl animate-pulse border border-gray-100 shadow-sm" />
              ))
            ) : paginatedVocabs.length > 0 ? (
              paginatedVocabs.map((v) => (
                <div key={v.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{v.word}</h3>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        {v.partOfSpeech}
                      </span>
                    </div>
                    <button 
                      onClick={() => speak(v.word)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <p className="text-gray-600 font-medium mb-3 italic">"{v.meaning}"</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {v.sentence}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      v.status === 'MASTERED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {v.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <GraduationCap size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No words found</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-full border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-full border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
