-- ============================================================
-- FMF Materials Database — Supabase/Postgres schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- FACULTIES ---------------------------------------------------
create table faculties (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz default now()
);

-- MAJORS (smeri) ------------------------------------------------
create table majors (
  id uuid primary key default uuid_generate_v4(),
  faculty_id uuid not null references faculties(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (faculty_id, name)
);

-- SUBJECTS (predmeti) -------------------------------------------
create table subjects (
  id uuid primary key default uuid_generate_v4(),
  major_id uuid not null references majors(id) on delete cascade,
  name text not null,
  year smallint,            -- 1,2,3... which year of study
  semester smallint,        -- 1 = winter, 2 = summer
  created_at timestamptz default now(),
  unique (major_id, name)
);

-- PROFESSORS ------------------------------------------------------
create table professors (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  title text,                -- "doc. dr.", "prof. dr.", assistant, etc.
  created_at timestamptz default now(),
  unique (full_name)
);

-- SUBJECT <-> PROFESSOR history (who taught what, when) -----------
-- Optional but useful: professors change subjects over the years.
create table subject_professors (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references subjects(id) on delete cascade,
  professor_id uuid not null references professors(id) on delete cascade,
  year_from smallint,
  year_to smallint,          -- null = still teaching it
  created_at timestamptz default now()
);

-- DOCUMENT CATEGORY enum -------------------------------------------
create type document_category as enum (
  'izpit',        -- exam
  'kolokvij',     -- midterm
  'vaje',         -- exercises/tutorials
  'literatura',   -- literature/notes/textbook
  'projekt',      -- project
  'drugo'         -- other
);

create type document_status as enum ('pending', 'approved', 'rejected');

-- DOCUMENTS -----------------------------------------------------------
-- The core table. Professor is attached HERE, not to subject,
-- because the same subject may have had different professors
-- across years, and a document belongs to whoever gave that
-- specific exam/material.
create table documents (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references subjects(id) on delete cascade,
  professor_id uuid references professors(id) on delete set null,
  category document_category not null,
  title text not null,
  academic_year text,          -- e.g. "2023/2024"
  file_url text not null,      -- Supabase storage path or public URL
  file_size_bytes bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  status document_status not null default 'pending',
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamptz default now()
);

create index idx_documents_subject on documents(subject_id);
create index idx_documents_professor on documents(professor_id);
create index idx_documents_category on documents(category);
create index idx_subjects_major on subjects(major_id);
create index idx_majors_faculty on majors(faculty_id);

-- REPORTS / FLAGS -------------------------------------------------
create table document_reports (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  reported_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table documents enable row level security;
alter table document_reports enable row level security;

-- Anyone (even anon) can read approved documents
create policy "public read approved documents"
  on documents for select
  using (status = 'approved');

-- Logged-in users can insert (goes in as 'pending')
create policy "authenticated users can upload"
  on documents for insert
  to authenticated
  with check (auth.uid() = uploaded_by and status = 'pending');

-- Users can see their own pending/rejected uploads too
create policy "users can view own uploads"
  on documents for select
  to authenticated
  using (uploaded_by = auth.uid());

-- Reports: any authenticated user can create, no public read
create policy "authenticated users can report"
  on document_reports for insert
  to authenticated
  with check (reported_by = auth.uid());
