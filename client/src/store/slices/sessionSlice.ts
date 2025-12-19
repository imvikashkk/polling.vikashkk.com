import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionState, Student, RootState } from '@/types';

const initialState: SessionState = {
  isActive: true,
  teacherName: null,
  students: [],
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Session start hua (teacher joined)
    sessionStarted: (
      state,
      action: PayloadAction<{ teacherName?: string }>
    ) => {
      state.isActive = true;
      if (action.payload.teacherName) {
        state.teacherName = action.payload.teacherName;
      }
    },

    // Session end hua (teacher left)
    sessionEnded: (state) => {
      state.isActive = false;
      state.teacherName = null;
      state.students = [];
    },

    // Naya student join hua
    studentJoined: (state, action: PayloadAction<Student>) => {
      const exists = state.students.find((s) => s.id === action.payload.id);
      if (!exists) {
        state.students.push(action.payload);
      }
    },

    // Student leave kar gaya
    studentLeft: (state, action: PayloadAction<{ studentId: string }>) => {
      state.students = state.students.filter(
        (s) => s.id !== action.payload.studentId
      );
    },

    // Student ko kick kar diya
    studentRemoved: (state, action: PayloadAction<{ studentId: string }>) => {
      state.students = state.students.filter(
        (s) => s.id !== action.payload.studentId
      );
    },

    // Students list update (bulk update)
    updateStudentsList: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },

    // Student ne answer diya - hasAnswered update karo
    updateStudentAnswered: (
      state,
      action: PayloadAction<{ studentId: string }>
    ) => {
      const student = state.students.find(
        (s) => s.id === action.payload.studentId
      );
      if (student) {
        student.hasAnswered = true;
      }
    },

    // Sare students ka hasAnswered reset (naya poll)
    resetStudentsAnswers: (state) => {
      state.students.forEach((student) => {
        student.hasAnswered = false;
      });
    },

    // Full state update (reconnection pe)
    setSessionState: (state, action: PayloadAction<SessionState>) => {
      return action.payload;
    },
  },
});

// Export actions
export const {
  sessionStarted,
  sessionEnded,
  studentJoined,
  studentLeft,
  studentRemoved,
  updateStudentsList,
  updateStudentAnswered,
  resetStudentsAnswers,
  setSessionState,
} = sessionSlice.actions;

export default sessionSlice.reducer;

export const selectSession = (state: RootState) => state.session;
export const selectIsSessionActive = (state: RootState) =>
  state.session.isActive;

export const selectTeacherName = (state: RootState) =>
  state.session.teacherName;
export const selectStudents = (state: RootState) => state.session.students;
export const selectStudentsCount = (state: RootState) =>
  state.session.students.length;

// Kitne students ne answer diya
export const selectAnsweredCount = (state: RootState) =>
  state.session.students.filter((s) => s.hasAnswered).length;

// Percentage of students who answered
export const selectAnsweredPercentage = (state: RootState) => {
  const total = state.session.students.length;
  if (total === 0) return 0;
  const answered = state.session.students.filter((s) => s.hasAnswered).length;
  return Math.round((answered / total) * 100);
};

// All students answered?
export const selectAllStudentsAnswered = (state: RootState) => {
  const students = state.session.students;
  if (students.length === 0) return false;
  return students.every((s) => s.hasAnswered);
};
