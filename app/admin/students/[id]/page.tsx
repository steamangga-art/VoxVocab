import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatToWIB } from "@/utils/date";

export default async function StudentDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = parseInt(page);
  const pageSize = 10;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      class: { select: { className: true } },
      _count: { select: { vocabularies: true } },
    },
  });

  if (!student) notFound();

  const vocabularies = await prisma.vocabulary.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const totalVocabs = student._count.vocabularies;
  const totalPages = Math.ceil(totalVocabs / pageSize);

  return (
    <div className="p-4 lg:p-8">
      <Link href="/admin/students" className="flex items-center text-gray-500 hover:text-blue-600 mb-4 font-bold text-sm">
        <ChevronLeft size={18} className="mr-1" /> Back to Students
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            {student.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500">{student.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-full">
              {student.class?.className || "No Class"}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-3">Vocabularies</h3>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Word</th>
                <th className="px-4 py-3 text-left">Part of Speech</th>
                <th className="px-4 py-3 text-left">Meaning</th>
                <th className="px-4 py-3 text-left">Context</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Added At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vocabularies.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-bold text-gray-900">{v.word}</td>
                  <td className="px-4 py-3 text-gray-600">{v.partOfSpeech || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.meaning}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs italic">{v.sentence || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatToWIB(v.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
              <Link 
                href={`?page=${currentPage - 1}`} 
                className={`text-xs font-bold text-gray-600 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                Previous
              </Link>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <Link 
                href={`?page=${currentPage + 1}`} 
                className={`text-xs font-bold text-gray-600 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
              >
                Next
              </Link>
            </div>
          )}

          {vocabularies.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-gray-400 italic">No vocabularies collected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
