import { Poll, Student, PollHistory } from '../types/index.js';

/**
 * RoomManager - To manage the entire session state
 *
 * This class uses the singleton pattern, meaning there will be only one instance
 * throughout the application. It will manage the teacher, students, polls, etc.
 */
class RoomManager {
  // Constant room ID - all users will join this room
  public readonly SESSION_ID = 'LIVE_SESSION';

  // Teacher data
  private teacher: { socketId: string; name: string } | null = null;

  // Students Map - for O(1) access
  private students: Map<string, Student> = new Map();

  // Current active poll
  private currentPoll: Poll | null = null;

  // Poll timer reference - to clear
  private pollTimer: NodeJS.Timeout | null = null;

  // Poll history - to store past polls (bonus feature)
  private pollHistory: PollHistory[] = [];

  /* ===============================
     SESSION MANAGEMENT
     
     Session = Active Connection of Teacher + Students
  =============================== */

  // to Check if a teacher is active or not
  hasActiveSession(): boolean {
    return this.teacher !== null;
  }

  // Start a new session (when teacher joins)
  startSession(socketId: string, name: string): void {
    this.teacher = { socketId, name };
    console.log(`Session started by: ${name}`);
  }

  // Session end karo aur sab kuch clear kar do
  endSession(): void {
    this.clearPollTimer();
    this.teacher = null;
    this.students.clear();
    this.currentPoll = null;
    console.log('Session ended');
  }

  // to Get Teacher's socket ID (for kick functionality)
  getTeacherSocketId(): string | null {
    return this.teacher?.socketId || null;
  }

  // Get Teacher's name
  getTeacherName(): string | null {
    return this.teacher?.name || null;
  }

  /* ===============================
     STUDENT MANAGEMENT
     Add/remove Students and track them
  =============================== */

  // Add a new student
  addStudent(student: Student): void {
    this.students.set(student.id, student);
    console.log(
      `Student added: ${student.name} (Total: ${this.students.size})`
    );
  }

  // remove a student (disconnect or kick)
  removeStudent(studentId: string): void {
    const student = this.students.get(studentId);
    if (student) {
      this.students.delete(studentId);
      console.log(
        `Student removed: ${student.name} (Remaining: ${this.students.size})`
      );
    }
  }

  // Get the list of all students
  getStudents(): Student[] {
    return Array.from(this.students.values());
  }

  // Student ko ID se find karo
  getStudent(studentId: string): Student | undefined {
    return this.students.get(studentId);
  }

  // reset all students hasAnswered flag (for new poll)
  resetStudentAnswers(): void {
    this.students.forEach((student) => {
      student.hasAnswered = false;
    });
    console.log('All student answers reset');
  }

  // Check if all students have answered or not
  allStudentsAnswered(): boolean {
    if (this.students.size === 0) return true; // No students means true

    const allAnswered = Array.from(this.students.values()).every(
      (student) => student.hasAnswered
    );

    return allAnswered;
  }

  // How many students have answered
  getAnsweredCount(): number {
    return Array.from(this.students.values()).filter((s) => s.hasAnswered)
      .length;
  }

  /* ===============================
     POLL MANAGEMENT
     to manage Ccurrent active poll
  =============================== */

  // Create a new poll
  setPoll(poll: Poll): void {
    this.currentPoll = poll;
    console.log(`Poll set: ${poll.question}`);
  }

  // to get current poll
  getPoll(): Poll | null {
    return this.currentPoll;
  }

  // Check if there is an active poll or not
  hasActivePoll(): boolean {
    return this.currentPoll !== null && this.currentPoll.isActive;
  }

  // to set poll timer
  setPollTimer(timer: NodeJS.Timeout): void {
    this.clearPollTimer(); // Clear the previous timer first
    this.pollTimer = timer;
  }

  // Clear the poll timer
  clearPollTimer(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      console.log('Poll timer cleared');
    }
  }

  /**
   * Record a student's vote
   *
   * @param userId - Student's unique ID
   * @param optionId - The option voted for
   * @returns boolean - Success/Failure
   */
  recordVote(userId: string, optionId: string): boolean {
    const poll = this.currentPoll;

    // Validations
    if (!poll || !poll.isActive) {
      console.log('Vote failed: No active poll');
      return false;
    }

    // check if already voted
    if (poll.votes.has(userId)) {
      console.log('Vote failed: Already voted');
      return false;
    }

    // Record the vote
    poll.votes.set(userId, optionId);

    // Increase the vote count for the option
    const option = poll.options.find((o) => o.id === optionId);
    if (option) {
      option.votes += 1;
    }

    // set student's hasAnswered flag
    const student = this.students.get(userId);
    if (student) {
      student.hasAnswered = true;
      console.log(`Vote recorded: ${student.name} → ${option?.text}`);
    }

    return true;
  }

  /**
   * return all poll results
   * Format: { optionId: voteCount }
   */
  getResults(): Record<string, number> {
    const poll = this.currentPoll;
    if (!poll) return {};
    const results: Record<string, number> = {};
    poll.options.forEach((option) => {
      results[option.id] = option.votes;
    });
    return results;
  }

  // Detailed results with percentages
  getDetailedResults() {
    const poll = this.currentPoll;
    if (!poll) return null;

    const totalVotes = poll.votes.size;

    return poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      votes: option.votes,
      percentage:
        totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
    }));
  }

  // close poll & save to history
  closePoll(): void {
    if (!this.currentPoll) return;

    this.currentPoll.isActive = false;
    this.clearPollTimer();

    // Save to history (bonus feature)
    this.savePollToHistory(this.currentPoll);

    console.log('Poll closed');
  }

  /* ===============================
     POLL HISTORY
     to store & retrieve past polls
  =============================== */

  // Save poll to history
  private savePollToHistory(poll: Poll): void {
    const participants: PollHistory['participants'] = [];

    // to store participant info for each vote
    poll.votes.forEach((optionId, studentId) => {
      const student = this.students.get(studentId);
      if (student) {
        participants.push({
          studentId: student.id,
          studentName: student.name,
          selectedOption: optionId,
        });
      }
    });

    const historyEntry: PollHistory = {
      pollId: poll.id,
      question: poll.question,
      options: structuredClone(poll.options), // Deep copy
      totalVotes: poll.votes.size,
      createdAt: poll.createdAt,
      closedAt: Date.now(),
      participants,
    };

    this.pollHistory.push(historyEntry);

    // store max 100 polls in store (for memory management)
    if (this.pollHistory.length > 100) {
      this.pollHistory.shift(); // Remove the oldest one
    }

    console.log(`Poll saved to history (Total: ${this.pollHistory.length})`);
  }

  // Return all poll history
  getPollHistory(): PollHistory[] {
    return structuredClone(this.pollHistory);
  }

  // return specific poll's history by ID
  getPollById(pollId: string): PollHistory | undefined {
    return this.pollHistory.find((p) => p.pollId === pollId);
  }

  // Poll history clear karo
  clearHistory(): void {
    this.pollHistory = [];
    console.log('Poll history cleared');
  }

  /**
   * Current session ka complete state return karo
   */
  getSessionState() {
    return {
      hasActiveSession: this.hasActiveSession(),
      teacher: this.teacher,
      studentsCount: this.students.size,
      students: this.getStudents(),
      currentPoll: this.currentPoll
        ? {
            id: this.currentPoll.id,
            question: this.currentPoll.question,
            isActive: this.currentPoll.isActive,
            timeRemaining: this.currentPoll.timeRemaining,
            totalVotes: this.currentPoll.votes.size,
            answeredCount: this.getAnsweredCount(),
          }
        : null,
      historyCount: this.pollHistory.length,
    };
  }

  // Debugging: Print current room state
  printState(): void {
    console.log('==================== ROOM STATE ====================');
    console.log('Teacher:', this.teacher?.name || 'None');
    console.log('Students:', this.students.size);
    console.log('Active Poll:', this.currentPoll?.question || 'None');
    console.log('History Count:', this.pollHistory.length);
    console.log('===================================================');
  }
}

// export singleton instance
export default new RoomManager();
