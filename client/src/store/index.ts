import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import userReducer from './slices/userSlice';
import sessionReducer from './slices/sessionSlice';
import pollReducer from './slices/pollSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

import { resetUser } from './slices/userSlice';
import { resetPoll } from './slices/pollSlice';
import { resetChat } from './slices/chatSlice';
import { resetUI } from './slices/uiSlice';
import { sessionEnded } from './slices/sessionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    session: sessionReducer,
    poll: pollReducer,
    chat: chatReducer,
    ui: uiReducer,
  },

  // Middleware configuration (optional)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Socket.io objects non-serializable hain, so disable check
      serializableCheck: {
        ignoredActions: ['socket/connect', 'socket/disconnect'],
      },
    }),

  // Development mode me extra checks enable honge
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed useDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed useSelector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const getCurrentState = () => store.getState();

export const resetStore = () => {
  store.dispatch(resetUser());
  store.dispatch(sessionEnded());
  store.dispatch(resetPoll());
  store.dispatch(resetChat());
  store.dispatch(resetUI());
};
