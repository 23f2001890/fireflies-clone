# Fireflight — Meeting Notes & Transcription Platform (Fireflies.ai Clone)

A functional clone of Fireflies.ai's meeting-assistant workflow: a meetings
library, an interactive transcript + player view, AI-style summaries/action
items/topics, and full CRUD for meetings and their contents.

Built for the Scaler SDE Fullstack Assignment.

---

## Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | Next.js 14 (App Router, TypeScript), Tailwind CSS, lucide-react |
| Backend   | FastAPI (Python), SQLAlchemy ORM |
| Database  | SQLite |

Real speech-to-text and real AI summarization are out of scope per the brief.
Meetings are seeded with realistic mock transcripts/summaries, and new
meetings can be created by pasting or uploading a transcript file — the
transcript is parsed into speaker-labelled, timestamped segments, but the
*summary/action items/topics* for user-created meetings are left as
placeholders for the user to fill in (see **Assumptions** below).

---

## Project structure

```
fireflies-clone/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, all routes
│   │   ├── models.py      # SQLAlchemy models (schema)
│   │   ├── schemas.py     # Pydantic request/response schemas
│   │   ├── database.py    # engine/session setup
│   │   └── seed.py        # seeds 3 sample meetings with full data
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx                 # meetings dashboard/library
    │   ├── meetings/[id]/page.tsx   # meeting detail (transcript+player+notes)
    │   └── layout.tsx
    ├── components/                  # Sidebar, Topbar, Player, TranscriptPanel,
    │   ...                          # NotesPanel, modals, Toast
    └── lib/                         # api client + shared types
```

---

## Setup instructions

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed            # seeds 3 sample meetings (idempotent — skips if data exists)
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (interactive docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Visit `http://localhost:3000`.

---

## Architecture overview

- **Backend** is a single FastAPI app (`app/main.py`) exposing a REST API
  over SQLAlchemy models. CORS is open (`*`) since this is a take-home demo.
- **Meeting creation** has three paths, all converging on the same
  `POST /api/meetings` / `POST /api/meetings/upload` endpoints:
  1. Paste a transcript as text (parsed server-side into segments)
  2. Upload a `.txt` / `.vtt`-ish text file or a `.json` file of segments
  3. Blank form (metadata only, transcript added later)
- **Transcript parsing** (`parse_transcript_text` in `main.py`) matches lines
  of the form `[mm:ss] Speaker: text`; lines that don't match are still
  imported as untimed/unlabelled segments so upload never hard-fails.
- **Frontend** is fully client-rendered (App Router with `"use client"`
  pages) and talks to the backend via `fetch` in `lib/api.ts` — no
  server-side rendering of API data, so `NEXT_PUBLIC_API_URL` must point at
  a reachable backend at runtime (browser-side).
- **Player ↔ transcript sync**: `currentTime` state lives in the meeting
  detail page. The player is a simulated seek bar (`setInterval` while
  "playing") since real audio is out of scope; clicking a transcript line
  calls the same `onSeek` used by the player, and the transcript
  auto-scrolls to whichever segment's `start_seconds` has just passed.
- **Search**: in-transcript search filters segments and highlights matches
  client-side; there's also a `GET /api/search` endpoint for global search
  across meeting titles and transcript text (wired on the backend, surfaced
  minimally on the frontend via the dashboard search box, which currently
  filters by title).

---

## Database schema

```
meetings
├── id (PK)
├── title
├── date
├── duration_seconds
├── media_url
├── summary_overview
├── created_at / updated_at

participants            transcript_segments        action_items              topics
├── id (PK)              ├── id (PK)                 ├── id (PK)               ├── id (PK)
├── meeting_id (FK)       ├── meeting_id (FK)         ├── meeting_id (FK)       ├── meeting_id (FK)
└── name                  ├── speaker                 ├── text                 ├── title
                          ├── start_seconds            ├── assignee             ├── start_seconds
                          ├── end_seconds               └── completed            └── order_index
                          ├── text
                          └── order_index
```

All four child tables have a many-to-one FK to `meetings` with
`ON DELETE CASCADE` behavior handled at the ORM level (`cascade="all,
delete-orphan"`), so deleting a meeting removes its participants, segments,
action items, and topics.

---

## API overview

| Method | Route | Purpose |
|--------|-------|---------|
| GET    | `/api/meetings` | List meetings — `search`, `participant`, `date_from`, `date_to`, `sort` |
| POST   | `/api/meetings` | Create a meeting from structured JSON |
| POST   | `/api/meetings/upload` | Create a meeting from an uploaded/pasted transcript file |
| GET    | `/api/meetings/{id}` | Full meeting detail (segments, action items, topics) |
| PUT    | `/api/meetings/{id}` | Update meeting metadata |
| DELETE | `/api/meetings/{id}` | Delete a meeting and all related data |
| GET    | `/api/meetings/{id}/transcript/search?q=` | Search within one transcript |
| GET    | `/api/search?q=` | Global search across meeting titles + transcript text |
| POST   | `/api/meetings/{id}/action_items` | Add an action item |
| PUT    | `/api/action_items/{id}` | Update / complete an action item |
| DELETE | `/api/action_items/{id}` | Delete an action item |

Full interactive docs: `http://localhost:8000/docs`.

---

## Assumptions / mocked data / notes

- **No real auth** — a single default logged-in user is assumed, per the
  brief; the sidebar shows a static profile.
- **No real audio/video** — the player is a simulated seek bar driven by
  `duration_seconds`; it doesn't play actual media, but timestamps, seeking,
  and transcript sync all work against that simulated clock.
- **AI summary/action items/topics are seeded, not LLM-generated** — the
  three seeded meetings ship with realistic hand-written summaries, topics,
  and action items. Meetings created via the "paste transcript" / "upload
  file" flow get a placeholder summary string and empty topics/action items,
  which the user can then fill in through the UI (action items are fully
  CRUD-able from the meeting page; summary/topic editing from the UI was not
  wired up in this pass — they can be set via the API/`PUT` route).
- **Transcript timestamp parsing** assumes a `[mm:ss] Speaker: text` line
  format; anything else imports as sequential 8-second segments so uploads
  never fail outright.
- **Team/sharing, integrations (Zoom/Meet/calendar/CRM), and the live
  meeting bot** are left as "Coming soon" placeholders in the sidebar, per
  the brief.
- **CORS is fully open** on the backend — fine for this demo, not
  production-appropriate as-is.

---

## Deploying

- **Backend** → Render/Railway: point at `backend/`, build command
  `pip install -r requirements.txt && python -m app.seed`, start command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Frontend** → Vercel: point at `frontend/`, set the `NEXT_PUBLIC_API_URL`
  environment variable to the deployed backend's URL.
