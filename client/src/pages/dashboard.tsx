import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Flame, Calendar, MessageCircleQuestion, ChevronDown, ChevronUp, School, Check, X } from "lucide-react";
import { StorageManager, SYLLABUS_STRUCTURE } from "@/lib/storage";
import { DailyLogData, UserStats } from "@/lib/data-types";

export default function Dashboard() {
  const [todayLog, setTodayLog] = useState<DailyLogData>(StorageManager.getTodayLog());
  const [userStats, setUserStats] = useState<UserStats>(StorageManager.getUserStats());
  const [weeklyActivity, setWeeklyActivity] = useState(StorageManager.getWeeklyActivity());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayLog(StorageManager.getTodayLog());
      setUserStats(StorageManager.getUserStats());
      setWeeklyActivity(StorageManager.getWeeklyActivity());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleGoalCompletion = (goalId: string) => {
    const goal = todayLog.goals.find(g => g.id === goalId);
    if (goal) {
      StorageManager.updateGoal(goalId, { completed: !goal.completed });
      setTodayLog(StorageManager.getTodayLog());
    }
  };

  const toggleSchoolAttendance = (status: 'present' | 'absent') => {
    const today = new Date().toISOString().split('T')[0];
    StorageManager.updateAttendance(today, status);
    setTodayLog(StorageManager.getTodayLog());
    setWeeklyActivity(StorageManager.getWeeklyActivity());
  };

  const getSubjectProgress = (subject: string) => {
    const syllabusData = StorageManager.getSyllabusProgress();
    const subjectData = SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE];
    
    let subjectTopics: string[] = [];
    if (subject === 'Chemistry') {
      // Chemistry has 3 sub-subjects
      Object.values(subjectData as any || {}).forEach((subSubject: any) => {
        Object.values(subSubject || {}).forEach((topics: any) => {
          if (Array.isArray(topics)) {
            subjectTopics = [...subjectTopics, ...topics];
          }
        });
      });
    } else {
      // Math and Physics have direct chapter -> topics structure
      Object.values(subjectData as any || {}).forEach((topics: any) => {
        if (Array.isArray(topics)) {
          subjectTopics = [...subjectTopics, ...topics];
        }
      });
    }
    
    let completed = 0;
    let total = subjectTopics.length;
    
    subjectTopics.forEach(topic => {
      const progress = Object.values(syllabusData).find(p => 
        p.subject === subject && p.topic === topic
      );
      if (progress && (progress.questionsCompleted > 0 || progress.lecturesAttended > 0)) {
        completed++;
      }
    });
    
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getTodayQuestions = () => {
    let completed = 0;
    let target = 0;
    
    Object.values(todayLog.studyData).forEach(subject => {
      target += subject.target;
      subject.practiced.forEach(session => {
        completed += session.count;
      });
    });
    
    return { completed, target, percentage: target > 0 ? Math.round((completed / target) * 100) : 0 };
  };

  const getTodayStudyTime = () => {
    let totalMinutes = 0;
    todayLog.lectures.forEach(lecture => {
      totalMinutes += lecture.duration;
    });
    return Math.round(totalMinutes / 60 * 10) / 10;
  };

  const getSubjectTodayQuestions = (subject: string) => {
    const subjectData = todayLog.studyData[subject];
    if (!subjectData) return 0;
    
    return subjectData.practiced.reduce((sum, session) => sum + session.count, 0);
  };

  const toggleSubjectExpanded = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const questionsToday = getTodayQuestions();
  const studyTimeToday = getTodayStudyTime();

  const subjects = [
    { name: "Mathematics", emoji: "📐", color: "blue", questions: getSubjectTodayQuestions("Mathematics"), ...getSubjectProgress("Mathematics") },
    { name: "Physics", emoji: "⚛️", color: "red", questions: getSubjectTodayQuestions("Physics"), ...getSubjectProgress("Physics") },
    { name: "Chemistry", emoji: "🧪", color: "green", questions: getSubjectTodayQuestions("Chemistry"), ...getSubjectProgress("Chemistry") }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neumorphic gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {questionsToday.completed}/{questionsToday.target}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <MessageCircleQuestion className="text-primary text-xl" />
              </div>
            </div>
            <div className="mt-3">
              <div className="progress-grey-green">
                <Progress 
                  value={questionsToday.percentage} 
                  className="h-2"
                  data-progress-bar
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{studyTimeToday}h</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                <Clock className="text-secondary text-xl" />
              </div>
            </div>
            <p className="text-xs text-success mt-2">Daily target progress</p>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.currentStreak} days</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Flame className="text-accent text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best: {userStats.bestStreak} days</p>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold text-success">{userStats.attendancePercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                <Calendar className="text-success text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">School attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* School Attendance Quick Marker */}
      <Card className="neumorphic">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <School className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's School Attendance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mark your attendance for today</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={weeklyActivity.find(day => day.date === new Date().toISOString().split('T')[0])?.schoolAttendance === 'present' ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSchoolAttendance('present')}
                className="flex items-center space-x-2"
                data-testid="mark-present"
              >
                <Check className="h-4 w-4" />
                <span>Present</span>
              </Button>
              <Button
                variant={weeklyActivity.find(day => day.date === new Date().toISOString().split('T')[0])?.schoolAttendance === 'absent' ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSchoolAttendance('absent')}
                className="flex items-center space-x-2"
                data-testid="mark-absent"
              >
                <X className="h-4 w-4" />
                <span>Absent</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subject Progress</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpandedSubjects(new Set(expandedSubjects.size === subjects.length ? [] : subjects.map(s => s.name)))}
            data-testid="toggle-all-subjects"
          >
            {expandedSubjects.size === subjects.length ? "Collapse All" : "View All"}
          </Button>
        </div>

        {subjects.map((subject) => (
          <Card key={subject.name} className="neumorphic">
            <CardContent className="p-5">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSubjectExpanded(subject.name)}
                data-testid={`subject-${subject.name.toLowerCase()}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-${subject.color}-500/20 rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{subject.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subject.questions} questions today</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                    <p className={`text-lg font-bold text-${subject.color}-600`}>{subject.percentage}%</p>
                  </div>
                  {expandedSubjects.has(subject.name) ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>
              
              <div className="mt-4">
                <div className="progress-grey-green">
                  <Progress 
                    value={subject.percentage} 
                    className="h-2"
                    data-progress-bar
                  />
                </div>
              </div>

              {expandedSubjects.has(subject.name) && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Completed: {subject.completed}/{subject.total} topics</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Goals */}
      <Card className="neumorphic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Goals</h2>
            <Button variant="ghost" size="sm" data-testid="add-goal">
              + Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayLog.goals.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No goals set for today. Add some goals to track your progress!
              </p>
            ) : (
              todayLog.goals.map((goal) => (
                <div 
                  key={goal.id} 
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-5 h-5 rounded-full border-2 p-0 ${
                      goal.completed 
                        ? "border-success bg-success text-white" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onClick={() => toggleGoalCompletion(goal.id)}
                    data-testid={`goal-toggle-${goal.id}`}
                  >
                    {goal.completed && <CheckCircle className="h-3 w-3" />}
                  </Button>
                  <span 
                    className={`text-gray-900 dark:text-white ${
                      goal.completed ? "line-through opacity-75" : ""
                    }`}
                  >
                    {goal.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="neumorphic">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Week's Activity</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 8);
              const height = Math.max((day.hours / maxHours) * 100, 10);
              
              return (
                <div key={day.date} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{dayName}</p>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-lg transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{day.hours}h</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
