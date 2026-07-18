export interface Participant {
  id: number;
  name: string;
}

export interface Segment {
  id: number;
  speaker: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
  order_index: number;
}

export interface ActionItem {
  id: number;
  text: string;
  assignee: string;
  completed: boolean;
}

export interface Topic {
  id: number;
  title: string;
  start_seconds: number;
  order_index: number;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  participants: Participant[];
}

export interface MeetingDetail extends MeetingListItem {
  media_url: string;
  summary_overview: string;
  segments: Segment[];
  action_items: ActionItem[];
  topics: Topic[];
}
