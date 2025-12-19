import { useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAppDispatch, useAppSelector } from '@/store/index';
import { setUserRole, setUserInfo } from '@/store/slices/userSlice';
import { answerSubmitted } from '@/store/slices/pollSlice';
import { setLoading, showError } from '@/store/slices/uiSlice';
import { CreatePollPayload, SubmitAnswerPayload } from '@/types';

/**
 * CUSTOM HOOK: useSocketActions
 *
 * Ye hook sabhi socket emit actions ko provide karega
 * Components me directly ye functions use kar sakte hai
 */
export const useSocketActions = () => {
  const { socket } = useSocket();
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useAppSelector((state: any) => state.user);

  /* ==================== TEACHER ACTIONS ==================== */

  /**
   * Teacher: Start Session
   * Usage: startSession('Ms. Pallavi')
   */
  const startSession = useCallback(
    (name: string) => {
      if (!socket) {
        dispatch(showError('Socket not connected'));
        return;
      }

      dispatch(setLoading(true));
      dispatch(setUserRole('teacher'));
      dispatch(setUserInfo({ name }));

      socket.emit('start-session', { name });

      // Loading state automatically clear hoga jab response aayega
    },
    [socket, dispatch]
  );

  /**
   * Teacher: Create Poll
   * Usage: createPoll({ question, options, timeLimit })
   */
  const createPoll = useCallback(
    (pollData: CreatePollPayload) => {
      if (!socket) {
        dispatch(showError('Socket not connected'));
        return;
      }

      if (user.role !== 'teacher') {
        dispatch(showError('Only teachers can create polls'));
        return;
      }

      dispatch(setLoading(true));
      socket.emit('create-poll', pollData);
    },
    [socket, dispatch, user.role]
  );

  /**
   * Teacher: Close Poll
   * Usage: closePoll()
   */
  const closePoll = useCallback(() => {
    if (!socket) {
      dispatch(showError('Socket not connected'));
      return;
    }

    if (user.role !== 'teacher') {
      dispatch(showError('Only teachers can close polls'));
      return;
    }

    socket.emit('close-poll');
  }, [socket, dispatch, user.role]);

  /**
   * Teacher: Kick Student
   * Usage: kickStudent('student-id-123')
   */
  const kickStudent = useCallback(
    (studentId: string) => {
      if (!socket) {
        dispatch(showError('Socket not connected'));
        return;
      }

      if (user.role !== 'teacher') {
        dispatch(showError('Only teachers can kick students'));
        return;
      }

      socket.emit('kick-student', { studentId });
    },
    [socket, dispatch, user.role]
  );

  /**
   * Teacher: Get Poll History
   * Usage: getPollHistory()
   */
  const getPollHistory = useCallback(() => {
    if (!socket) {
      dispatch(showError('Socket not connected'));
      return;
    }

    if (user.role !== 'teacher') {
      dispatch(showError('Only teachers can view history'));
      return;
    }

    socket.emit('get-poll-history');
  }, [socket, dispatch, user.role]);

  /* ==================== STUDENT ACTIONS ==================== */

  /**
   * Student: Join Session
   * Usage: joinSession('John Doe')
   */
  const joinSession = useCallback(
    (name: string) => {
      if (!socket) {
        dispatch(showError('Socket not connected'));
        return;
      }

      dispatch(setLoading(true));
      dispatch(setUserRole('student'));
      dispatch(setUserInfo({ name }));

      socket.emit('join-session', { name });
    },
    [socket, dispatch]
  );

  /**
   * Student: Submit Answer
   * Usage: submitAnswer('option-id-123')
   */
  const submitAnswer = useCallback(
    (optionId: string) => {
      if (!socket) {
        dispatch(showError('Socket not connected'));
        return;
      }

      if (user.role !== 'student') {
        dispatch(showError('Only students can submit answers'));
        return;
      }

      const payload: SubmitAnswerPayload = { optionId };
      socket.emit('submit-answer', payload);

      // Update local state immediately (optimistic update)
      dispatch(answerSubmitted({ optionId }));
    },
    [socket, dispatch, user.role]
  );

  /* ==================== COMMON ACTIONS ==================== */

  /**
   * Send Chat Message
   * Usage: sendMessage('Hello everyone!')
   */
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket) {
        dispatch(showError('Socket not connected'));
        return;
      }

      if (!user.role) {
        dispatch(showError('Join session first to chat'));
        return;
      }

      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        return; // Empty message
      }

      socket.emit('send-message', { message: trimmedMessage });
    },
    [socket, dispatch, user.role]
  );

  /**
   * Get Current State
   * Usage: getCurrentState()
   */
  const getCurrentState = useCallback(() => {
    if (!socket) {
      dispatch(showError('Socket not connected'));
      return;
    }

    socket.emit('get-current-state');
  }, [socket, dispatch]);

  /**
   * Disconnect Socket
   * Usage: disconnect()
   */
  const disconnect = useCallback(() => {
    if (!socket) return;

    socket.disconnect();
  }, [socket]);

  /**
   * Manually Connect Socket
   * Usage: connectSocket()
   *
   * Note: Usually socket auto-connects, but ye manual connect ke liye hai
   */
  const connectSocket = useCallback(() => {
    if (!socket) {
      dispatch(showError('Socket instance not available'));
      return;
    }

    if (socket.connected) {
      console.log('Socket already connected');
      return;
    }

    dispatch(setLoading(true));
    socket.connect();

    // Optional: Add listeners for connection events
    socket.once('connect', () => {
      dispatch(setLoading(false));
      console.log('Socket connected successfully');
    });

    socket.once('connect_error', (error) => {
      dispatch(setLoading(false));
      dispatch(showError(`Connection failed: ${error.message}`));
    });
  }, [socket, dispatch]);

  // Return all actions
  return {
    // Teacher actions
    startSession,
    createPoll,
    closePoll,
    kickStudent,
    getPollHistory,

    // Student actions
    joinSession,
    submitAnswer,

    // Common actions
    sendMessage,
    getCurrentState,
    disconnect,
    connectSocket,
  };
};

/* 
============================================
        HELPER HOOK: useSocketStatus
============================================
*/

/**
 * Get socket connection status
 * Usage: const { isConnected, isReady } = useSocketStatus()
 */
export const useSocketStatus = () => {
  const { socket, isConnected } = useSocket();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useAppSelector((state: any) => state.user);

  return {
    socket,
    isConnected,
    isReady: isConnected && !!user.role, // Ready = Connected + Role selected
    hasRole: !!user.role,
    role: user.role,
  };
};
