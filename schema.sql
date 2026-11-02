-- Initial database schema for Digital Learning Ethiopia.
-- Review security policies with your project administrator before production use.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  preferred_language text not null default 'am' check (preferred_language in ('am','om','en')),
  role text not null default 'student' check (role in ('student','instructor','admin','verifier')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  instructor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title jsonb not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title jsonb not null,
  pass_mark numeric(5,2) not null default 70 check (pass_mark between 0 and 100),
  questions jsonb not null default '[]'::jsonb
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id),
  student_id uuid not null references public.profiles(id),
  score numeric(5,2) not null check (score between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  verification_code text not null unique default encode(gen_random_bytes(16),'hex'),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.exams enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.certificates enable row level security;

-- Minimal safe starting policies: users can read/update their own profile.
create policy "read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Published course catalog is visible to authenticated users.
create policy "read published courses" on public.courses for select to authenticated using (published = true);
-- More role-specific policies and secure certificate verification must be added before production.
