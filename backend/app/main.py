import json
import re
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_

from . import models, schemas
from .database import engine, get_db, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fireflies Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- helpers ----------

def meeting_to_participants(db: Session, meeting: models.Meeting, names: list[str]):
    meeting.participants = [models.Participant(name=n) for n in names if n.strip()]


def parse_transcript_text(raw: str) -> list[dict]:
    """Parse a simple '[mm:ss] Speaker: text' transcript format, falling back
    to one segment per non-empty line if timestamps aren't present."""
    segments = []
    lines = [l for l in raw.splitlines() if l.strip()]
    pattern = re.compile(
        r"^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*([\w .'-]+):\s*(.+)$"
    )
    order = 0
    for line in lines:
        m = pattern.match(line.strip())
        if m:
            ts, speaker, text = m.groups()
            parts = [int(p) for p in ts.split(":")]
            secs = 0
            for p in parts:
                secs = secs * 60 + p
            segments.append({
                "speaker": speaker.strip(),
                "start_seconds": float(secs),
                "end_seconds": float(secs + 8),
                "text": text.strip(),
                "order_index": order,
            })
        else:
            segments.append({
                "speaker": "Speaker",
                "start_seconds": float(order * 8),
                "end_seconds": float(order * 8 + 8),
                "text": line.strip(),
                "order_index": order,
            })
        order += 1
    return segments


# ---------- meetings ----------

@app.get("/api/meetings", response_model=list[schemas.MeetingListOut])
def list_meetings(
    search: Optional[str] = None,
    participant: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort: str = "recent",
    db: Session = Depends(get_db),
):
    q = db.query(models.Meeting)
    if search:
        q = q.filter(models.Meeting.title.ilike(f"%{search}%"))
    if participant:
        q = q.join(models.Participant).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )
    if date_from:
        q = q.filter(models.Meeting.date >= date_from)
    if date_to:
        q = q.filter(models.Meeting.date <= date_to)
    if sort == "recent":
        q = q.order_by(models.Meeting.date.desc())
    elif sort == "oldest":
        q = q.order_by(models.Meeting.date.asc())
    return q.all()


@app.post("/api/meetings", response_model=schemas.MeetingDetailOut)
def create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting = models.Meeting(
        title=payload.title,
        date=payload.date,
        duration_seconds=payload.duration_seconds,
        media_url=payload.media_url or "",
        summary_overview=payload.summary_overview or "",
    )
    meeting.participants = [models.Participant(name=n) for n in payload.participants if n.strip()]
    meeting.segments = [models.TranscriptSegment(**s.model_dump()) for s in payload.segments]
    meeting.action_items = [models.ActionItem(**a.model_dump()) for a in payload.action_items]
    meeting.topics = [models.Topic(**t.model_dump()) for t in payload.topics]

    if meeting.duration_seconds == 0 and meeting.segments:
        meeting.duration_seconds = int(max(s.end_seconds for s in meeting.segments))

    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@app.post("/api/meetings/upload", response_model=schemas.MeetingDetailOut)
def create_meeting_from_upload(
    title: str = Form(...),
    participants: str = Form(""),
    date: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    raw = file.file.read().decode("utf-8", errors="ignore")
    if file.filename and file.filename.endswith(".json"):
        data = json.loads(raw)
        segs = data if isinstance(data, list) else data.get("segments", [])
        segments = [
            {
                "speaker": s.get("speaker", "Speaker"),
                "start_seconds": float(s.get("start_seconds", i * 8)),
                "end_seconds": float(s.get("end_seconds", i * 8 + 8)),
                "text": s.get("text", ""),
                "order_index": i,
            }
            for i, s in enumerate(segs)
        ]
    else:
        segments = parse_transcript_text(raw)

    names = [n.strip() for n in participants.split(",") if n.strip()]
    meeting_date = datetime.fromisoformat(date) if date else datetime.utcnow()
    duration = int(max((s["end_seconds"] for s in segments), default=0))

    meeting = models.Meeting(
        title=title,
        date=meeting_date,
        duration_seconds=duration,
        summary_overview="Summary pending — generate or edit this meeting to add one.",
    )
    meeting.participants = [models.Participant(name=n) for n in names]
    meeting.segments = [models.TranscriptSegment(**s) for s in segments]
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@app.get("/api/meetings/{meeting_id}", response_model=schemas.MeetingDetailOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    return meeting


@app.put("/api/meetings/{meeting_id}", response_model=schemas.MeetingDetailOut)
def update_meeting(meeting_id: int, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    data = payload.model_dump(exclude_unset=True)
    if "participants" in data:
        names = data.pop("participants")
        if names is not None:
            meeting.participants = [models.Participant(name=n) for n in names if n.strip()]
    for k, v in data.items():
        setattr(meeting, k, v)
    db.commit()
    db.refresh(meeting)
    return meeting


@app.delete("/api/meetings/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"ok": True}


# ---------- transcript search (within a meeting) ----------

@app.get("/api/meetings/{meeting_id}/transcript/search")
def search_transcript(meeting_id: int, q: str, db: Session = Depends(get_db)):
    segments = (
        db.query(models.TranscriptSegment)
        .filter(models.TranscriptSegment.meeting_id == meeting_id)
        .filter(models.TranscriptSegment.text.ilike(f"%{q}%"))
        .order_by(models.TranscriptSegment.order_index)
        .all()
    )
    return [schemas.SegmentOut.model_validate(s) for s in segments]


# ---------- global search across all meetings ----------

@app.get("/api/search")
def global_search(q: str, db: Session = Depends(get_db)):
    meetings = (
        db.query(models.Meeting)
        .filter(models.Meeting.title.ilike(f"%{q}%"))
        .all()
    )
    segments = (
        db.query(models.TranscriptSegment)
        .filter(models.TranscriptSegment.text.ilike(f"%{q}%"))
        .limit(50)
        .all()
    )
    seg_results = [
        {
            "meeting_id": s.meeting_id,
            "meeting_title": s.meeting.title,
            "speaker": s.speaker,
            "start_seconds": s.start_seconds,
            "text": s.text,
        }
        for s in segments
    ]
    return {
        "meetings": [schemas.MeetingListOut.model_validate(m) for m in meetings],
        "transcript_matches": seg_results,
    }


# ---------- action items ----------

@app.post("/api/meetings/{meeting_id}/action_items", response_model=schemas.ActionItemOut)
def add_action_item(meeting_id: int, payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    item = models.ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/action_items/{item_id}", response_model=schemas.ActionItemOut)
def update_action_item(item_id: int, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).get(item_id)
    if not item:
        raise HTTPException(404, "Action item not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/action_items/{item_id}")
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).get(item_id)
    if not item:
        raise HTTPException(404, "Action item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@app.get("/api/health")
def health():
    return {"status": "ok"}
