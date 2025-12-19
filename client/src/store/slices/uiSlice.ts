import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, RootState } from '@/types';

const initialState: UIState = {
  isLoading: false,
  error: null,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading start
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Error set karna hai
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Error clear karna hai
    clearError: (state) => {
      state.error = null;
    },

    // Notification show karna hai
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'info';
      }>
    ) => {
      state.notification = action.payload;
    },

    // Notification hide karna hai
    hideNotification: (state) => {
      state.notification = null;
    },

    // Success notification (shorthand)
    showSuccess: (state, action: PayloadAction<string>) => {
      state.notification = {
        message: action.payload,
        type: 'success',
      };
    },

    // Error notification (shorthand)
    showError: (state, action: PayloadAction<string>) => {
      state.notification = {
        message: action.payload,
        type: 'error',
      };
      state.error = action.payload;
    },

    // Info notification (shorthand)
    showInfo: (state, action: PayloadAction<string>) => {
      state.notification = {
        message: action.payload,
        type: 'info',
      };
    },

    // Reset UI state
    resetUI: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  clearError,
  showNotification,
  hideNotification,
  showSuccess,
  showError,
  showInfo,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

export const selectUI = (state: RootState) => state.ui;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectError = (state: RootState) => state.ui.error;
export const selectNotification = (state: RootState) => state.ui.notification;
export const selectHasError = (state: RootState) => state.ui.error !== null;
export const selectHasNotification = (state: RootState) =>
  state.ui.notification !== null;
