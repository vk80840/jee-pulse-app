export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  type: 'text' | 'topic';
  subject?: string;
  chapter?: string;
  topic?: string;
}

export interface SleepData {
  bedtime?: string;
  wakeTime?: string;
  totalHours?: number;
}

export interface StudySession {
  chapter: string;
  topic: string;
  count: number;
}

export interface StudyData {
  [subject: string]: {
    target: number;
    practiced: StudySession[];
  };
}

export interface Lecture {
  subject: string;
  chapter: string;
  topic: string;
  duration: number; // in minutes
}

export interface DailyLogData {
  date: string;
  goals: Goal[];
  sleep: SleepData;
  studyData: StudyData;
  lectures: Lecture[];
  notes: string;
  schoolAttendance: 'present' | 'absent' | 'holiday' | '';
}

export interface SubjectStructure {
  [subject: string]: {
    [chapter: string]: string[];
  };
}

export interface TopicProgress {
  subject: string;
  chapter: string;
  topic: string;
  questionsCompleted: number;
  lecturesAttended: number;
  goalsCompleted: number;
}

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  totalQuestions: number;
  totalStudyTime: number;
  attendancePercentage: number;
}
