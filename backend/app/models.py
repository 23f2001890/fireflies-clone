from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


def now_utc():
    return datetime.now(timezone.utc)


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    duration_seconds = Column(Integer, default=0)
    media_url = Column(String, default="")
    summary_overview = Column(Text, default="")
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    participants = relationship(
        "Participant", back_populates="meeting",
        cascade="all, delete-orphan"
    )
    segments = relationship(
        "TranscriptSegment", back_populates="meeting",
        cascade="all, delete-orphan", order_by="TranscriptSegment.order_index"
    )
    action_items = relationship(
        "ActionItem", back_populates="meeting",
        cascade="all, delete-orphan"
    )
    topics = relationship(
        "Topic", back_populates="meeting",
        cascade="all, delete-orphan", order_by="Topic.order_index"
    )


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    name = Column(String, nullable=False)

    meeting = relationship("Meeting", back_populates="participants")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    speaker = Column(String, nullable=False)
    start_seconds = Column(Float, nullable=False)
    end_seconds = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="segments")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    text = Column(String, nullable=False)
    assignee = Column(String, default="")
    completed = Column(Boolean, default=False)

    meeting = relationship("Meeting", back_populates="action_items")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    title = Column(String, nullable=False)
    start_seconds = Column(Float, default=0)
    order_index = Column(Integer, default=0)

    meeting = relationship("Meeting", back_populates="topics")
