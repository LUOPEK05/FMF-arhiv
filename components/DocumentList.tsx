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
      <p className="text-ink/50 dark:text-chalk/50 text-sm py-8 text-center">
        Ni najdenih gradiv za izbrane filtre.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink/10 dark:divide-chalk/10 border border-ink/10 dark:border-chalk/10 rounded-lg bg-white dark:bg-chalkboard">
      {documents.map((doc) => {
        const majorName = doc.subject?.major?.name;
        const yearLabel = doc.subject?.year ? `${doc.subject.year}. letnik` : null;
        const subjectName = doc.subject?.name;
        const categoryLabel = CATEGORY_LABELS[doc.category] ?? doc.category;

        const pathParts = [majorName, yearLabel, subjectName, categoryLabel].filter(Boolean);

        return (
          <li key={doc.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{doc.title}</p>
              <p className="text-xs text-ink/50 dark:text-chalk/50 mt-1">
                {pathParts.join(" › ")}
                {doc.professor && ` · ${doc.professor.full_name}`}
                {doc.academic_year && ` · ${doc.academic_year}`}
              </p>
            </div>
            
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Prenesi
            </a>
          </li>
        );
      })}
    </ul>
  );
}