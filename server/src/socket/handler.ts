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
       Ye handler tab call hota hai jab teacher join karta hai.
       Agar already koi teacher hai, to purane wale ko kick out kar dega.
       Ye "acquire" behavior hai jo tumne manga tha.
    =============================== */

    socket.on('start-session', ({ name }: { name: string }) => {
      // Agar already session active hai, to force reset kar do
      if (RoomManager.hasActiveSession()) {
        const oldTeacherSocket = RoomManager.getTeacherSocketId();

        // Purane teacher ko disconnect
        if (oldTeacherSocket) {
          io.to(oldTeacherSocket).emit('teacher-replaced', {
            message: 'Another teacher has taken over the session',
          });
        }

        // Session ko end kar ke naya start karna
        RoomManager.endSession();
        RoomManager.clearHistory(); // Pahle clear kar lete hai history ko
        io.to(RoomManager.SESSION_ID).emit('session-ended');
      }

      // Naya session start karo
      RoomManager.clearHistory(); // Pahle clear kar lete hai history ko
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
       
       Student join karta hai to usko room me add karo.
       Sabko notify karo ki naya student aaya hai.
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

      // Sabko batao naya student aaya
      io.to(RoomManager.SESSION_ID).emit('student-joined', student);

      // Is student ko current poll bhejo agar active hai
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

      console.log(`🎓 Student joined: ${name}`);
    });

    /* ===============================
       TEACHER → CREATE POLL
       
       Teacher naya poll create karta hai.
       Rule: Sabhi students ne previous poll ka answer diya ho tabhi naya poll bana sakte.
    =============================== */
    socket.on('create-poll', (data: CreatePollPayload) => {
      if (role !== 'teacher') {
        socket.emit('error', { message: 'Only teacher can create polls' });
        return;
      }

      // Agar active poll hai aur sabhi students ne answer nahi diya
      if (RoomManager.hasActivePoll()) {
        if (!RoomManager.allStudentsAnswered()) {
          socket.emit('error', {
            message: 'Wait until all students answer the previous question',
          });
          return;
        }
      }

      // Sabhi students ke answers reset karo
      RoomManager.resetStudentAnswers();

      // Naya poll create karo
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

      // Sabko naya poll bhejo
      io.to(RoomManager.SESSION_ID).emit('poll-started', {
        pollId: poll.id,
        question: poll.question,
        options: poll.options,
        timeLimit: poll.timeLimit,
      });

      // Timer start karo
      const timer = setInterval(() => {
        const current = RoomManager.getPoll();
        if (!current || !current.isActive) {
          clearInterval(timer);
          return;
        }

        current.timeRemaining -= 1;

        // Har second time update bhejo
        io.to(RoomManager.SESSION_ID).emit(
          'time-update',
          current.timeRemaining
        );

        // Time khatam ho gaya to poll band kar do
        if (current.timeRemaining <= 0) {
          clearInterval(timer);
          RoomManager.closePoll();

          const results = RoomManager.getResults();
          io.to(RoomManager.SESSION_ID).emit('poll-ended', results);
        }
      }, 1000);

      RoomManager.setPollTimer(timer);
      console.log(`📊 New poll created: ${poll.question}`);
    });

    /* ===============================
       STUDENT → SUBMIT ANSWER
       
       Student apna answer submit karta hai.
       Ek student ek hi baar answer kar sakta hai.
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

      // Answer submit ho gaya
      socket.emit('answer-submitted', { success: true });

      // Sabko updated students list bhejo (hasAnswered update hai)
      io.to(RoomManager.SESSION_ID).emit(
        'students-list',
        RoomManager.getStudents()
      );

      // Real-time results bhejo (teacher ke liye)
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
       
       Teacher kisi bhi student ko session se nikal sakta hai.
       Ye feature tumne specifically manga tha.
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

      // Student ko kicked message bhejo
      io.to(student.socketId).emit('kicked-out', {
        message: 'You have been removed from the session by the teacher',
      });

      // Student ko remove karo
      RoomManager.removeStudent(studentId);

      // Sabko notify karo
      io.to(RoomManager.SESSION_ID).emit('student-removed', {
        studentId,
        studentName: student.name,
      });

      console.log(`Teacher kicked out student: ${student.name}`);
    });

    /* ===============================
       CHAT FUNCTIONALITY
       
       Students aur teacher dono chat kar sakte hain.
       Sabhi messages real-time broadcast honge.
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

      // Sabko message broadcast karo
      io.to(RoomManager.SESSION_ID).emit('new-message', chatMessage);

      console.log(`${role} : ${userName}: ${message}`);
    });

    /* ===============================
       TEACHER → GET POLL HISTORY
       
       Teacher past polls dekh sakta hai.
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
       
       Koi bhi current state request kar sakta hai
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
       Jab koi disconnect hota hai:
       - Student: list se remove karo
       - Teacher: poora session end karo
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
