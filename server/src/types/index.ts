// Poll Option - har option ki details
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

// Teacher jab poll create karta hai to ye data bhejta hai
export interface CreatePollPayload {
  question: string;
  options: Omit<PollOption, 'votes'>[]; // votes nahi bhejte, 0 se start hoga
  timeLimit: number; // seconds me (max 60 according to requirements)
}

// Student jab answer submit karta hai
export interface SubmitAnswerPayload {
  optionId: string; // Kis option ko vote diya
}

// Student ki complete information
export interface Student {
  id: string;
  name: string;
  socketId: string; // Socket connection track karne ke liye
  hasAnswered: boolean; // Current poll me answer diya ya nahi
  joinedAt: number; // Timestamp
}

// Poll ki complete information
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  timeLimit: number; // Total time in seconds
  timeRemaining: number; // Remaining time
  isActive: boolean; // Poll chal raha hai ya band ho gaya
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

// Poll History - past polls ka data store karne ke liye
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
