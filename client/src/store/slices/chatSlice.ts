import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, ChatMessage, RootState } from '@/types';

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Naya message aaya
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);

      // Agar chat closed hai to unread count badhana hai
      if (!state.isOpen) {
        state.unreadCount += 1;
      }

      // Max 200 messages hi rakhte hai (memory management)
      if (state.messages.length > 200) {
        state.messages.shift(); // Purana wala remove karte hai
      }
    },

    // Chat open/close toggle
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;

      // Open karne pe unread count clear karna hai
      if (state.isOpen) {
        state.unreadCount = 0;
      }
    },

    // Chat open karna hai
    openChat: (state) => {
      state.isOpen = true;
      state.unreadCount = 0;
    },

    // Chat close karna hai
    closeChat: (state) => {
      state.isOpen = false;
    },

    // Unread count clear karna hai
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },

    // Sare messages clear karna hai
    clearMessages: (state) => {
      state.messages = [];
      state.unreadCount = 0;
    },

    // Multiple messages add karna hai (history load karne pe)
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },

    // Reset chat state
    resetChat: () => initialState,
  },
});

// Export actions
export const {
  addMessage,
  toggleChat,
  openChat,
  closeChat,
  clearUnreadCount,
  clearMessages,
  setMessages,
  resetChat,
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;

export const selectChat = (state: RootState) => state.chat;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectIsChatOpen = (state: RootState) => state.chat.isOpen;
export const selectUnreadCount = (state: RootState) => state.chat.unreadCount;

// Latest message
export const selectLatestMessage = (state: RootState) => {
  const messages = state.chat.messages;
  return messages.length > 0 ? messages[messages.length - 1] : null;
};

// Messages grouped by date
export const selectMessagesByDate = (state: RootState) => {
  const messages = state.chat.messages;
  const grouped: Record<string, ChatMessage[]> = {};

  messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(msg);
  });

  return grouped;
};

// Has unread messages?
export const selectHasUnreadMessages = (state: RootState) =>
  state.chat.unreadCount > 0;
