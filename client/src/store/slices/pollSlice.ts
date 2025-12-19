import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PollState,
  Poll,
  PollResults,
  PollHistoryItem,
  RootState,
} from '@/types';

const initialState: PollState = {
  currentPoll: null,
  isActive: false,
  hasAnswered: false,
  myAnswer: null,
  results: null,
  history: [],
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    // Naya poll start hua
    pollStarted: (state, action: PayloadAction<Poll>) => {
      state.currentPoll = action.payload;
      state.isActive = true;
      state.hasAnswered = false;
      state.myAnswer = null;
      state.results = null;
    },

    // Timer update (har second)
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentPoll) {
        state.currentPoll.timeRemaining = action.payload;
      }
    },

    // Student ne answer submit kiya
    answerSubmitted: (state, action: PayloadAction<{ optionId: string }>) => {
      state.hasAnswered = true;
      state.myAnswer = action.payload.optionId;
    },

    // Live results update (real-time voting)
    updateLiveResults: (state, action: PayloadAction<PollResults>) => {
      state.results = action.payload;

      // Current poll ke options me bhi votes update karna hai
      if (state.currentPoll) {
        state.currentPoll.options = state.currentPoll.options.map((option) => ({
          ...option,
          votes: action.payload[option.id] || 0,
        }));
      }
    },

    // Poll end hua - final results
    pollEnded: (state, action: PayloadAction<PollResults>) => {
      state.isActive = false;
      state.results = action.payload;

      // History me save karna hai
      if (state.currentPoll) {
        const historyItem: PollHistoryItem = {
          pollId: state.currentPoll.pollId,
          question: state.currentPoll.question,
          options: state.currentPoll.options.map((opt) => ({
            ...opt,
            votes: action.payload[opt.id] || 0,
          })),
          totalVotes: Object.values(action.payload).reduce((a, b) => a + b, 0),
          createdAt: Date.now() - state.currentPoll.timeLimit * 1000,
          closedAt: Date.now(),
        };

        // History ke start me add karna hai (latest first)
        state.history.unshift(historyItem);

        // Max 50 polls hi rakhte hai
        if (state.history.length > 50) {
          state.history.pop();
        }
      }
    },

    // Poll history set karte hai (teacher ke liye)
    setPollHistory: (state, action: PayloadAction<PollHistoryItem[]>) => {
      state.history = action.payload;
    },

    // Current poll set karte hai (join karte time)
    setCurrentPoll: (state, action: PayloadAction<Poll | null>) => {
      state.currentPoll = action.payload;
      state.isActive = action.payload !== null;
      state.hasAnswered = false;
      state.myAnswer = null;
    },

    // Poll clear karte hai
    clearCurrentPoll: (state) => {
      state.currentPoll = null;
      state.isActive = false;
      state.hasAnswered = false;
      state.myAnswer = null;
    },

    // Reset poll state
    resetPoll: () => initialState,
  },
});

export const {
  pollStarted,
  updateTimeRemaining,
  answerSubmitted,
  updateLiveResults,
  pollEnded,
  setPollHistory,
  setCurrentPoll,
  clearCurrentPoll,
  resetPoll,
} = pollSlice.actions;

export default pollSlice.reducer;

export const selectPoll = (state: RootState) => state.poll;
export const selectCurrentPoll = (state: RootState) => state.poll.currentPoll;
export const selectIsPollActive = (state: RootState) => state.poll.isActive;
export const selectHasAnswered = (state: RootState) => state.poll.hasAnswered;
export const selectMyAnswer = (state: RootState) => state.poll.myAnswer;
export const selectPollResults = (state: RootState) => state.poll.results;
export const selectPollHistory = (state: RootState) => state.poll.history;

// Time remaining in MM:SS format
export const selectTimeRemainingFormatted = (state: RootState) => {
  const seconds = state.poll.currentPoll?.timeRemaining ?? 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

// Poll progress percentage
export const selectPollProgress = (state: RootState) => {
  const poll = state.poll.currentPoll;
  if (!poll) return 0;
  const elapsed = poll.timeLimit - poll.timeRemaining;
  return Math.round((elapsed / poll.timeLimit) * 100);
};

// Results with percentages
export const selectResultsWithPercentages = (state: RootState) => {
  const poll = state.poll.currentPoll;
  const results = state.poll.results;

  if (!poll || !results) return null;

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

  return poll.options.map((option) => ({
    ...option,
    votes: results[option.id] || 0,
    percentage:
      totalVotes > 0
        ? Math.round(((results[option.id] || 0) / totalVotes) * 100)
        : 0,
  }));
};

// Winning option
export const selectWinningOption = (state: RootState) => {
  const results = state.poll.results;
  const poll = state.poll.currentPoll;

  if (!results || !poll) return null;

  const maxVotes = Math.max(...Object.values(results));
  const winningOptionId = Object.keys(results).find(
    (key) => results[key] === maxVotes
  );

  return poll.options.find((opt) => opt.id === winningOptionId);
};
