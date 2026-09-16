# EduPlatform — Frontend

A complete school/college/institute management web app built with **React 19 + Vite + React Router**.

It talks to the Express + MongoDB backend in the `../server` folder.

## Features

- **Role-based access**: admin, teacher, student and parent dashboards with tailored menus.
- **Auth**: institution registration (creates the admin) and login via JWT.
- **Admin**:
  - Analytics dashboard (students per class, attendance split, fee summary, result overview)
  - Full CRUD for students, teachers, parents, classes, subjects
  - Class ↔ Subject ↔ Teacher assignments
  - Exams (create + add subjects with max/passing marks)
  - Marks entry per exam subject
  - Result cards (per student per exam)
  - Attendance sessions + marking
  - Fee structures, invoices and payment recording
  - Announcements with targeting (institution / class / student)
- **Teacher**: dashboard, my-classes attendance, marks entry, announcements.
- **Student**: dashboard (attendance %, subjects, teachers), announcements.
- **Parent**: dashboard of linked children, children fee ledgers, announcements.
- **Notifications** (bell in the top bar + full page) for every role.

## Run

```bash
# 1. Start the backend (from the repo root)
cd server
npm install
npm run dev        # expects MongoDB at the MONGO_URI in server/.env, port 5000

# 2. Start the frontend (new terminal)
cd client
npm install
npm run dev        # http://localhost:5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api/*` to
`http://localhost:5000`, so no CORS setup is needed.

## Notes / known limitations

The backend does **not** expose GET endpoints for some entities (class-subject
assignments, exams, parents list, announcements created by admins). To keep the
workflows usable, the client keeps the IDs of entities created during a browser
session in `localStorage` (`edu_session_entities`). This means:

- Batches created while logged in as an admin are immediately usable in the
  downstream flows (Exams → Marks → Results → Attendance → Fees).
- They are per-browser-session and are **not** reloaded from the server on a
  fresh login (they will appear empty until that admin re-creates them).

Structure:

```
src/
  api/client.js            # fetch wrapper (JWT, JSON, errors)
  context/AuthContext.jsx  # login / register / logout / restore session
  context/SessionStore.jsx # session-scoped entity IDs (localStorage)
  hooks/useFetch.js        # data-fetching hook
  components/              # Layout (sidebar+topbar+notifications), EntityPage, UI kit
  pages/                   # auth + role-specific pages
```