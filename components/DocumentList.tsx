"use client";

import type { DocumentRow } from "@/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  izpit: "Izpit",
  kolokvij: "Kolokvij",
  vaje: "Vaje",
  literatura: "Literatura",
  projekt: "Projekt",
  drugo: "Drugo",
};

export default function DocumentList({ documents }: { documents: DocumentRow[] }) {
  if (documents.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-8 text-center">
        Ni najdenih gradiv za izbrane filtre.
      </p>
    );
  }

  return (
    <ul className="divide-y border rounded-lg bg-white">
      {documents.map((doc) => (
        <li key={doc.id} className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium truncate">{doc.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              {CATEGORY_LABELS[doc.category] ?? doc.category}
              {doc.professor && ` · ${doc.professor.full_name}`}
              {doc.academic_year && ` · ${doc.academic_year}`}
            </p>
          </div>
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
          >
            Prenesi
          </a>
        </li>
      ))}
    </ul>
  );
}
