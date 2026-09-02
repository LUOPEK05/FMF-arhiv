# FMF Gradivo

A site for students to upload/download exams, midterms, exercises, and
literature — filterable by major → subject → category → professor.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth + Storage)
- Deploy target: Vercel

## Setup

1. **Create a Supabase project** at supabase.com (free tier is enough to start).

2. **Run the schema**: open the SQL editor in your Supabase dashboard and run
   `sql/schema.sql`. This creates all tables, the category enum, indexes,
   and row-level security policies.

3. **Create a storage bucket** named `documents`:
   - Supabase dashboard → Storage → New bucket → name it `documents`
   - Make it public (simplest for now — files are downloadable by link)
   - Add a storage policy allowing `authenticated` users to `insert` into it.

4. **Enable email OTP / magic link auth** (on by default in Supabase Auth).
   If you want to restrict signups to your faculty's email domain, add
   a check in `app/login/page.tsx` before calling `signInWithOtp`, or
   configure an allowed-domains policy in Supabase Auth settings.

5. **Seed some initial data** (faculties/majors/subjects/professors) —
   either directly in the Supabase table editor, or write a seed script.
   Example:
   ```sql
   insert into faculties (name) values ('FMF');
   insert into majors (faculty_id, name)
     select id, 'Matematika' from faculties where name = 'FMF';
   -- etc.
   ```

6. **Copy `.env.example` to `.env.local`** and fill in your project's
   URL and anon key (Supabase dashboard → Project Settings → API).

7. **Install and run locally**:
   ```bash
   npm install
   npm run dev
   ```

8. **Deploy to Vercel**: connect the repo, add the same two env vars
   in the Vercel project settings, deploy.

## How filtering/professor-linking works

- `documents.professor_id` is attached to each document directly —
  not to the subject — because professors change subjects over time.
  Filtering by professor works no matter what they currently teach.
- `subject_professors` is an optional history table you can use to show
  "who has taught this subject over the years" on a subject page, and
  to narrow the professor dropdown when uploading/filtering a specific
  subject.

## Moderation

Uploads insert as `status = 'pending'` and are NOT publicly visible
until approved (RLS only allows public `select` on `status = 'approved'`).
To approve documents, flip the status in the Supabase table editor, or
build a small `/admin` page later that lists pending docs with an
approve/reject button (query `documents` where `status = 'pending'`,
update to `'approved'`).

## Next steps / ideas not yet built
- Admin moderation UI (currently: use Supabase table editor directly)
- Upvote/downvote buttons on documents
- Report/flag button per document
- Full-text search across titles
- Per-subject page showing professor history
