from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ParticipantBase(BaseModel):
    name: str


class ParticipantOut(ParticipantBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SegmentBase(BaseModel):
    speaker: str
    start_seconds: float
    end_seconds: float
    text: str
    order_index: int


class SegmentOut(SegmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SegmentCreate(SegmentBase):
    pass


class ActionItemBase(BaseModel):
    text: str
    assignee: Optional[str] = ""
    completed: Optional[bool] = False


class ActionItemOut(ActionItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    completed: Optional[bool] = None


class TopicBase(BaseModel):
    title: str
    start_seconds: float = 0
    order_index: int = 0


class TopicOut(TopicBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class MeetingListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    date: datetime
    duration_seconds: int
    participants: list[ParticipantOut] = []


class MeetingDetailOut(MeetingListOut):
    media_url: str
    summary_overview: str
    segments: list[SegmentOut] = []
    action_items: list[ActionItemOut] = []
    topics: list[TopicOut] = []


class MeetingCreate(BaseModel):
    title: str
    date: datetime
    duration_seconds: int = 0
    media_url: Optional[str] = ""
    summary_overview: Optional[str] = ""
    participants: list[str] = []
    segments: list[SegmentCreate] = []
    action_items: list[ActionItemCreate] = []
    topics: list[TopicBase] = []


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    summary_overview: Optional[str] = None
    participants: Optional[list[str]] = None
