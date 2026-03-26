# Progress Dashboard Design

## Summary

Build cloud-backed progress tracking and visualization for Math Bowl so each authenticated user can see performance by grade and category over time, with a dedicated dashboard experience for both students and parent/teacher users.

## Approved Decisions

- Backend/auth stack: Supabase with email/password authentication.
- Progress storage model: event-sourced only (no summary table for V1).
- Audience support: both student and parent/teacher dashboard experiences.
- Progress definition: accuracy + speed.
- Category attribution: roll "Surprise Me" into underlying real categories only.
- Parent/student linking: parent/teacher creates student accounts directly.

## Goals

- Track practice outcomes per user, per grade, and per category at question-level granularity.
- Provide dashboard visualizations for trends in accuracy and solve speed.
- Enable parent/teacher users to securely view linked students' individual results.
- Keep data model flexible for future analytics without changing storage strategy.

## Non-Goals (V1)

- No separate "Surprise Me" category analytics bucket.
- No precomputed summary/materialized analytics tables.
- No cross-parent sharing of student data.

## Architecture

The app will keep React + Vite on the frontend and add Supabase as the auth/data backend. Quiz completion emits event rows to the database:

1. One `quiz_attempts` row per completed quiz.
2. One `quiz_attempt_items` row per question in the quiz.

Dashboard charts/tables query live aggregates directly from event data (with indexes and optional SQL views for readability).

## Data Model

### `profiles`

Purpose: user metadata and role.

- `id uuid primary key` (matches `auth.users.id`)
- `email text not null`
- `display_name text`
- `role text not null check (role in ('student', 'parent_teacher'))`
- `created_at timestamptz default now()`

### `student_links`

Purpose: secure parent/teacher-to-student visibility.

- `id uuid primary key default gen_random_uuid()`
- `parent_user_id uuid not null references profiles(id)`
- `student_user_id uuid not null references profiles(id)`
- `status text not null default 'active'`
- `created_at timestamptz default now()`
- `unique(parent_user_id, student_user_id)`

### `quiz_attempts`

Purpose: quiz-level event envelope.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id)`
- `grade int not null`
- `selected_problem_type_id text not null`
- `selected_problem_type_name text not null`
- `correct_count int not null`
- `question_count int not null`
- `duration_ms int` (null if timer off)
- `timer_mode text not null` (`none`, `per-problem`, `total-quiz`)
- `completed_at timestamptz not null default now()`

### `quiz_attempt_items`

Purpose: per-question category attribution and timing.

- `id uuid primary key default gen_random_uuid()`
- `attempt_id uuid not null references quiz_attempts(id) on delete cascade`
- `user_id uuid not null references profiles(id)`
- `grade int not null`
- `problem_type_id text not null`
- `problem_type_name text not null`
- `question_type text not null` (from `Problem.type`)
- `question_type_name text not null` (from `Problem.typeName`)
- `is_correct boolean not null`
- `response_time_ms int` (null when unavailable)
- `position int not null` (1-10)
- `completed_at timestamptz not null default now()`

## Attribution Rules

- Quiz-level `selected_problem_type_*` is session metadata only.
- All analytics group by per-question category (`question_type`/`question_type_name`, with grade).
- "Surprise Me" never appears as an analytics category.
- Every surprise-generated question contributes to its underlying real category.

## Security (RLS)

### Student

- Can read/write only own profile and own quiz events.

### Parent/Teacher

- Can read own profile.
- Can read student quiz events only when linked via `student_links`.
- Cannot write quiz events on behalf of students.

### Service Endpoint

- Student account creation by parent/teacher uses a protected server route with service-role key.
- Service key never exposed to browser client.

## UX and Navigation

### Routes

- Add `/dashboard` as top-level route.
- Unauthenticated users attempting `/dashboard` are sent to auth and redirected back after sign-in.

### Dashboard Controls

- Time range filters: `7d`, `30d`, `90d`, `All`.
- Grade filter: all or single grade.
- Category options follow grade scope.

### Student View

- Practice streak and quizzes completed stats.
- Accuracy trend visualization.
- Average solve-time trend visualization.
- Category cards: accuracy, avg seconds/question, attempts, last practiced.
- Needs-attention section for low-performing categories with meaningful attempt volume.

### Parent/Teacher View

- Linked-student picker.
- Individual student overview dashboard.
- Grade-by-category matrix with accuracy, avg time, attempt count, recent deltas.
- Recent attempts feed with drill-down per quiz and question outcome/timing.

## Query Strategy

- Event-sourced aggregates with indexed filters by user, grade, category, and time window.
- Optional SQL views to simplify frontend query code.
- Parent queries always scoped by selected linked student id.

## Error Handling and Data Quality

- Results screen is not blocked by analytics write failures.
- On write failure, attempt one background retry and surface non-blocking warning if needed.
- Validate grade/category/timing ranges before insert.
- Ensure item count matches quiz size before persisting.
- Dashboard states: loading, empty, partial warning, hard error with retry.

## Testing Strategy

- Unit tests:
  - category attribution, including Surprise Me roll-in behavior
  - aggregate calculations for accuracy/speed across time windows
  - role-sensitive dashboard selectors
- Integration tests:
  - quiz completion writes both attempts and item rows
  - dashboard filters (time/grade/category) return expected values
  - parent can access linked students and cannot access unlinked students
- RLS verification:
  - explicit tests/scripts for policy read/write boundaries

## Rollout Plan

1. Supabase auth + profiles + event write pipeline from quiz completion.
2. Student dashboard with accuracy/speed/category visualizations.
3. Parent student creation flow + linked student picker + individual drill-down.
4. Performance tuning, visual polish, and QA hardening.

