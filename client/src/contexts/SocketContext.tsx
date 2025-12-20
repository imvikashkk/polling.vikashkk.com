'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '@/store/index';

/* All Redux Imports */
import {
  setConnected,
  setDisconnected,
  studentJoinSuccess,
  teacherSessionStarted,
  teacherReplaced,
  studentKicked,
} from '@/store/slices/userSlice';
import {
  sessionStarted,
  sessionEnded,
  studentJoined,
  studentLeft,
  studentRemoved,
  updateStudentsList,
  resetStudentsAnswers,
} from '@/store/slices/sessionSlice';
import {
  pollStarted,
  pollEnded,
  updateTimeRemaining,
  updateLiveResults,
  setPollHistory,
  setCurrentPoll,
} from '@/store/slices/pollSlice';
import { addMessage } from '@/store/slices/chatSlice';
import { showError, showSuccess, showInfo } from '@/store/slices/uiSlice';

/* Types */
import {
  Poll,
  Student,
  ChatMessage,
  PollResults,
  PollHistoryItem,
} from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Backend URL from environment variable
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    /* ==================== CONNECTION EVENTS ==================== */

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setSocket(socketInstance);
      dispatch(setConnected({ socketId: socketInstance.id || '' }));
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      dispatch(setDisconnected());
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      dispatch(showError('Failed to connect to server'));
    });

    /* ==================== SESSION EVENTS ==================== */

    // Teacher session started successfully
    socketInstance.on(
      'session-started',
      (data: { students?: Student[]; pollHistory?: PollHistoryItem[] }) => {
        console.log('Session started');
        dispatch(teacherSessionStarted());
        dispatch(sessionStarted({ teacherName: 'You' }));

        if (data.students) {
          dispatch(updateStudentsList(data.students));
        }

        if (data.pollHistory) {
          dispatch(setPollHistory(data.pollHistory));
        }

        dispatch(showSuccess('Session started successfully!'));
      }
    );

    // Session ended (teacher left)
    socketInstance.on('session-ended', (data?: { message?: string }) => {
      console.log('Session ended');
      dispatch(sessionEnded());
      dispatch(showInfo(data?.message || 'Session has ended'));
    });

    // Teacher got replaced by another teacher
    socketInstance.on('teacher-replaced', (data: { message: string }) => {
      console.log('Teacher replaced');
      dispatch(teacherReplaced());
      dispatch(sessionEnded());
      dispatch(showError(data.message));
    });

    // Student joined session successfully
    socketInstance.on(
      'join-success',
      (data: { userId: string; currentPoll?: Poll | null }) => {
        console.log('Joined session successfully');
        dispatch(studentJoinSuccess({ userId: data.userId }));

        if (data.currentPoll) {
          dispatch(setCurrentPoll(data.currentPoll));
        }

        dispatch(showSuccess('Joined session successfully!'));
      }
    );

    /* ==================== STUDENTS EVENTS ==================== */

    // New student joined
    socketInstance.on('student-joined', (student: Student) => {
      console.log('Student joined:', student.name);
      dispatch(studentJoined(student));
      dispatch(showInfo(`${student.name} joined the session`));
    });

    // Student left
    socketInstance.on(
      'student-left',
      (data: { studentId: string; studentName?: string }) => {
        console.log('Student left:', data.studentName);
        dispatch(studentLeft({ studentId: data.studentId }));

        if (data.studentName) {
          dispatch(showInfo(`${data.studentName} left the session`));
        }
      }
    );

    // Student was kicked out
    socketInstance.on(
      'student-removed',
      (data: { studentId: string; studentName: string }) => {
        console.log('Student removed:', data.studentName);
        dispatch(studentRemoved({ studentId: data.studentId }));
        dispatch(showInfo(`${data.studentName} was removed`));
      }
    );

    // You got kicked out (student only)
    socketInstance.on('kicked-out', (data: { message: string }) => {
      console.log('You got kicked out');
      dispatch(studentKicked());
      dispatch(sessionEnded());
      dispatch(showError(data.message));
    });

    // Students list update
    socketInstance.on('students-list', (students: Student[]) => {
      dispatch(updateStudentsList(students));
    });

    /* ==================== POLL EVENTS ==================== */

    // New poll started
    socketInstance.on('poll-started', (data: Poll) => {
      console.log('Poll started:', data.question);
      dispatch(pollStarted(data));
      dispatch(resetStudentsAnswers());
      dispatch(showInfo('New poll started!'));
    });

    // Time update (every second)
    socketInstance.on('time-update', (seconds: number) => {
      dispatch(updateTimeRemaining(seconds));
    });

    // Poll ended - show results
    socketInstance.on('poll-ended', (results: PollResults) => {
      console.log('Poll ended, results:', results);
      dispatch(pollEnded(results));
      dispatch(showSuccess('Poll has ended!'));
    });

    // Live results update (real-time voting)
    socketInstance.on('live-results', (results: PollResults) => {
      dispatch(updateLiveResults(results));
    });

    // Answer submitted successfully
    socketInstance.on('answer-submitted', (data: { success: boolean }) => {
      if (data.success) {
        console.log('Answer submitted');
        dispatch(showSuccess('Your answer has been recorded!'));
      }
    });

    // Poll history (for teacher)
    socketInstance.on('poll-history', (history: PollHistoryItem[]) => {
      dispatch(setPollHistory(history));
    });

    /* ==================== CHAT EVENTS ==================== */

    // New chat message
    socketInstance.on('new-message', (message: ChatMessage) => {
      console.log('New message:', message.senderName, message.message);
      dispatch(addMessage(message));
    });

    /* ==================== ERROR EVENTS ==================== */

    // Server error
    socketInstance.on('error', (data: { message: string }) => {
      console.error('Server error:', data.message);
      dispatch(showError(data.message));
    });

    /* ==================== CURRENT STATE ==================== */
    // Current state response (for reconnection)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketInstance.on('current-state', (data: any) => {
      if (data.hasActiveSession) {
        dispatch(sessionStarted({}));
      }

      if (data.students) {
        dispatch(updateStudentsList(data.students));
      }

      if (data.currentPoll) {
        dispatch(setCurrentPoll(data.currentPoll));
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

/*
============================================
      CUSTOM HOOK TO USE SOCKET
============================================ */

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }

  return context;
};
