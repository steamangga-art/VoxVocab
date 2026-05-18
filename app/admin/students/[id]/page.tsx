import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      class: { select: { className: true } },
      vocabularies: true,
    },
  });

  if (!student) notFound();

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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Words Collected</h3>
            <p className="text-2xl font-bold text-blue-600">{student.vocabularies.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Last Active</h3>
            <p className="text-sm font-bold text-gray-900 truncate">{new Date(student.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-3">Vocabularies</h3>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {student.vocabularies.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {student.vocabularies.map((v) => (
                <li key={v.id} className="px-4 py-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-700">{v.word}</span>
                  <span className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-xs text-gray-400 italic">No vocabularies collected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
