export type UserRole = 'teacher' | 'student';

// Poll Option
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

// Create Poll Payload - Teacher bhejega
export interface CreatePollPayload {
  question: string;
  options: Omit<PollOption, 'votes'>[];
  timeLimit: number;
}

// Submit Answer Payload - Student bhejega
export interface SubmitAnswerPayload {
  optionId: string;
}

// Student Info
export interface Student {
  id: string;
  name: string;
  socketId: string;
  hasAnswered: boolean;
  joinedAt: number;
}

// Active Poll Info
export interface Poll {
  pollId: string;
  question: string;
  options: PollOption[];
  timeLimit: number;
  timeRemaining: number;
}

// Poll Results
export interface PollResults {
  [optionId: string]: number;
}

// Chat Message
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: number;
}

// Poll History Entry
export interface PollHistoryItem {
  pollId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: number;
  closedAt: number;
}

// User State
export interface UserState {
  role: UserRole | null;
  userId: string | null;
  name: string | null;
  isConnected: boolean;
  socketId: string | null;
  isTeacherReplaced: boolean;
}

// Session State
export interface SessionState {
  isActive: boolean;
  teacherName: string | null;
  students: Student[];
}

// Poll State
export interface PollState {
  currentPoll: Poll | null;
  isActive: boolean;
  hasAnswered: boolean;
  myAnswer: string | null; // optionId
  results: PollResults | null;
  history: PollHistoryItem[];
}

// Chat State
export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  unreadCount: number;
}

// UI State - Loading, errors, etc.
export interface UIState {
  isLoading: boolean;
  error: string | null;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
}

export interface RootState {
  user: UserState;
  session: SessionState;
  poll: PollState;
  chat: ChatState;
  ui: UIState;
}
