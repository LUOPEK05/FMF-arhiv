"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Major, Subject, Professor, DocumentCategory, StudyLevel } from "@/types/database";

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "izpit", label: "Izpit" },
  { value: "kolokvij", label: "Kolokvij" },
  { value: "vaje", label: "Vaje" },
  { value: "literatura", label: "Literatura" },
  { value: "projekt", label: "Projekt" },
  { value: "drugo", label: "Drugo" },
];

const LEVELS: { value: StudyLevel; label: string; years: number[] }[] = [
  { value: "dodiplomski", label: "Dodiplomski", years: [1, 2, 3] },
  { value: "magistrski", label: "Magistrski", years: [1, 2] },
  { value: "doktorski", label: "Doktorski", years: [1, 2, 3] },
];

const MAX_FILE_MB = 25;

export default function UploadPage() {
  const supabase = createClient();

  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);

  const [majorId, setMajorId] = useState("");
  const [level, setLevel] = useState<StudyLevel | "">("");
  const [year, setYear] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("izpit");
  const [title, setTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase
      .from("majors")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("Napaka pri nalaganju smeri:", error);
        setMajors(data ?? []);
      });
    supabase
      .from("professors")
      .select("*")
      .order("full_name")
      .then(({ data, error }) => {
        if (error) console.error("Napaka pri nalaganju profesorjev:", error);
        setProfessors(data ?? []);
      });
  }, []);

  useEffect(() => {
    setLevel("");
    setYear("");
    setSubjectId("");
    setSubjects([]);
  }, [majorId]);

  useEffect(() => {
    setYear("");
    setSubjectId("");
  }, [level]);

  useEffect(() => {
    setSubjectId("");
    if (!majorId || !level || !year) return setSubjects([]);
    supabase
      .from("subjects")
      .select("*")
      .eq("major_id", majorId)
      .eq("level", level)
      .eq("year", year)
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("Napaka pri nalaganju predmetov:", error);
        setSubjects(data ?? []);
      });
  }, [majorId, level, year]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Prijaviti se moraš, da lahko naložiš gradivo.");
      return;
    }
    if (!file) {
      setErrorMsg("Izberi datoteko.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMsg(`Datoteka je prevelika (max ${MAX_FILE_MB}MB).`);
      return;
    }
    if (!subjectId) {
      setErrorMsg("Izberi predmet.");
      return;
    }

    setStatus("uploading");

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file);

    if (uploadError) {
      setStatus("error");
      setErrorMsg(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(path);

    const { error: insertError } = await (supabase.from("documents") as any).insert({
      subject_id: subjectId,
      professor_id: professorId || null,
      category,
      title: title || file.name,
      academic_year: academicYear || null,
      file_url: publicUrlData.publicUrl,
      file_size_bytes: file.size,
      uploaded_by: user.id,
      status: "pending",
    });

    if (insertError) {
      setStatus("error");
      setErrorMsg(insertError.message);
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-xl font-bold mb-2">Hvala za prispevek! 🎉</h1>
        <p className="text-ink/60 dark:text-chalk/60 text-sm">
          Tvoje gradivo čaka na pregled in bo kmalu vidno vsem.
        </p>
      </div>
    );
  }

  const selectClass =
    "border border-ink/15 dark:border-chalk/20 rounded-md px-3 py-2 text-sm w-full bg-white dark:bg-chalkboard dark:text-chalk disabled:bg-ink/5 dark:disabled:bg-chalk/5 disabled:text-ink/30 dark:disabled:text-chalk/30";

  const availableYears = LEVELS.find((l) => l.value === level)?.years ?? [];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Naloži gradivo</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Smer</label>
          <select
            className={selectClass}
            value={majorId}
            onChange={(e) => setMajorId(e.target.value)}
            required
          >
            <option value="">Izberi smer</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Stopnja</label>
          <select
            className={selectClass}
            value={level}
            onChange={(e) => setLevel(e.target.value as StudyLevel)}
            disabled={!majorId}
            required
          >
            <option value="">Izberi stopnjo</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Letnik</label>
          <select
            className={selectClass}
            value={year}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
            disabled={!level}
            required
          >
            <option value="">Izberi letnik</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}. letnik
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Predmet</label>
          <select
            className={selectClass}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={!year}
            required
          >
            <option value="">Izberi predmet</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Kategorija</label>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Profesor (neobvezno)</label>
          <select
            className={selectClass}
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
          >
            <option value="">Ni določeno</option>
            {professors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title ? `${p.title} ${p.full_name}` : p.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Naslov</label>
          <input
            className={selectClass}
            type="text"
            placeholder="npr. Izpit - januar 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Šolsko leto (neobvezno)</label>
          <input
            className={selectClass}
            type="text"
            placeholder="npr. 2023/2024"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            Datoteka (PDF, max {MAX_FILE_MB}MB)
          </label>
          <input
            className={selectClass}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>

        {errorMsg && <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "uploading"}
          className="w-full bg-ink text-paper dark:bg-chalk dark:text-chalkboardDark rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {status === "uploading" ? "Nalagam..." : "Naloži"}
        </button>
      </form>
    </div>
  );
}