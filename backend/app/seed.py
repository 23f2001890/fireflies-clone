"""Seed the database with sample meetings so the app is usable immediately.
Run with: python -m app.seed
"""
from datetime import datetime, timedelta
from .database import SessionLocal, engine, Base
from . import models

Base.metadata.create_all(bind=engine)


def seg(speaker, start, end, text, order):
    return dict(speaker=speaker, start_seconds=start, end_seconds=end, text=text, order_index=order)


MEETINGS = [
    {
        "title": "Q3 Product Roadmap Sync",
        "date": datetime.utcnow() - timedelta(days=1, hours=2),
        "duration_seconds": 1860,
        "participants": ["Aisha Khan", "Daniel Cho", "Priya Patel", "Marcus Webb"],
        "summary_overview": (
            "The team reviewed Q3 roadmap priorities, agreed to push the analytics "
            "dashboard ahead of the mobile redesign, and flagged a resourcing gap on "
            "the data pipeline. Daniel will scope a two-week spike before committing "
            "to the September launch date."
        ),
        "topics": [
            {"title": "Roadmap prioritization", "start_seconds": 0, "order_index": 0},
            {"title": "Analytics dashboard scope", "start_seconds": 420, "order_index": 1},
            {"title": "Resourcing & hiring", "start_seconds": 980, "order_index": 2},
            {"title": "Next steps", "start_seconds": 1600, "order_index": 3},
        ],
        "action_items": [
            {"text": "Scope a two-week spike for the data pipeline", "assignee": "Daniel Cho", "completed": False},
            {"text": "Share updated Q3 roadmap doc with stakeholders", "assignee": "Aisha Khan", "completed": True},
            {"text": "Draft job req for a second data engineer", "assignee": "Marcus Webb", "completed": False},
        ],
        "segments": [
            seg("Aisha Khan", 0, 12, "Alright, let's get started — today we're locking down Q3 priorities.", 0),
            seg("Daniel Cho", 12, 30, "Before we do, I want to flag that the data pipeline work is bigger than we scoped in June.", 1),
            seg("Priya Patel", 30, 48, "How much bigger are we talking? A week, a sprint?", 2),
            seg("Daniel Cho", 48, 75, "Closer to a sprint. The ingestion layer needs a rewrite if we want the dashboard to be real-time.", 3),
            seg("Aisha Khan", 75, 95, "Okay, let's push the mobile redesign behind the analytics dashboard then.", 4),
            seg("Marcus Webb", 95, 120, "Agreed. Mobile isn't blocking anyone externally yet, the dashboard is a sales commitment.", 5),
            seg("Priya Patel", 420, 450, "For the dashboard scope — are we doing custom date ranges in v1 or just presets?", 6),
            seg("Aisha Khan", 450, 470, "Presets only for v1. Custom ranges in v1.1.", 7),
            seg("Daniel Cho", 980, 1010, "On resourcing, I think we need a second data engineer if September is real.", 8),
            seg("Marcus Webb", 1010, 1040, "I'll get a job req drafted this week and loop in recruiting.", 9),
            seg("Aisha Khan", 1600, 1630, "Great, so: Daniel scopes the spike, Marcus drafts the req, I'll circulate the roadmap doc.", 10),
        ],
    },
    {
        "title": "Design Review — Onboarding Flow v2",
        "date": datetime.utcnow() - timedelta(days=3, hours=5),
        "duration_seconds": 1500,
        "participants": ["Lena Ortiz", "Sam Whitfield", "Rahul Nair"],
        "summary_overview": (
            "Reviewed the new three-step onboarding flow. Consensus to remove the "
            "'invite teammates' step from the required path and make it a post-signup "
            "nudge instead. Sam will update the Figma file and Rahul will estimate "
            "frontend effort by Friday."
        ),
        "topics": [
            {"title": "Current drop-off data", "start_seconds": 0, "order_index": 0},
            {"title": "Proposed flow walkthrough", "start_seconds": 360, "order_index": 1},
            {"title": "Team invite step debate", "start_seconds": 780, "order_index": 2},
        ],
        "action_items": [
            {"text": "Update Figma with the two-step flow", "assignee": "Sam Whitfield", "completed": False},
            {"text": "Estimate frontend effort for new flow", "assignee": "Rahul Nair", "completed": False},
            {"text": "Pull updated drop-off funnel after launch", "assignee": "Lena Ortiz", "completed": False},
        ],
        "segments": [
            seg("Lena Ortiz", 0, 20, "So the current funnel loses about 40% of users at the invite-teammates step.", 0),
            seg("Sam Whitfield", 20, 45, "Right, and most of them just don't have teammates to invite yet at that point.", 1),
            seg("Rahul Nair", 45, 60, "What if we move it to after they've seen value in the product?", 2),
            seg("Lena Ortiz", 360, 385, "Walking through the new flow: welcome, workspace setup, first project — that's it.", 3),
            seg("Sam Whitfield", 385, 410, "Cleaner. Invite becomes a banner inside the app instead of a blocking step.", 4),
            seg("Rahul Nair", 780, 805, "I still want data on whether removing it hurts team-plan conversion.", 5),
            seg("Lena Ortiz", 805, 830, "Fair, let's ship it behind a flag and compare cohorts for two weeks.", 6),
        ],
    },
    {
        "title": "Customer Call — Meridian Labs Renewal",
        "date": datetime.utcnow() - timedelta(days=6, hours=1),
        "duration_seconds": 1320,
        "participants": ["Jordan Blake", "Elena Fischer"],
        "summary_overview": (
            "Meridian Labs is happy with usage but wants SSO before renewing at the "
            "higher tier. Jordan to confirm SSO timeline with engineering and send a "
            "revised proposal by end of week."
        ),
        "topics": [
            {"title": "Usage review", "start_seconds": 0, "order_index": 0},
            {"title": "SSO requirement", "start_seconds": 300, "order_index": 1},
            {"title": "Pricing discussion", "start_seconds": 900, "order_index": 2},
        ],
        "action_items": [
            {"text": "Confirm SSO timeline with engineering", "assignee": "Jordan Blake", "completed": False},
            {"text": "Send revised proposal to Meridian Labs", "assignee": "Jordan Blake", "completed": False},
        ],
        "segments": [
            seg("Jordan Blake", 0, 25, "Thanks for hopping on — I saw your team's usage is up 3x since Q1.", 0),
            seg("Elena Fischer", 25, 50, "Yeah, it's become pretty core for us. That's actually why I wanted to talk.", 1),
            seg("Jordan Blake", 300, 325, "What would it take to get you onto the annual plan today?", 2),
            seg("Elena Fischer", 325, 355, "Honestly, SSO. Security won't approve a renewal without it.", 3),
            seg("Jordan Blake", 900, 925, "Understood. Let me check the SSO timeline and get back to you with a proposal.", 4),
        ],
    },
]


def run():
    db = SessionLocal()
    try:
        if db.query(models.Meeting).count() > 0:
            print("Database already seeded, skipping.")
            return
        for m in MEETINGS:
            meeting = models.Meeting(
                title=m["title"],
                date=m["date"],
                duration_seconds=m["duration_seconds"],
                summary_overview=m["summary_overview"],
                media_url="",
            )
            meeting.participants = [models.Participant(name=n) for n in m["participants"]]
            meeting.segments = [models.TranscriptSegment(**s) for s in m["segments"]]
            meeting.action_items = [models.ActionItem(**a) for a in m["action_items"]]
            meeting.topics = [models.Topic(**t) for t in m["topics"]]
            db.add(meeting)
        db.commit()
        print(f"Seeded {len(MEETINGS)} meetings.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
