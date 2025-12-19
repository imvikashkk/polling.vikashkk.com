import { Poll, Student, PollHistory } from '../types/index.js';

/**
 * RoomManager - Poore session ka state manage karta hai
 *
 * Ye class singleton pattern use karti hai, matlab sirf ek hi instance
 * poore application me hoga. Ye teacher, students, polls sab manage karega.
 */
class RoomManager {
  // Constant room ID - sab isi room me join honge
  public readonly SESSION_ID = 'LIVE_SESSION';

  // Teacher ka data
  private teacher: { socketId: string; name: string } | null = null;

  // Students ka Map - O(1) me access ke liye
  private students: Map<string, Student> = new Map();

  // Current active poll
  private currentPoll: Poll | null = null;

  // Poll timer reference - clear karne ke liye
  private pollTimer: NodeJS.Timeout | null = null;

  // Poll history - past polls store karne ke liye (bonus feature)
  private pollHistory: PollHistory[] = [];

  /* ===============================
     SESSION MANAGEMENT
     
     Session = Teacher + Students ka active connection
  =============================== */

  // Check karo ki koi teacher active hai ya nahi
  hasActiveSession(): boolean {
    return this.teacher !== null;
  }

  // Naya session start karo (teacher join karta hai)
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

  // Teacher ka socket ID get karo (kick functionality ke liye)
  getTeacherSocketId(): string | null {
    return this.teacher?.socketId || null;
  }

  // Teacher ka naam get karo
  getTeacherName(): string | null {
    return this.teacher?.name || null;
  }

  /* ===============================
     STUDENT MANAGEMENT
     
     Students ko add/remove karna aur track karna
  =============================== */

  // Naya student add karo
  addStudent(student: Student): void {
    this.students.set(student.id, student);
    console.log(
      `Student added: ${student.name} (Total: ${this.students.size})`
    );
  }

  // Student ko remove karo (disconnect ya kick)
  removeStudent(studentId: string): void {
    const student = this.students.get(studentId);
    if (student) {
      this.students.delete(studentId);
      console.log(
        `Student removed: ${student.name} (Remaining: ${this.students.size})`
      );
    }
  }

  // Saare students ki list return karo
  getStudents(): Student[] {
    return Array.from(this.students.values());
  }

  // Student ko ID se find karo
  getStudent(studentId: string): Student | undefined {
    return this.students.get(studentId);
  }

  // Saare students ka hasAnswered flag reset karo (naye poll ke liye)
  resetStudentAnswers(): void {
    this.students.forEach((student) => {
      student.hasAnswered = false;
    });
    console.log('All student answers reset');
  }

  // Check karo ki saare students ne answer diya hai ya nahi
  allStudentsAnswered(): boolean {
    if (this.students.size === 0) return true; // Koi student nahi to true

    const allAnswered = Array.from(this.students.values()).every(
      (student) => student.hasAnswered
    );

    return allAnswered;
  }

  // Kitne students ne answer diya - stats ke liye
  getAnsweredCount(): number {
    return Array.from(this.students.values()).filter((s) => s.hasAnswered)
      .length;
  }

  /* ===============================
     POLL MANAGEMENT
     
     Current active poll ko manage karna
  =============================== */

  // Naya poll set karo
  setPoll(poll: Poll): void {
    this.currentPoll = poll;
    console.log(`Poll set: ${poll.question}`);
  }

  // Current poll get karo
  getPoll(): Poll | null {
    return this.currentPoll;
  }

  // Check karo ki active poll hai ya nahi
  hasActivePoll(): boolean {
    return this.currentPoll !== null && this.currentPoll.isActive;
  }

  // Poll timer set karo
  setPollTimer(timer: NodeJS.Timeout): void {
    this.clearPollTimer(); // Pehle purana clear kar lo
    this.pollTimer = timer;
  }

  // Poll timer clear karo
  clearPollTimer(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      console.log('Poll timer cleared');
    }
  }

  /**
   * Student ka vote record karo
   *
   * @param userId - Student ki unique ID
   * @param optionId - Jis option ko vote diya
   * @returns boolean - Success/Failure
   */
  recordVote(userId: string, optionId: string): boolean {
    const poll = this.currentPoll;

    // Validations
    if (!poll || !poll.isActive) {
      console.log('Vote failed: No active poll');
      return false;
    }

    if (poll.votes.has(userId)) {
      console.log('Vote failed: Already voted');
      return false;
    }

    // Vote record karo
    poll.votes.set(userId, optionId);

    // Option ki vote count increase karo
    const option = poll.options.find((o) => o.id === optionId);
    if (option) {
      option.votes += 1;
    }

    // Student ka hasAnswered flag set karo
    const student = this.students.get(userId);
    if (student) {
      student.hasAnswered = true;
      console.log(`Vote recorded: ${student.name} → ${option?.text}`);
    }

    return true;
  }

  /**
   * Poll ke results return karo
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

  /**
   * Detailed results with percentages
   */
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

  /**
   * Poll close karo aur history me save karo
   */
  closePoll(): void {
    if (!this.currentPoll) return;

    this.currentPoll.isActive = false;
    this.clearPollTimer();

    // History me save karo (bonus feature)
    this.savePollToHistory(this.currentPoll);

    console.log('Poll closed');
  }

  /* ===============================
     POLL HISTORY (BONUS FEATURE)
     
     Past polls ko store karna aur retrieve karna
  =============================== */

  /**
   * Poll ko history me save karo
   */
  private savePollToHistory(poll: Poll): void {
    const participants: PollHistory['participants'] = [];

    // Har vote ke liye participant info store karo
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
      options: poll.options.map((o) => ({ ...o })), // Deep copy
      totalVotes: poll.votes.size,
      createdAt: poll.createdAt,
      closedAt: Date.now(),
      participants,
    };

    this.pollHistory.push(historyEntry);

    // Max 50 polls hi store karo (memory management)
    if (this.pollHistory.length > 50) {
      this.pollHistory.shift(); // Purana wala remove kar do
    }

    console.log(`Poll saved to history (Total: ${this.pollHistory.length})`);
  }

  /**
   * Saari poll history return karo
   */
  getPollHistory(): PollHistory[] {
    return [...this.pollHistory]; // Copy return karo, original nahi
  }

  /**
   * Specific poll ki history get karo
   */
  getPollById(pollId: string): PollHistory | undefined {
    return this.pollHistory.find((p) => p.pollId === pollId);
  }

  /**
   * Poll history clear karo
   */
  clearHistory(): void {
    this.pollHistory = [];
    console.log('Poll history cleared');
  }

  /* ===============================
     UTILITY METHODS
  =============================== */

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

  /**
   * Debug ke liye - poora state print karo
   */
  printState(): void {
    console.log('==================== ROOM STATE ====================');
    console.log('Teacher:', this.teacher?.name || 'None');
    console.log('Students:', this.students.size);
    console.log('Active Poll:', this.currentPoll?.question || 'None');
    console.log('History Count:', this.pollHistory.length);
    console.log('===================================================');
  }
}

// Singleton instance export karo
export default new RoomManager();
