// Poll Option - details of each option in a poll
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

// When Teacher creates a poll, this data is sent
export interface CreatePollPayload {
  question: string;
  options: Omit<PollOption, 'votes'>[]; // votes are not sent, start from 0
  timeLimit: number; // in seconds
}

// When Student submits an answer
export interface SubmitAnswerPayload {
  optionId: string; // Which option was voted for
}

// Student's complete information
export interface Student {
  id: string;
  name: string;
  socketId: string; // To track socket connection
  hasAnswered: boolean; // Whether answered the current poll or not
  joinedAt: number; // Timestamp
}

// Poll's complete information
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  timeLimit: number; // Total time in seconds
  timeRemaining: number; // Remaining time
  isActive: boolean; // Poll is active or closed
  createdAt: number; // Timestamp
  votes: Map<string, string>; // userId → optionId mapping
}

// Chat message structure
export interface ChatMessage {
  id: string;
  senderId: string; // userId or socketId
  senderName: string;
  senderRole: 'teacher' | 'student';
  message: string;
  timestamp: number;
}

// Poll History - to store past polls data
export interface PollHistory {
  pollId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: number;
  closedAt: number;
  participants: {
    studentId: string;
    studentName: string;
    selectedOption: string;
  }[];
}
