"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { DocumentRow, DocumentStatus } from "@/types/database";

const STATUS_LABELS: Record<DocumentStatus, { label: string; className: string }> = {
  pending: { label: "Čaka na pregled", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Odobreno", className: "bg-green-100 text-green-800" },
  rejected: { label: "Zavrnjeno", className: "bg-red-100 text-red-800" },
};

export default function MyUploadsPage() {
  const supabase = createClient();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*, subject:subjects(*), professor:professors(*)")
      .eq("uploaded_by", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Napaka pri nalaganju objav:", error);
    setDocuments((data as unknown as DocumentRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleDelete(doc: DocumentRow) {
    if (!confirm(`Izbrišem "${doc.title}"? Tega ni mogoče razveljaviti.`)) return;

    setDeletingId(doc.id);

    // izbriši vrstico iz tabele documents
    const { error: dbError } = await supabase.from("documents").delete().eq("id", doc.id);

    if (dbError) {
      alert("Napaka pri brisanju: " + dbError.message);
      setDeletingId(null);
      return;
    }

    // poskusi izbrisati še datoteko iz storage (ni nujno, da uspe, ni kritično)
    try {
      const path = doc.file_url.split("/documents/")[1];
      if (path) await supabase.storage.from("documents").remove([path]);
    } catch {
      // datoteka morda že ne obstaja, ni pomembno
    }

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setDeletingId(null);
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Nalaganje...</p>;
  }

  if (notLoggedIn) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-xl font-bold mb-2">Prijaviti se moraš</h1>
        <p className="text-slate-500 text-sm mb-4">
          Za ogled svojih objav se moraš najprej prijaviti.
        </p>
        <a href="/login" className="text-blue-600 text-sm font-medium hover:underline">
          Pojdi na prijavo →
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Moje objave</h1>
      <p className="text-slate-500 text-sm mb-6">
        Pregled vseh dokumentov, ki si jih naložil/a, in njihov trenutni status.
      </p>

      {documents.length === 0 ? (
        <p className="text-slate-500 text-sm py-8 text-center">
          Še nisi naložil/a nobenega dokumenta.
        </p>
      ) : (
        <ul className="divide-y border rounded-lg bg-white">
          {documents.map((doc) => {
            const status = STATUS_LABELS[doc.status];
            return (
              <li key={doc.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {doc.subject?.name}
                    {doc.professor && ` · ${doc.professor.full_name}`}
                    {doc.academic_year && ` · ${doc.academic_year}`}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Odpri
                  </a>
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === doc.id ? "Brišem..." : "Izbriši"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}