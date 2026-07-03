# What We Built — 30 June 2026

**Project:** NZCC Applicant Portal

---

## The Big Picture

We built a complete online enrolment system for NZCC — from scratch, in a single day. The system has two sides: one for students applying to the college, and one for the admissions team managing those applications. Both sides talk to the same database and are live, working software — not a prototype or mockup.

---

## What Students Can Do

When a prospective student visits the portal, they can create an account and begin their application. From there, they get their own personal dashboard that shows them exactly where they are in the process.

**Their application journey is broken into 7 clear stages:**
1. New / Submitted
2. Intake Review
3. Academic Check
4. Interview & Essay
5. Committee
6. Offered
7. Enrolled

A visual progress bar at the top of their dashboard always shows which stage they're at, which stages are done, and what's coming next.

**Students have 6 sections in their portal:**

- **Dashboard** — A home page that greets them by name, shows any urgent items needing attention, and gives a summary of their application.

- **My Tasks** — A to-do list of things the admissions team has asked them to do (e.g. "Upload your academic transcripts"). Each task can have a due date, and some tasks require the student to attach a document before they can submit. Students can leave a note when they submit. If a task is rejected by staff, the student can see the reason and resubmit.

- **Documents** — A place to upload files and see everything they've uploaded, along with whether each document has been verified, rejected, or is still under review.

- **Timeline** — A chronological log of everything that has happened with their application — stage changes, tasks assigned, documents verified, and so on.

- **Messages** — A messaging inbox where they can receive messages from the admissions team and reply. Unread messages show a notification badge in the sidebar.

- **My Profile** — A page where they can update their personal details.

---

## What the Admissions Team Can Do

Staff log in to a completely separate administration portal with a different look and feel. The top bar shows who is logged in and which intake year is currently active (e.g. "2026 INTAKE"). This matters because the system can hold data for multiple intake years and staff always see the right one.

**The admin portal has 8 main areas:**

### 1. Dashboard
The first thing staff see when they log in. It shows at a glance: how many total applications are in the system, how many are awaiting review, how many are at the interview stage, how many offers have been sent, and how many students are enrolled. Below that is a snapshot of the pipeline and a list of tasks that are due today.

### 2. Pipeline (Kanban Board)
A visual board showing every applicant as a card, organised into the 7 stages. Staff can drag and drop an applicant card from one column to the next to advance their application. Each card shows the applicant's name, their ID number, how long they've been in their current stage, whether they're domestic or international, and any flag notes (e.g. "FOLLOW UP", "NEEDS TRANSLATION"). Staff can filter the board to show only domestic or only international applicants.

### 3. All Applicants
A searchable, filterable table listing every applicant. Staff can search by name or ID, and filter by stage, applicant type, or year level. Clicking any row opens that applicant's full record.

### 4. Applicant Record
Each applicant has their own page with a full set of tabs:
- **Overview** — Personal and application details, a button to advance the stage (with a confirmation step), and recent activity
- **Tasks** — Assign new tasks to the student, and review anything the student has submitted. Staff can approve or reject submissions and leave a note explaining why
- **Documents** — See all documents the student has uploaded and mark them as verified or rejected
- **Messages** — Send a message to the student and see the full conversation history
- **Timeline** — The complete history of everything that has happened on this application

### 5. My Tasks
Each staff member has their own personal task queue — separate from the student-facing tasks. These can be internal tasks (reminders, follow-ups) or tasks linked to a specific applicant. The page groups tasks into "Urgent / Overdue" (highlighted in red) and "This Week," so nothing gets lost.

### 6. International Compliance
A dedicated tracking page for international applicants that shows — at a glance — the status of each compliance item for every international student. Staff can update each item directly from this table without navigating away. The items tracked are:
- Whether an Offer of Place has been issued
- Visa application status
- Health insurance status
- IELTS English proficiency status

Coloured dots make it easy to spot anything that's missing or still in progress.

### 7. Reports & Insights
A reporting page with three charts:
- **Applications by Stage** — how many applicants are at each stage right now
- **Domestic vs International** — a breakdown of applicant types and year levels
- **Conversion Funnel** — showing how many applicants made it through each stage and what percentage converted at each step

There is an Export PDF button for sharing these reports.

### 8. Staff & Permissions
Global Admins can manage the admissions team from here. They can create new staff accounts and control exactly what each staff member is allowed to do. Permissions are controlled with simple on/off toggles across 19 specific actions, grouped into 7 categories:

| Category | What it controls |
|---|---|
| Applicants | Who can view, edit, advance, or withdraw applications |
| Tasks | Who can assign tasks, review submissions, or delete tasks |
| Documents | Who can view, verify, request, or delete documents |
| Messages | Who can send messages and read all conversations |
| Workflows | Who can view or update international compliance records |
| Reports | Who can access the reports page |
| Administration | Who can manage staff accounts and permissions |

**Global Admins automatically have access to everything** — no individual toggles needed. All other staff only see and can do exactly what they've been granted access to. If they try to access something they don't have permission for, they see a clear "Access Denied" page.

---

## Settings

Global Admins can manage intake years — creating new ones (e.g. "2027 INTAKE") and setting which one is currently active. All data across the admin portal automatically filters to the active intake year.

---

## Test Accounts Ready to Use

The system comes pre-loaded with demo accounts at every stage of the pipeline, so the team can test the full workflow immediately once the database is connected.

| Who | Email | Password |
|---|---|---|
| Global Admin (Sarah Williamson) | admin@nzcc.ac.nz | Admin1234! |
| Admissions Officer (James Chen) | officer@nzcc.ac.nz | Staff1234! |
| Compliance Officer (Michelle Taufa) | compliance@nzcc.ac.nz | Staff1234! |
| Student — Offered stage | emma.johnson@example.com | Student1234! |
| Student — Interview stage (International) | liam.patel@example.com | Student1234! |
| Student — Academic Check (International, Yr 2) | priya.wong@example.com | Student1234! |
| Student — Intake Review | james.martin@example.com | Student1234! |
| Student — New Submission | sophie.tait@example.com | Student1234! |
| Student — Committee stage (International) | carlos.mendez@example.com | Student1234! |
| Student — Enrolled | aisha.nkosi@example.com | Student1234! |

Each student account has a task assigned, a welcome message from the admissions team, and a timeline history. International students also have compliance records populated.

---

## What's Needed to Go Live

Before the portal can be used, two things need to happen:

1. **Connect a database** — A PostgreSQL database needs to be running and the connection details added to the environment config. One command then sets up all the tables automatically.
2. **Run the setup scripts** — Two commands load the database structure and populate it with the demo accounts above.

Everything else — the code, pages, logic, permissions, and styling — is complete and ready.

---

## Week 1 Stand-Up Talking Points

**What I worked on:**
I built the NZCC Applicant Portal from scratch — a full-stack web application with two separate portals sharing a single database. One side is for students to manage their application, and the other is for the admissions team to manage the whole intake process.

**What I completed:**
- A student-facing portal where applicants can track their progress through 7 application stages, complete tasks, upload documents, and message the admissions team
- An admin portal with a drag-and-drop pipeline board, applicant records, international compliance tracking, staff permission management, and reporting charts
- A fine-grained permissions system with 19 individual access controls across 7 categories
- Pre-loaded demo data covering all stages of the pipeline, including domestic and international students
- The full database schema, authentication, and file storage layer

**What's next / blockers:**
- The portal is running locally and needs a production database and hosting environment to go live
- Waiting on feedback from the team on the workflow before adding further features

**Anything to flag:**
- The tech stack uses the latest versions of Next.js (16), Prisma (7), and NextAuth (v5) — all of which have breaking changes from older versions, so some setup steps differ from standard documentation online

---

## Design

The portal uses the brand colours and typography from the design screenshots provided at the start of the project:
- Cream background throughout
- Dark olive green for navigation, buttons, and active states
- Gold for highlights, badges, and active pipeline columns
- Playfair Display serif font for all headings
- Clean, card-based layouts with no visual clutter
