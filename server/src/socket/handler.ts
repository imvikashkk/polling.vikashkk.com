import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import RoomManager from './RoomManager.js';
import {
  CreatePollPayload,
  SubmitAnswerPayload,
  Poll,
  Student,
  ChatMessage,
} from '../types/index.js';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Connected:', socket.id);

    let role: 'teacher' | 'student' | null = null;
    let userId: string | null = null;
    let userName: string | null = null;

    /* ===============================
       TEACHER → START / OVERRIDE SESSION
       This handler calls when teacher joins.
       If a teacher already exists, it will kick out the old one.
       This is an acquire behavior.
    =============================== */

    socket.on('start-session', ({ name }: { name: string }) => {
      // if session already active then force to reset

      if (RoomManager.hasActiveSession()) {
        const oldTeacherSocket = RoomManager.getTeacherSocketId();

        // Disconnect the old teacher
        if (oldTeacherSocket) {
          io.to(oldTeacherSocket).emit('teacher-replaced', {
            message: 'Another teacher has taken over the session',
          });
        }

        // End the session
        RoomManager.endSession();
        RoomManager.clearHistory(); // Clear history first
        io.to(RoomManager.SESSION_ID).emit('session-ended');
      }

      // start new session
      RoomManager.clearHistory(); // Clear history first
      RoomManager.startSession(socket.id, name);
      socket.join(RoomManager.SESSION_ID);

      role = 'teacher';
      userName = name;

      // Teacher ko success message bhejo
      socket.emit('session-started', {
        students: RoomManager.getStudents(),
        pollHistory: RoomManager.getPollHistory(), // Past polls
      });

      console.log(`Teacher started session: ${name}`);
    });

    /* ===============================
       STUDENT → JOIN SESSION
       if student join then add to room
       Notify everyone about new student
    =============================== */

    socket.on('join-session', ({ name }: { name: string }) => {
      if (!RoomManager.hasActiveSession()) {
        socket.emit('error', {
          message: 'Session has not started yet. Wait for teacher.',
        });
        return;
      }

      role = 'student';
      userId = uuidv4();
      userName = name;

      const student: Student = {
        id: userId,
        name,
        socketId: socket.id,
        hasAnswered: false,
        joinedAt: Date.now(),
      };

      RoomManager.addStudent(student);
      socket.join(RoomManager.SESSION_ID);

      // Notify to all that a new student has joined
      io.to(RoomManager.SESSION_ID).emit('student-joined', student);

      // Send current poll to this student if active
      const currentPoll = RoomManager.getPoll();
      socket.emit('join-success', {
        userId,
        currentPoll: currentPoll?.isActive
          ? {
              pollId: currentPoll.id,
              question: currentPoll.question,
              options: currentPoll.options,
              timeRemaining: currentPoll.timeRemaining,
            }
          : null,
      });

      console.log(`Student joined: ${name}`);
    });

    /* ===============================
      TEACHER → CREATE POLL
      Teacher creates new poll
      Rule: If all students have answered previous poll only then create new poll.
    =============================== */

    socket.on('create-poll', (data: CreatePollPayload) => {
      if (role !== 'teacher') {
        socket.emit('error', { message: 'Only teacher can create polls' });
        return;
      }

      // if active poll exists and not all students answered
      if (RoomManager.hasActivePoll()) {
        if (!RoomManager.allStudentsAnswered()) {
          socket.emit('error', {
            message: 'Wait until all students answer the previous question',
          });
          return;
        }
      }

      // Reset all students' answers
      RoomManager.resetStudentAnswers();

      // Create new poll
      const poll: Poll = {
        id: uuidv4(),
        question: data.question,
        options: data.options.map((o) => ({ ...o, votes: 0 })),
        timeLimit: data.timeLimit,
        timeRemaining: data.timeLimit,
        isActive: true,
        createdAt: Date.now(),
        votes: new Map(),
      };

      RoomManager.setPoll(poll);

      // Send new poll to everyone
      io.to(RoomManager.SESSION_ID).emit('poll-started', {
        pollId: poll.id,
        question: poll.question,
        options: poll.options,
        timeLimit: poll.timeLimit,
      });

      // Start timer
      const timer = setInterval(() => {
        const current = RoomManager.getPoll();
        if (!current || !current.isActive) {
          clearInterval(timer);
          return;
        }

        current.timeRemaining -= 1;

        // Send time update every second
        io.to(RoomManager.SESSION_ID).emit(
          'time-update',
          current.timeRemaining
        );

        // If time is up, close the poll
        if (current.timeRemaining <= 0) {
          clearInterval(timer);
          RoomManager.closePoll();

          const results = RoomManager.getResults();
          io.to(RoomManager.SESSION_ID).emit('poll-ended', results);
        }
      }, 1000);

      RoomManager.setPollTimer(timer);
      console.log(`New poll created: ${poll.question}`);
    });

    /* ===============================
       STUDENT → SUBMIT ANSWER

       Student submits their answer.
       A student can submit an answer only once.
    =============================== */
    socket.on('submit-answer', (data: SubmitAnswerPayload) => {
      if (role !== 'student' || !userId) {
        socket.emit('error', { message: 'Only students can submit answers' });
        return;
      }

      const success = RoomManager.recordVote(userId, data.optionId);

      if (!success) {
        socket.emit('error', {
          message: 'You have already answered or poll is closed',
        });
        return;
      }

      // Answer submitted
      socket.emit('answer-submitted', { success: true });

      // Send updated students list (hasAnswered update)
      io.to(RoomManager.SESSION_ID).emit(
        'students-list',
        RoomManager.getStudents()
      );

      // Send real-time results (for teacher)
      io.to(RoomManager.SESSION_ID).emit(
        'live-results',
        RoomManager.getResults()
      );

      console.log(`Student ${userName} answered`);
    });

    /* ===============================
       TEACHER → CLOSE POLL MANUALLY
       
       Teacher poll ko manually close kar sakta hai
       time khatam hone se pehle bhi.
    =============================== */
    socket.on('close-poll', () => {
      if (role !== 'teacher') {
        socket.emit('error', { message: 'Only teacher can close polls' });
        return;
      }

      RoomManager.closePoll();
      const results = RoomManager.getResults();

      io.to(RoomManager.SESSION_ID).emit('poll-ended', results);
      console.log('Poll closed by teacher');
    });

    /* ===============================
       TEACHER → KICK OUT STUDENT
       Teacher can kick out any student from the session.
    =============================== */
    socket.on('kick-student', ({ studentId }: { studentId: string }) => {
      if (role !== 'teacher') {
        socket.emit('error', { message: 'Only teacher can kick students' });
        return;
      }

      const student = RoomManager.getStudents().find((s) => s.id === studentId);
      if (!student) {
        socket.emit('error', { message: 'Student not found' });
        return;
      }

      // Send kicked message to student
      io.to(student.socketId).emit('kicked-out', {
        message: 'You have been removed from the session by the teacher',
      });

      // Remove student
      RoomManager.removeStudent(studentId);

      // Notify everyone
      io.to(RoomManager.SESSION_ID).emit('student-removed', {
        studentId,
        studentName: student.name,
      });

      console.log(`Teacher kicked out student: ${student.name}`);
    });

    /* ===============================
       CHAT FUNCTIONALITY
       Student and Teacher can chat.
       All messages will be broadcasted in real-time.
    =============================== */

    socket.on('send-message', ({ message }: { message: string }) => {
      if (!role || !userName) {
        socket.emit('error', { message: 'Join session first to chat' });
        return;
      }

      const chatMessage: ChatMessage = {
        id: uuidv4(),
        senderId: userId || socket.id,
        senderName: userName,
        senderRole: role,
        message: message.trim(),
        timestamp: Date.now(),
      };

      // broadcast message to everyone
      io.to(RoomManager.SESSION_ID).emit('new-message', chatMessage);

      console.log(`${role} : ${userName}: ${message}`);
    });

    /* ===============================
       TEACHER → GET POLL HISTORY
       Teacher can view past polls.
    =============================== */

    socket.on('get-poll-history', () => {
      if (role !== 'teacher') {
        socket.emit('error', { message: 'Only teacher can view history' });
        return;
      }

      const history = RoomManager.getPollHistory();
      socket.emit('poll-history', history);
    });

    /* ===============================
       GET CURRENT STATE
       Student or Teacher 
       
       Anyone can request the current state
       (students list, current poll, etc.)
    =============================== */
    socket.on('get-current-state', () => {
      const currentPoll = RoomManager.getPoll();
      const students = RoomManager.getStudents();
      socket.emit('current-state', {
        hasActiveSession: RoomManager.hasActiveSession(),
        students,
        currentPoll: currentPoll?.isActive
          ? {
              pollId: currentPoll.id,
              question: currentPoll.question,
              options: currentPoll.options,
              timeRemaining: currentPoll.timeRemaining,
            }
          : null,
      });
    });

    /* ===============================
       DISCONNECT
       When someone disconnects from socket
       - Student: remove from list
       - Teacher: end the entire session
    =============================== */
    socket.on('disconnect', () => {
      if (role === 'student' && userId) {
        RoomManager.removeStudent(userId);
        io.to(RoomManager.SESSION_ID).emit('student-left', {
          studentId: userId,
          studentName: userName,
        });
        console.log(`Student disconnected: ${userName}`);
      }

      if (role === 'teacher') {
        RoomManager.endSession();
        io.to(RoomManager.SESSION_ID).emit('session-ended', {
          message: 'Teacher has left. Session ended.',
        });
        console.log('Teacher disconnected - Session ended');
      }
    });
  });
};
