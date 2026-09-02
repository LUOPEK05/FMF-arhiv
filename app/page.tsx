"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import FilterBar, { Filters } from "@/components/FilterBar";
import DocumentList from "@/components/DocumentList";
import type { DocumentRow } from "@/types/database";

export default function HomePage() {
  const supabase = createClient();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    majorId: null,
    level: null,
    year: null,
    subjectId: null,
    category: null,
    professorId: null,
    search: "",
  });

  useEffect(() => {
    setLoading(true);

    let query = supabase
      .from("documents")
      .select("*, subject:subjects(*, major:majors(*)), professor:professors(*)")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (filters.subjectId) query = query.eq("subject_id", filters.subjectId);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.professorId) query = query.eq("professor_id", filters.professorId);
    if (filters.search) query = query.ilike("title", `%${filters.search}%`);

    // majorId/level/year filters need a join through subjects;
    // simplest: fetch matching subject ids first, then filter documents by those.
    (async () => {
      if (!filters.subjectId && (filters.majorId || filters.level || filters.year)) {
        let subjQuery = supabase.from("subjects").select("id");
        if (filters.majorId) subjQuery = subjQuery.eq("major_id", filters.majorId);
        if (filters.level) subjQuery = subjQuery.eq("level", filters.level);
        if (filters.year) subjQuery = subjQuery.eq("year", filters.year);
        const { data: subjIds } = (await subjQuery) as { data: { id: string }[] | null };
        const ids = (subjIds ?? []).map((s) => s.id);
        query = query.in("subject_id", ids.length ? ids : ["__none__"]);
      }
      const { data, error } = await query;
      if (!error) setDocuments((data as unknown as DocumentRow[]) ?? []);
      setLoading(false);
    })();
  }, [filters]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gradivo FMF</h1>
        <p className="text-ink/60 dark:text-chalk/60 text-sm">
          Izpiti, kolokviji, vaje in literatura — vse na enem mestu.
        </p>
      </div>

      <FilterBar onChange={setFilters} />

      {loading ? (
        <p className="text-sm text-ink/40 dark:text-chalk/40 py-8 text-center">Nalaganje...</p>
      ) : (
        <DocumentList documents={documents} />
      )}
    </div>
  );
}