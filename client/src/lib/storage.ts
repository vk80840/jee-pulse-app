import { DailyLogData, Goal, UserStats, TopicProgress } from "./data-types";

const STORAGE_KEYS = {
  DAILY_LOG: 'jee-pulse-daily-log',
  LIFETIME_PROGRESS: 'jee-pulse-lifetime-progress',
  USER_SETTINGS: 'jee-pulse-user-settings',
  SCHOOL_ATTENDANCE: 'jee-pulse-school-attendance',
  SYLLABUS_TRACKING: 'jee-pulse-syllabus-tracking',
  USER_STATS: 'jee-pulse-user-stats'
};

export const SYLLABUS_STRUCTURE = {
  Mathematics: {
    "Algebra": ["Complex Numbers", "Quadratic Equations", "Sequences & Series", "Binomial Theorem", "Permutation & Combination"],
    "Trigonometry": ["Basics", "Identities", "Equations", "Heights & Distances"],
    "Coordinate Geometry": ["Straight Lines", "Circles", "Parabola", "Ellipse", "Hyperbola"],
    "Calculus": ["Limits", "Derivatives", "Applications of Derivatives", "Integration", "Applications of Integration"],
    "3D Geometry": ["Direction Cosines", "Planes", "Lines", "Sphere"],
    "Vectors": ["Basics", "Scalar Products", "Vector Products", "Applications"],
    "Statistics & Probability": ["Statistics", "Probability", "Conditional Probability"]
  },
  Physics: {
    "Mechanics": ["Kinematics", "Newton's Laws", "Work Energy Power", "Rotational Motion", "Gravitation"],
    "Thermodynamics": ["Kinetic Theory", "First Law", "Second Law", "Heat Transfer"],
    "Waves": ["SHM", "Wave Motion", "Sound Waves", "Doppler Effect"],
    "Electrostatics": ["Coulomb's Law", "Electric Field", "Potential", "Capacitors"],
    "Current Electricity": ["Ohm's Law", "Circuits", "Heating Effect", "Chemical Effect"],
    "Magnetic Effects": ["Magnetic Field", "Moving Charges", "Electromagnetic Induction"],
    "Optics": ["Geometrical Optics", "Wave Optics", "Interference", "Diffraction"],
    "Modern Physics": ["Photoelectric Effect", "Atoms", "Nuclei", "Electronics"]
  },
  Chemistry: {
    "Physical Chemistry": ["Atomic Structure", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Kinetics"],
    "Inorganic Chemistry": ["Periodic Table", "s-Block", "p-Block", "d-Block", "f-Block", "Coordination"],
    "Organic Chemistry": ["Basics", "Hydrocarbons", "Functional Groups", "Biomolecules", "Polymers"]
  }
};

export class StorageManager {
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private static getTodayKey(): string {
    return this.formatDate(new Date());
  }

  static getTodayLog(): DailyLogData {
    const today = this.getTodayKey();
    const stored = localStorage.getItem(`${STORAGE_KEYS.DAILY_LOG}_${today}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      date: today,
      goals: [],
      sleep: {},
      studyData: {},
      lectures: [],
      notes: '',
      schoolAttendance: ''
    };
  }

  static saveTodayLog(data: Partial<DailyLogData>): void {
    const today = this.getTodayKey();
    const current = this.getTodayLog();
    const updated = { ...current, ...data };
    
    localStorage.setItem(`${STORAGE_KEYS.DAILY_LOG}_${today}`, JSON.stringify(updated));
    
    // Also save to lifetime progress at end of day
    this.updateLifetimeProgress(updated);
  }

  private static updateLifetimeProgress(dayData: DailyLogData): void {
    const lifetimeData = this.getLifetimeProgress();
    const existingIndex = lifetimeData.findIndex(log => log.date === dayData.date);
    
    if (existingIndex >= 0) {
      lifetimeData[existingIndex] = dayData;
    } else {
      lifetimeData.push(dayData);
    }
    
    localStorage.setItem(STORAGE_KEYS.LIFETIME_PROGRESS, JSON.stringify(lifetimeData));
    this.updateUserStats();
  }

  static getLifetimeProgress(): DailyLogData[] {
    const stored = localStorage.getItem(STORAGE_KEYS.LIFETIME_PROGRESS);
    return stored ? JSON.parse(stored) : [];
  }

  static addGoal(goal: Goal): void {
    const current = this.getTodayLog();
    current.goals.push(goal);
    this.saveTodayLog(current);
  }

  static updateGoal(goalId: string, updates: Partial<Goal>): void {
    const current = this.getTodayLog();
    const goalIndex = current.goals.findIndex(g => g.id === goalId);
    if (goalIndex >= 0) {
      current.goals[goalIndex] = { ...current.goals[goalIndex], ...updates };
      this.saveTodayLog(current);
    }
  }

  static updateSleepData(sleep: Partial<DailyLogData['sleep']>): void {
    const current = this.getTodayLog();
    current.sleep = { ...current.sleep, ...sleep };
    
    // Auto-calculate total hours if both times are present
    if (current.sleep.bedtime && current.sleep.wakeTime) {
      const bedtime = new Date(`2024-01-01 ${current.sleep.bedtime}`);
      const wakeTime = new Date(`2024-01-01 ${current.sleep.wakeTime}`);
      
      // Handle overnight sleep
      if (wakeTime < bedtime) {
        wakeTime.setDate(wakeTime.getDate() + 1);
      }
      
      const diffMs = wakeTime.getTime() - bedtime.getTime();
      current.sleep.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }
    
    this.saveTodayLog(current);
  }

  static addStudySession(subject: string, session: { chapter: string; topic: string; count: number }): void {
    const current = this.getTodayLog();
    
    if (!current.studyData[subject]) {
      current.studyData[subject] = { target: 0, practiced: [] };
    }
    
    current.studyData[subject].practiced.push(session);
    this.saveTodayLog(current);
    
    // Update syllabus tracking
    this.updateSyllabusProgress(subject, session.chapter, session.topic, session.count, 0);
  }

  static setStudyTarget(subject: string, target: number): void {
    const current = this.getTodayLog();
    
    if (!current.studyData[subject]) {
      current.studyData[subject] = { target, practiced: [] };
    } else {
      current.studyData[subject].target = target;
    }
    
    this.saveTodayLog(current);
  }

  static addLecture(lecture: { subject: string; chapter: string; topic: string; duration: number }): void {
    const current = this.getTodayLog();
    current.lectures.push(lecture);
    this.saveTodayLog(current);
    
    // Update syllabus tracking
    this.updateSyllabusProgress(lecture.subject, lecture.chapter, lecture.topic, 0, 1);
  }

  static updateNotes(notes: string): void {
    const current = this.getTodayLog();
    current.notes = notes;
    this.saveTodayLog(current);
  }

  static updateSchoolAttendance(status: 'present' | 'absent' | 'holiday'): void {
    const current = this.getTodayLog();
    current.schoolAttendance = status;
    this.saveTodayLog(current);
  }

  private static updateSyllabusProgress(subject: string, chapter: string, topic: string, questions: number, lectures: number): void {
    const progress = this.getSyllabusProgress();
    const key = `${subject}-${chapter}-${topic}`;
    
    if (!progress[key]) {
      progress[key] = { subject, chapter, topic, questionsCompleted: 0, lecturesAttended: 0, goalsCompleted: 0 };
    }
    
    progress[key].questionsCompleted += questions;
    progress[key].lecturesAttended += lectures;
    
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_TRACKING, JSON.stringify(progress));
  }

  static getSyllabusProgress(): Record<string, TopicProgress> {
    const stored = localStorage.getItem(STORAGE_KEYS.SYLLABUS_TRACKING);
    return stored ? JSON.parse(stored) : {};
  }

  private static updateUserStats(): void {
    const lifetimeData = this.getLifetimeProgress();
    const today = this.getTodayKey();
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let totalQuestions = 0;
    let totalStudyTime = 0;
    let presentDays = 0;
    let totalSchoolDays = 0;
    
    // Sort by date
    const sortedData = lifetimeData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate streaks and totals
    for (let i = 0; i < sortedData.length; i++) {
      const log = sortedData[i];
      
      // Count questions
      Object.values(log.studyData).forEach(subject => {
        subject.practiced.forEach(session => {
          totalQuestions += session.count;
        });
      });
      
      // Count study time (from lectures)
      log.lectures.forEach(lecture => {
        totalStudyTime += lecture.duration;
      });
      
      // Count attendance
      if (log.schoolAttendance === 'present') presentDays++;
      if (log.schoolAttendance === 'present' || log.schoolAttendance === 'absent') totalSchoolDays++;
      
      // Calculate streaks based on goals completion
      const hasActivity = log.goals.some(g => g.completed) || 
                         Object.keys(log.studyData).length > 0 || 
                         log.lectures.length > 0;
      
      if (hasActivity) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
        
        // Check if this continues to today
        const logDate = new Date(log.date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const daysDiff = Math.floor((todayDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0 || (i === sortedData.length - 1 && daysDiff <= 1)) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
    
    const stats: UserStats = {
      currentStreak,
      bestStreak,
      totalQuestions,
      totalStudyTime: Math.round(totalStudyTime / 60 * 10) / 10, // Convert to hours
      attendancePercentage: totalSchoolDays > 0 ? Math.round((presentDays / totalSchoolDays) * 100) : 0
    };
    
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  }

  static getUserStats(): UserStats {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default stats
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalQuestions: 0,
      totalStudyTime: 0,
      attendancePercentage: 0
    };
  }

  static getWeeklyActivity(): Array<{ date: string; hours: number }> {
    const lifetimeData = this.getLifetimeProgress();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      
      const dayLog = lifetimeData.find(log => log.date === dateStr);
      let hours = 0;
      
      if (dayLog) {
        dayLog.lectures.forEach(lecture => {
          hours += lecture.duration;
        });
      }
      
      weekData.push({
        date: dateStr,
        hours: Math.round(hours / 60 * 10) / 10
      });
    }
    
    return weekData;
  }

  static exportData(): string {
    return JSON.stringify({
      lifetimeProgress: this.getLifetimeProgress(),
      syllabusProgress: this.getSyllabusProgress(),
      userStats: this.getUserStats()
    }, null, 2);
  }

  static resetTodayLog(): void {
    const today = this.getTodayKey();
    localStorage.removeItem(`${STORAGE_KEYS.DAILY_LOG}_${today}`);
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clear individual daily logs
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.DAILY_LOG)) {
        localStorage.removeItem(key);
      }
    });
  }
}
