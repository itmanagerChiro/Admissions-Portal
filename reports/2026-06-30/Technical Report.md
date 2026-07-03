# Build Report — 30 June 2026

**Project:** NZCC Applicant Portal
**Stack:** Next.js 16.2.9 · TypeScript · PostgreSQL · Prisma 7 · NextAuth v5 · Tailwind CSS v4

---

## Summary

Full-stack student enrolment portal built from greenfield. The system has two separate portals — a student-facing application workflow and a staff administration portal — sharing a single PostgreSQL database via Prisma ORM. Authentication uses NextAuth v5 with JWT sessions. Staff access is governed by a 19-key fine-grained permission system with a Global Admin shortcut.

---

## Foundation & Infrastructure

- **Next.js App Router project** scaffolded with TypeScript, Tailwind CSS v4, and three route groups: `(auth)`, `(student)`, `(admin)`
- **Prisma 7 schema** with 20+ models and enums including: User, IntakeYear, Application, Task, StaffTask, Document, MessageThread, Message, TimelineEvent, StaffPermission, InternationalCompliance, ApplicationStageHistory
- **Tailwind CSS v4 theme** configured via `@theme {}` in globals.css (no config file) — custom colour tokens: cream, olive, olive-dark, gold, muted, red-flag
- **Fonts:** Playfair Display (headings) + Inter (body) via `next/font/google`
- **Prisma singleton** (`src/lib/prisma.ts`) using `@prisma/adapter-pg` driver adapter (required by Prisma 7)
- **`prisma.config.ts`** with `datasource.url` moved out of schema.prisma (Prisma 7 breaking change)
- **NextAuth v5** credentials provider with JWT strategy; session carries id, role, isGlobalAdmin, permissions[], firstName, lastName
- **Session type augmentation** (`src/types/next-auth.d.ts`) for typed session access throughout the app
- **Middleware** (`src/middleware.ts`) for role-based route protection — unauthenticated → /login, STAFF → /admin, STUDENT blocked from /admin
- **Permission helpers** (`src/lib/permissions.ts`): `hasPermission`, `requirePermission` (redirect), `permissionGuard` (API 403 response)
- **Storage abstraction** (`src/lib/storage.ts`): `StorageProvider` interface + `LocalStorageProvider` writing to `/uploads/`
- **Timeline helper** (`src/lib/timeline.ts`): `createTimelineEvent()`, `STAGE_LABELS`, `STAGE_ORDER`
- **Environment config:** `.env` and `.env.local` with DATABASE_URL, AUTH_SECRET, STORAGE_PROVIDER

---

## UI Component Library (`src/components/ui/`)

| Component | Variants / Features |
|---|---|
| `Button.tsx` | primary / secondary / ghost / danger · sm/md/lg · isLoading spinner |
| `Badge.tsx` | olive / gold / red / muted / green / blue / purple / outline |
| `Card.tsx` | CardHeader + CardBody sub-components |
| `Input.tsx` | forwardRef, label, error message support |
| `Modal.tsx` | Escape key close, backdrop click close |

---

## Student Portal

### Layout & Navigation
- **`StudentSidebar.tsx`** — grouped nav: My Application (Dashboard, My Tasks w/badge, Documents, Timeline), Communication (Messages w/badge), My Details (Profile); sign out button
- **`(student)/layout.tsx`** — fetches pending task count + unread message count for sidebar badges; redirects non-students
- **`ProgressTracker.tsx`** — 7-step horizontal stepper: completed = dark olive filled circle + tick, active = gold diamond, pending = empty circle with number

### Pages
| Page | Route | Key Features |
|---|---|---|
| Dashboard | `/dashboard` | Greeting, alert banner, ProgressTracker, task cards grid, application summary |
| My Tasks | `/tasks` | Task list with status badges and due dates |
| Task Detail | `/tasks/[taskId]` | Full description, document upload if required, student note, submit button; re-submission on REJECTED |
| Documents | `/documents` | Upload form + document library table with status badges |
| Timeline | `/timeline` | Vertical event list filtered to `isVisibleToStudent = true` |
| Messages | `/messages` | Thread list with unread dot, subject, sender preview |
| Thread | `/messages/[threadId]` | Alternating staff/student message bubbles, reply box |
| Profile | `/profile` | Editable personal details form |

### Student API Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/student/register` | POST | Create student account + empty application |
| `/api/student/profile` | PATCH | Update personal details |
| `/api/student/tasks/[taskId]` | PATCH | Submit task (with student note) |
| `/api/student/documents` | POST | Upload document (multipart) |
| `/api/student/messages/[threadId]` | POST | Reply to message thread |
| `/api/files/[...key]` | GET | Auth-gated file serving proxy |

---

## Admin Portal

### Layout & Navigation
- **`AdminSidebar.tsx`** — grouped nav: OVERVIEW (Dashboard, Pipeline), APPLICANTS (All Applicants, My Tasks w/badge), WORKFLOWS (International w/badge), REPORTS, ADMINISTRATION (Staff, Settings — global admin only)
- **`(admin)/layout.tsx`** — dark olive-dark top bar with "NZCC Admissions ADMIN" branding, staff name, active intake year badge; cream sidebar; fetches pending staff task count and international attention count

### Pages
| Page | Route | Permission Required |
|---|---|---|
| Dashboard | `/admin` | Any STAFF |
| Pipeline | `/admin/pipeline` | VIEW_APPLICANTS |
| All Applicants | `/admin/applicants` | VIEW_APPLICANTS |
| Applicant Detail | `/admin/applicants/[id]` | VIEW_APPLICANTS |
| Applicant Tasks | `/admin/applicants/[id]/tasks` | VIEW_APPLICANTS |
| Applicant Documents | `/admin/applicants/[id]/documents` | VIEW_DOCUMENTS |
| Applicant Messages | `/admin/applicants/[id]/messages` | VIEW_ALL_MESSAGES |
| Applicant Timeline | `/admin/applicants/[id]/timeline` | VIEW_APPLICANTS |
| My Tasks | `/admin/tasks` | MANAGE_OWN_TASKS |
| International | `/admin/international` | VIEW_INTERNATIONAL |
| Reports | `/admin/reports` | VIEW_REPORTS |
| Staff Management | `/admin/staff` | MANAGE_STAFF_USERS |
| Permission Matrix | `/admin/staff/[staffId]` | MANAGE_PERMISSIONS |
| Settings | `/admin/settings` | Global Admin only |
| Access Denied | `/admin/403` | — |

### Admin Page Detail

**Dashboard** — 5 metric cards (Total/Awaiting/Interview/Offers/Enrolled), pipeline snapshot strip (7 columns, 3 cards each), today's priority tasks list, EXPORT CSV button

**Pipeline** — Full-width Kanban board with 7 stage columns; HTML5 drag-and-drop between columns to advance stage (calls `/api/admin/applicants/[id]/stage`); filter buttons (ALL/DOMESTIC/INTERNATIONAL); applicant cards show name, number, days since update, category/year badges, flag note

**All Applicants** — Searchable/filterable table with columns: Name, ID, Type, Year, Stage badge, Flags, Last Updated, Open link

**Applicant Detail** — Header with name/number/category/stage, StageAdvancer modal (confirm before advancing), 2-column overview grid, sub-page navigation tabs

**Applicant Tasks** — AssignTaskForm (title, description, due date, required toggle, document instructions) + task list with TaskReviewPanel for SUBMITTED tasks (student note, document links, review note, approve/reject buttons)

**Applicant Documents** — Document list with status icon, filename, type, upload date, VIEW link, DocumentVerifyButtons (verify/reject) for PENDING_REVIEW documents

**Applicant Messages** — ComposeMessageForm (subject + body) + thread history with alternating staff/student message bubbles

**My Tasks** — Staff's own task queue grouped into: Urgent (overdue, red accent), This Week, Upcoming. AddStaffTaskForm for internal tasks. Each row shows task title, description, applicant link, due date badge

**International Compliance** — Table of all international applicants with inline-editable dropdowns for: Offer of Place (bool toggle), Visa Status (NOT_YET/APPLIED/RECEIVED), Health Insurance (NOT_YET/CONFIRMED), IELTS (NOT_YET/IN_PROGRESS/CONFIRMED/WAIVED/REQUIRED). Colour-coded status dots

**Reports** — Three recharts visualisations: Applications by Stage (horizontal bar), Domestic vs International breakdown (horizontal bar), Conversion Funnel (custom progress bars with % conversion). EXPORT PDF button

**Staff Management** — Staff list with name, email, Global Admin badge, active status; CreateStaffForm (first name, last name, email, temporary password, global admin toggle)

**Permission Matrix** — 19 permissions grouped into 7 sections (Applicants, Tasks, Documents, Messages, Workflows, Reports, Administration) with toggle switches per permission. Saves atomically via PUT. Global Admins shown as read-only with "all permissions granted" notice

**Settings** — Intake year list with active badge and "Set active" button; create new intake year form

### Admin API Routes
| Route | Method | Permission |
|---|---|---|
| `/api/admin/applicants/[id]/stage` | POST | ADVANCE_APPLICATION_STAGE |
| `/api/admin/applicants/[id]/tasks` | POST | ASSIGN_TASKS |
| `/api/admin/applicants/[id]/tasks/[taskId]` | PATCH | REVIEW_TASK_SUBMISSIONS |
| `/api/admin/applicants/[id]/documents/[docId]` | PATCH | VERIFY_DOCUMENTS |
| `/api/admin/applicants/[id]/messages` | POST | SEND_MESSAGES |
| `/api/admin/applicants/[id]/international` | PATCH | EDIT_INTERNATIONAL |
| `/api/admin/staff` | POST | MANAGE_STAFF_USERS |
| `/api/admin/staff/[staffId]/permissions` | GET + PUT | MANAGE_PERMISSIONS |
| `/api/admin/staff/tasks` | POST | MANAGE_OWN_TASKS |
| `/api/admin/intake-years` | POST | Global Admin |
| `/api/admin/intake-years/[id]/activate` | POST | Global Admin |

---

## Permissions System

**19 permission keys** across 7 groups:

| Group | Keys |
|---|---|
| Applicants | VIEW_APPLICANTS, EDIT_APPLICANT_PROFILE, ADVANCE_APPLICATION_STAGE, WITHDRAW_APPLICATION |
| Tasks | ASSIGN_TASKS, REVIEW_TASK_SUBMISSIONS, DELETE_TASKS, MANAGE_OWN_TASKS |
| Documents | REQUEST_DOCUMENTS, VIEW_DOCUMENTS, VERIFY_DOCUMENTS, DELETE_DOCUMENTS |
| Messages | SEND_MESSAGES, VIEW_ALL_MESSAGES |
| Workflows | VIEW_INTERNATIONAL, EDIT_INTERNATIONAL |
| Reports | VIEW_REPORTS |
| Administration | MANAGE_STAFF_USERS, MANAGE_PERMISSIONS |

Global Admin (`isGlobalAdmin = true`) bypasses all permission checks. Permissions are embedded in the JWT at login for fast server-side checks. Every admin page calls `requirePermission()` (server components) or `permissionGuard()` (API routes).

---

## Seed Data (`prisma/seed.ts`)

| Account | Email | Password | Role |
|---|---|---|---|
| Global Admin | admin@nzcc.ac.nz | Admin1234! | Staff / Global Admin |
| Admissions Officer | officer@nzcc.ac.nz | Staff1234! | Staff (8 permissions) |
| Compliance Officer | compliance@nzcc.ac.nz | Staff1234! | Staff (5 permissions) |
| Student (Offered) | emma.johnson@example.com | Student1234! | Student |
| Student (Interview) | liam.patel@example.com | Student1234! | Student (International) |
| Student (Academic Check) | priya.wong@example.com | Student1234! | Student (International, Year 2) |
| Student (Intake Review) | james.martin@example.com | Student1234! | Student |
| Student (New Submitted) | sophie.tait@example.com | Student1234! | Student |
| Student (Committee) | carlos.mendez@example.com | Student1234! | Student (International) |
| Student (Enrolled) | aisha.nkosi@example.com | Student1234! | Student |

Each student account includes: an application at the relevant stage, at least one task, a welcome message thread, a timeline event, and international compliance records where applicable.

---

## To Run the Project

Requirements: PostgreSQL running locally, Node.js 20

```bash
cd nzcc-portal

# Run database migration (first time)
npx prisma migrate dev --name init

# Seed with demo data
npm run seed

# Start development server
npm run dev
```

Access at `http://localhost:3000`

---

## Notable Technical Decisions

- **Prisma 7 adapter pattern** — `PrismaPg` driver adapter required in client constructor; `url` removed from `datasource db {}` in schema; connection URL lives in `prisma.config.ts`
- **Tailwind v4 CSS-first config** — no `tailwind.config.ts`; all custom tokens declared in `@theme {}` block in `globals.css`
- **NextAuth v5 handlers pattern** — `export const { GET, POST } = handlers` from route file
- **Intake year scoping** — all admin queries filtered by `intakeYearId` of the active `IntakeYear` record
- **JWT-cached permissions** — permissions loaded once at login from `StaffPermission` table and stored in JWT; changes take effect at next login
- **HTML5 drag-and-drop pipeline** — native browser API used instead of `@dnd-kit` (already installed but avoided additional complexity); drag between columns fires `POST /api/admin/applicants/[id]/stage`
- **Storage abstraction** — `StorageProvider` interface allows switching between local filesystem and S3 via `STORAGE_PROVIDER` env var without code changes
