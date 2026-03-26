# Progress Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Supabase-backed auth and event-sourced progress tracking, then ship a dashboard that visualizes per-grade/per-category accuracy and speed for students and linked parent/teacher viewers.

**Architecture:** Keep the current React single-page flow and add a small Supabase integration layer for auth, writes, and reads. Persist one quiz event row plus per-question item rows so all analytics are computed from underlying events (including "Surprise Me" roll-in). Add a `/dashboard` route that renders either student self-view or parent-selected student analytics based on role and link data.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, Supabase JS v2, Vercel serverless functions

---

### Task 1: Add Supabase Schema, RLS, And Parent-Student Linking

**Skill refs:** `@test-driven-development` (schema assertions), `@verification-before-completion`

**Files:**
- Create: `supabase/migrations/20260325_progress_dashboard.sql`
- Modify: `.env.example`
- Create: `docs/plans/2026-03-25-progress-dashboard-schema-checklist.md`

**Step 1: Add schema verification SQL first (failing until objects exist)**

Add checklist queries to `docs/plans/2026-03-25-progress-dashboard-schema-checklist.md`:

```sql
select to_regclass('public.profiles') as profiles;
select to_regclass('public.student_links') as student_links;
select to_regclass('public.quiz_attempts') as quiz_attempts;
select to_regclass('public.quiz_attempt_items') as quiz_attempt_items;
```

Expected initially: at least one `null`.

**Step 2: Create migration with tables, indexes, and RLS**

Create `supabase/migrations/20260325_progress_dashboard.sql` with:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null check (role in ('student', 'parent_teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.profiles(id) on delete cascade,
  student_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (parent_user_id, student_user_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  grade int not null check (grade between 1 and 5),
  selected_problem_type_id text not null,
  selected_problem_type_name text not null,
  correct_count int not null check (correct_count >= 0),
  question_count int not null check (question_count > 0),
  duration_ms int,
  timer_mode text not null check (timer_mode in ('none', 'per-problem', 'total-quiz')),
  completed_at timestamptz not null default now()
);

create table if not exists public.quiz_attempt_items (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  grade int not null check (grade between 1 and 5),
  problem_type_id text not null,
  problem_type_name text not null,
  question_type text not null,
  question_type_name text not null,
  is_correct boolean not null,
  response_time_ms int,
  position int not null check (position > 0),
  completed_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_completed_idx on public.quiz_attempts (user_id, completed_at desc);
create index if not exists quiz_attempts_user_grade_completed_idx on public.quiz_attempts (user_id, grade, completed_at desc);
create index if not exists quiz_attempt_items_user_grade_question_completed_idx
  on public.quiz_attempt_items (user_id, grade, question_type, completed_at desc);

alter table public.profiles enable row level security;
alter table public.student_links enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_items enable row level security;
```

Then add policies:

- students can access own rows
- parents can read linked student rows
- no parent write access to student attempts/items

**Step 3: Add required env keys to `.env.example`**

Add:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Step 4: Run schema verification checklist**

Run each query in Supabase SQL editor.  
Expected: all tables return non-null relation names and RLS enabled.

**Step 5: Commit**

```bash
git add supabase/migrations/20260325_progress_dashboard.sql .env.example docs/plans/2026-03-25-progress-dashboard-schema-checklist.md
git commit -m "feat(progress): add event schema and RLS policies"
```

### Task 2: Add Supabase Client, Auth Types, And Session Hook

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `src/types/auth.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/hooks/useAuthSession.ts`
- Create: `src/hooks/useAuthSession.test.tsx`

**Step 1: Write failing tests for auth session hook**

Create `src/hooks/useAuthSession.test.tsx` with tests asserting:

- loading -> authenticated state when session exists
- loading -> unauthenticated state when no session
- profile role is exposed (`student` vs `parent_teacher`)

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/hooks/useAuthSession.test.tsx
```

Expected: FAIL because hook/client files do not exist.

**Step 3: Implement minimal auth/session layer**

`src/types/auth.ts`:

```ts
export type UserRole = 'student' | 'parent_teacher';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}
```

`src/lib/supabase/client.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon);
```

`src/hooks/useAuthSession.ts`:

```ts
export function useAuthSession() {
  // reads current session, loads profile by user id, subscribes to auth changes
  // returns { status, session, profile, signIn, signUp, signOut }
}
```

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/hooks/useAuthSession.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/auth.ts src/lib/supabase/client.ts src/hooks/useAuthSession.ts src/hooks/useAuthSession.test.tsx
git commit -m "feat(auth): add supabase session hook and profile types"
```

### Task 3: Add Auth Screen And Dashboard Route Gate

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `src/components/auth/AuthScreen.tsx`
- Create: `src/components/auth/AuthScreen.test.tsx`
- Modify: `src/components/GradeSelector.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `src/App.test.tsx`

**Step 1: Write failing route/auth tests**

Add tests in `src/App.test.tsx`:

- `/dashboard` redirects unauthenticated user to auth screen
- authenticated user can open dashboard route
- grade screen shows Dashboard button in header

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/App.test.tsx src/components/auth/AuthScreen.test.tsx
```

Expected: FAIL because auth UI and route gating are missing.

**Step 3: Implement minimal auth UI + route integration**

`src/components/auth/AuthScreen.tsx`:

```tsx
export function AuthScreen({ onSignIn, onSignUp, loading, error }: Props) {
  return (
    <form>
      {/* email/password fields, sign in + create account actions */}
    </form>
  );
}
```

`src/components/GradeSelector.tsx` add:

```tsx
<button className="dashboard-button" onClick={onOpenDashboard}>
  Dashboard
</button>
```

`src/App.tsx` add screens/routes:

- `auth`
- `dashboard`

and auth checks before entering dashboard.

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/App.test.tsx src/components/auth/AuthScreen.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/auth/AuthScreen.tsx src/components/auth/AuthScreen.test.tsx src/components/GradeSelector.tsx src/App.tsx src/App.test.tsx src/index.css
git commit -m "feat(auth): gate dashboard behind email sign-in"
```

### Task 4: Add Question Attribution Mapper (Including Surprise Roll-In)

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `src/types/progress.ts`
- Create: `src/lib/progress/attribution.ts`
- Create: `src/lib/progress/attribution.test.ts`

**Step 1: Write failing attribution tests**

Test cases:

- regular topic maps to same category id/name
- "Surprise Me" quiz maps each question using underlying `problem.type` / `problem.typeName`
- missing `typeName` falls back to `type`

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/lib/progress/attribution.test.ts
```

Expected: FAIL because attribution module does not exist.

**Step 3: Implement minimal mapper**

`src/lib/progress/attribution.ts`:

```ts
export function toAttemptItem(input: {
  grade: number;
  selectedProblemTypeId: string;
  selectedProblemTypeName: string;
  problemType: string;
  problemTypeName?: string;
  isCorrect: boolean;
  responseTimeMs: number | null;
  position: number;
}) {
  return {
    grade: input.grade,
    questionType: input.problemType,
    questionTypeName: input.problemTypeName ?? input.problemType,
    isCorrect: input.isCorrect,
    responseTimeMs: input.responseTimeMs,
    position: input.position,
  };
}
```

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/lib/progress/attribution.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/progress.ts src/lib/progress/attribution.ts src/lib/progress/attribution.test.ts
git commit -m "feat(progress): add question-level category attribution"
```

### Task 5: Persist Quiz Attempt Events On Completion

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `src/services/progressWriteService.ts`
- Create: `src/services/progressWriteService.test.ts`
- Modify: `src/components/Quiz.tsx`
- Modify: `src/App.tsx`
- Modify: `src/types/timer.ts`

**Step 1: Write failing persistence tests**

Add tests asserting:

- one attempt row payload generated per completion
- 10 attempt items generated with grade/category/timing metadata
- write failure does not block results transition (returns warning state)

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/services/progressWriteService.test.ts
```

Expected: FAIL because write service is missing.

**Step 3: Implement minimal event writer**

`src/services/progressWriteService.ts`:

```ts
export async function recordQuizAttempt(input: RecordQuizAttemptInput): Promise<{ ok: true } | { ok: false; error: string }> {
  // insert into quiz_attempts, then bulk insert quiz_attempt_items
  // return non-throwing result so results screen can render even on failure
}
```

`src/App.tsx`:

- call `recordQuizAttempt` in `handleQuizComplete`
- keep `setQuizResults` immediate
- store transient warning banner state if write fails

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/services/progressWriteService.test.ts src/App.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/progressWriteService.ts src/services/progressWriteService.test.ts src/components/Quiz.tsx src/App.tsx src/types/timer.ts src/App.test.tsx
git commit -m "feat(progress): persist quiz attempts and question events"
```

### Task 6: Build Dashboard Aggregation Query Layer

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `src/services/progressReadService.ts`
- Create: `src/services/progressReadService.test.ts`
- Create: `src/lib/progress/metrics.ts`
- Create: `src/lib/progress/metrics.test.ts`

**Step 1: Write failing aggregate tests**

Cover:

- overall accuracy by time window
- average response speed by grade/category
- attempts count and last-practiced timestamps
- parent-selected student scope propagation

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/services/progressReadService.test.ts src/lib/progress/metrics.test.ts
```

Expected: FAIL because services and metric helpers do not exist.

**Step 3: Implement minimal read and aggregation layer**

`src/services/progressReadService.ts`:

```ts
export async function fetchDashboardSnapshot(params: {
  viewerRole: 'student' | 'parent_teacher';
  viewerUserId: string;
  targetStudentId?: string;
  range: '7d' | '30d' | '90d' | 'all';
  grade?: number;
}) {
  // query attempts + items and map into dashboard DTO
}
```

`src/lib/progress/metrics.ts` should return:

- trend points
- per-category cards
- needs-attention ordering

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/services/progressReadService.test.ts src/lib/progress/metrics.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/progressReadService.ts src/services/progressReadService.test.ts src/lib/progress/metrics.ts src/lib/progress/metrics.test.ts
git commit -m "feat(progress): add dashboard aggregation query layer"
```

### Task 7: Implement Student Dashboard UI

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `src/components/dashboard/DashboardScreen.tsx`
- Create: `src/components/dashboard/DashboardStudentView.tsx`
- Create: `src/components/dashboard/DashboardFilters.tsx`
- Create: `src/components/dashboard/index.ts`
- Create: `src/components/dashboard/DashboardScreen.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Step 1: Write failing dashboard UI tests**

Add tests for:

- loading/empty/error rendering states
- time range and grade filters update displayed metrics
- category cards display accuracy, avg speed, attempts, last practiced

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/components/dashboard/DashboardScreen.test.tsx
```

Expected: FAIL because dashboard components are missing.

**Step 3: Implement minimal student dashboard**

`DashboardScreen` renders:

- header + back button
- filter controls (`7d/30d/90d/all`, grade)
- trend sections
- category cards
- needs-attention list

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/components/dashboard/DashboardScreen.test.tsx src/App.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/dashboard src/App.tsx src/App.test.tsx src/index.css
git commit -m "feat(dashboard): add student progress dashboard"
```

### Task 8: Add Parent Student Creation API And Drill-Down UI

**Skill refs:** `@test-driven-development`

**Files:**
- Create: `api/students/create.ts`
- Create: `src/components/dashboard/StudentPicker.tsx`
- Create: `src/components/dashboard/DashboardParentView.tsx`
- Create: `src/components/dashboard/StudentPicker.test.tsx`
- Create: `src/services/studentRosterService.ts`
- Create: `src/services/studentRosterService.test.ts`
- Modify: `src/components/dashboard/DashboardScreen.tsx`
- Modify: `src/index.css`

**Step 1: Write failing parent flow tests**

Cover:

- parent sees student picker
- selecting a student refreshes dashboard metrics
- empty roster state shows create-student CTA
- API rejects non-parent role

**Step 2: Run tests to confirm failure**

```bash
npm test -- src/components/dashboard/StudentPicker.test.tsx src/services/studentRosterService.test.ts
```

Expected: FAIL because parent UI and roster service are missing.

**Step 3: Implement minimal parent flow**

`api/students/create.ts`:

```ts
export default async function handler(req, res) {
  // verify caller role = parent_teacher
  // create auth user with email/password via service-role client
  // insert profile role=student
  // insert student_links row (parent -> new student)
}
```

`DashboardScreen`:

- if role is `parent_teacher`, render `StudentPicker`
- pass selected `studentUserId` into dashboard read service

**Step 4: Run tests to confirm pass**

```bash
npm test -- src/components/dashboard/StudentPicker.test.tsx src/services/studentRosterService.test.ts src/components/dashboard/DashboardScreen.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add api/students/create.ts src/components/dashboard src/services/studentRosterService.ts src/services/studentRosterService.test.ts src/index.css
git commit -m "feat(dashboard): add parent student management and drill-down"
```

### Task 9: End-To-End Verification And Documentation

**Skill refs:** `@verification-before-completion`, `@requesting-code-review`

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `docs/plans/2026-03-25-progress-dashboard-design.md` (link implementation PR/commit hash section)

**Step 1: Run focused test suites**

```bash
npm test -- src/hooks/useAuthSession.test.tsx src/lib/progress/attribution.test.ts src/services/progressWriteService.test.ts src/services/progressReadService.test.ts src/components/dashboard/DashboardScreen.test.tsx
```

Expected: PASS.

**Step 2: Run full verification**

```bash
npm test
npm run build
```

Expected: PASS.

**Step 3: Update docs**

Add README sections:

- auth setup
- Supabase env variables
- dashboard capabilities (student + parent linked students)

**Step 4: Request code review**

Run required review pass and fix findings before merge.

**Step 5: Commit**

```bash
git add README.md .env.example docs/plans/2026-03-25-progress-dashboard-design.md
git commit -m "docs(progress): document dashboard auth and analytics setup"
```

