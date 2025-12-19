import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserRole, RootState } from '@/types';

const initialState: UserState = {
  role: null,
  userId: null,
  name: null,
  isConnected: false,
  socketId: null,
  isTeacherReplaced: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Socket connected ho gaya
    setConnected: (state, action: PayloadAction<{ socketId: string }>) => {
      state.isConnected = true;
      state.socketId = action.payload.socketId;
      state.isTeacherReplaced = false;
    },

    // Socket disconnected
    setDisconnected: (state) => {
      state.isConnected = false;
      state.socketId = null;
    },

    // User ne role select kiya (teacher/student)
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },

    // User info set karna hai (name aur ID)
    setUserInfo: (
      state,
      action: PayloadAction<{ name: string; userId?: string }>
    ) => {
      state.name = action.payload.name;
      if (action.payload.userId) {
        state.userId = action.payload.userId;
      }
    },

    // Student successfully join ho gaya
    studentJoinSuccess: (state, action: PayloadAction<{ userId: string }>) => {
      state.userId = action.payload.userId;
    },

    // Teacher successfully session start kar liya
    teacherSessionStarted: (state) => {
      // Teacher ke liye userId socket ID hi hai
      state.userId = state.socketId;
    },

    // Teacher kicked out (new teacher took over)
    teacherReplaced: (state) => {
      state.role = null;
      state.userId = null;
      state.name = null;
      state.isTeacherReplaced = true;
    },

    // Student kicked out
    studentKicked: (state) => {
      state.role = null;
      state.userId = null;
      state.name = null;
    },

    // Reset user state (logout)
    resetUser: () => initialState,
  },
});

export const {
  setConnected,
  setDisconnected,
  setUserRole,
  setUserInfo,
  studentJoinSuccess,
  teacherSessionStarted,
  teacherReplaced,
  studentKicked,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;

export const selectUser = (state: RootState) => state.user;
export const selectUserRole = (state: RootState) => state.user.role;
export const selectUserId = (state: RootState) => state.user.userId;
export const selectUserName = (state: RootState) => state.user.name;
export const selectIsConnected = (state: RootState) => state.user.isConnected;
export const selectIsTeacherReplaced = (state: RootState) =>
  state.user.isTeacherReplaced;
export const selectIsTeacher = (state: RootState) =>
  state.user.role === 'teacher';
export const selectIsStudent = (state: RootState) =>
  state.user.role === 'student';
