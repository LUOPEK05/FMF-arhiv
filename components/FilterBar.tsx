"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Major, Subject, Professor, DocumentCategory, StudyLevel } from "@/types/database";

const LEVELS: { value: StudyLevel; label: string; years: number[] }[] = [
  { value: "dodiplomski", label: "Dodiplomski", years: [1, 2, 3] },
  { value: "magistrski", label: "Magistrski", years: [1, 2] },
  { value: "doktorski", label: "Doktorski", years: [1, 2, 3] },
];

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "izpit", label: "Izpiti" },
  { value: "kolokvij", label: "Kolokviji" },
  { value: "vaje", label: "Vaje" },
  { value: "literatura", label: "Literatura" },
  { value: "projekt", label: "Projekti" },
  { value: "drugo", label: "Drugo" },
];

export interface Filters {
  majorId: string | null;
  level: StudyLevel | null;
  year: number | null;
  subjectId: string | null;
  category: DocumentCategory | null;
  professorId: string | null;
  search: string;
}

export default function FilterBar({
  onChange,
}: {
  onChange: (filters: Filters) => void;
}) {
  const supabase = createClient();

  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);

  const [majorId, setMajorId] = useState<string | null>(null);
  const [level, setLevel] = useState<StudyLevel | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [category, setCategory] = useState<DocumentCategory | null>(null);
  const [professorId, setProfessorId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // load majors once
  useEffect(() => {
    supabase
      .from("majors")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("Napaka pri nalaganju smeri:", error);
        setMajors(data ?? []);
      });
  }, []);

  // reset level/year/subjects when major changes
  useEffect(() => {
    setLevel(null);
    setYear(null);
    setSubjectId(null);
    setSubjects([]);
  }, [majorId]);

  // reset year when level changes
  useEffect(() => {
    setYear(null);
  }, [level]);

  // load subjects when major is chosen (optionally narrowed by level/year)
  useEffect(() => {
    setSubjectId(null);
    if (!majorId) return setSubjects([]);
    let query = supabase.from("subjects").select("*").eq("major_id", majorId);
    if (level) query = query.eq("level", level);
    if (year) query = query.eq("year", year);
    query.order("year").order("name").then(({ data, error }) => {
      if (error) console.error("Napaka pri nalaganju predmetov:", error);
      setSubjects(data ?? []);
    });
  }, [majorId, level, year]);

  // load professors relevant to the chosen subject (falls back to all professors)
  useEffect(() => {
    setProfessorId(null);
    const query = subjectId
      ? supabase
          .from("subject_professors")
          .select("professor:professors(*)")
          .eq("subject_id", subjectId)
      : supabase.from("professors").select("*").order("full_name");

    query.then((res: any) => {
      if (res.error) console.error("Napaka pri nalaganju profesorjev:", res.error);
      if (!res.data) return setProfessors([]);
      // normalize both shapes to Professor[]
      const list = subjectId
        ? res.data.map((r: any) => r.professor).filter(Boolean)
        : res.data;
      setProfessors(list);
    });
  }, [subjectId]);

  // propagate changes up
  useEffect(() => {
    onChange({ majorId, level, year, subjectId, category, professorId, search });
  }, [majorId, level, year, subjectId, category, professorId, search]);

  const selectClass =
    "border border-ink/15 dark:border-chalk/20 rounded-md px-3 py-2 text-sm bg-white dark:bg-chalkboard dark:text-chalk w-full disabled:bg-ink/5 dark:disabled:bg-chalk/5 disabled:text-ink/30 dark:disabled:text-chalk/30";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      <select
        className={selectClass}
        value={majorId ?? ""}
        onChange={(e) => setMajorId(e.target.value || null)}
      >
        <option value="">Vse smeri</option>
        {majors.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={level ?? ""}
        disabled={!majorId}
        onChange={(e) => setLevel((e.target.value || null) as StudyLevel | null)}
      >
        <option value="">Vse stopnje</option>
        {LEVELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={year ?? ""}
        disabled={!majorId || !level}
        onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Vsi letniki</option>
        {(LEVELS.find((l) => l.value === level)?.years ?? []).map((y) => (
          <option key={y} value={y}>
            {y}. letnik
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={subjectId ?? ""}
        disabled={!majorId}
        onChange={(e) => setSubjectId(e.target.value || null)}
      >
        <option value="">Vsi predmeti</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={category ?? ""}
        onChange={(e) =>
          setCategory((e.target.value || null) as DocumentCategory | null)
        }
      >
        <option value="">Vse kategorije</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={professorId ?? ""}
        onChange={(e) => setProfessorId(e.target.value || null)}
      >
        <option value="">Vsi profesorji</option>
        {professors.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title ? `${p.title} ${p.full_name}` : p.full_name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Iskanje po naslovu..."
        className="border border-ink/15 dark:border-chalk/20 rounded-md px-3 py-2 text-sm bg-white dark:bg-chalkboard dark:text-chalk w-full sm:col-span-2 lg:col-span-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}