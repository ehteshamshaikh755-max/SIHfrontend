# Capacity Connect — Digital Capacity Building & LMS Portal
### Smart India Hackathon 2026 · Frontend Prototype

A complete, role-aware React frontend covering the full trainer → admin → trainee → gamification loop described in the brief. All data is mocked in-memory (`src/data/mockData.js` + `src/context/AppContext.jsx`) so the whole flow works end-to-end with zero backend.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`). Use the **role switcher** at the bottom of the left sidebar to jump between Trainer, Admin, and Trainee views — that's how a reviewer/judge can see every phase without logging in as three different users.

## What's implemented, by phase

- **Phase 1 — Trainer:** My Courses (CRUD + status), 5-step Create Course wizard (Details → Content → Quiz → Preview → Submit), full Video Upload flow (select, simulated progress, title/description, assign to module, preview, delete/replace).
- **Phase 2 — Admin:** Approval dashboard with review modal (course info, trainer, video preview, modules, submitted date), Approve/Reject with rejection-reason capture, live status badges.
- **Phase 3 — Trainee:** Course listing with search/filters/sort, course details (objectives, modules, trainer, skills, reviews, enroll), learning console (video player, module/lesson list, locked/complete/current states, progress %, prev/next).
- **Phase 4 — Assessment:** MCQ quiz with scoring, pass/fail against a threshold, retry flow, and a completion/congratulations screen with score, credits earned, and certificate availability.
- **Phase 5 — Credits:** Trainee Capacity Credits wallet and Trainer Contribution Credits, both rendered as a **passbook-style ledger** (the app's signature visual device) with running balance and transaction history.
- **Phase 6 — Rewards:** Redeemable marketplace, confirm-redemption modal showing balance before/after, and redemption history table.
- **Phase 7 — Gamification:** Achievement badges (earned/locked states) and a two-tab leaderboard (Top Learners / Top Trainers).
- **Phase 8 — Certificates:** My Certificates gallery with view (rendered certificate), download (simulated), and verify actions.
- **Phase 9 — Competency:** My Skills radial/bar view of competency percentages plus a "Recommended Next Skill" callout.
- **Phase 10 — Analytics:** Trainer Analytics (learners, completions, completion %, avg quiz score, rating, credits) and Admin Analytics (trainees, trainers, courses, pending, completion rate, credits distributed/redeemed, most popular courses, top trainers/learners).

## Design system

- **Palette:** deep navy (`--navy-deep`), saffron accent (`--saffron`), teal secondary (`--teal`), coral for alerts, cool paper background — a civic-but-modern identity rather than a generic SaaS look.
- **Type:** Fraunces (display headings), Inter (UI/body), IBM Plex Mono (data, credits, dates) — the mono face ties directly into the ledger/passbook motif.
- **Signature element:** Capacity Credits are shown as an Indian bank-passbook-style ledger (`.ledger` component) instead of a generic wallet card, grounding the gamification system in something concrete.

## Project structure

```
src/
  components/     shared UI (cards, badges, modal, layout/sidebar)
  context/        AppContext.jsx — role switching + all mutable state
  data/           mockData.js — all mock content
  pages/
    trainer/      My Courses, Create Course wizard, Credits, Analytics
    admin/        Approval Dashboard, Platform Analytics
    trainee/      Course Listing, Course Details, Learning, Quiz, Completion
    shared/       Credit Wallet, Rewards, Achievements, Leaderboard, Certificates, Skills
  styles/         tokens.css (design tokens), global.css (all component styles)
```

## Notes for wiring up a real backend

- Replace `AppContext.jsx`'s in-memory state with API calls (course CRUD, enrollment, quiz submission, credit ledger, redemption) — the component layer already expects the same shapes, so this is mostly a swap at the context layer.
- Video upload currently simulates progress client-side; swap `VideoUploadModal`'s interval-based progress for real `XMLHttpRequest`/`fetch` upload-progress events against your media/storage service.
- Auth/role detection should replace the demo role-switcher in the sidebar.
