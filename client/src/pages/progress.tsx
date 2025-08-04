import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { StorageManager } from "@/lib/storage";
import { UserStats, DailyLogData } from "@/lib/data-types";
import { TrendingUp, Clock, BookOpen, Calendar as CalendarIcon, BarChart3, Award } from "lucide-react";

export default function ProgressPage() {
  const [userStats, setUserStats] = useState<UserStats>(StorageManager.getUserStats());
  const [lifetimeData, setLifetimeData] = useState<DailyLogData[]>(StorageManager.getLifetimeProgress());
  const [weeklyActivity, setWeeklyActivity] = useState(StorageManager.getWeeklyActivity());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setUserStats(StorageManager.getUserStats());
      setLifetimeData(StorageManager.getLifetimeProgress());
      setWeeklyActivity(StorageManager.getWeeklyActivity());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleAttendance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const currentAttendance = attendanceData.attendanceMap.get(dateStr);
    
    let newStatus: 'present' | 'absent' | 'holiday';
    if (!currentAttendance || currentAttendance === 'absent') {
      newStatus = 'present';
    } else if (currentAttendance === 'present') {
      newStatus = 'absent';
    } else {
      newStatus = 'present';
    }
    
    StorageManager.updateAttendance(dateStr, newStatus);
    setLifetimeData(StorageManager.getLifetimeProgress());
    setUserStats(StorageManager.getUserStats());
  };

  const getAttendanceData = () => {
    const attendanceMap = new Map<string, 'present' | 'absent' | 'holiday'>();
    let presentDays = 0;
    let absentDays = 0;
    let totalDays = 0;

    lifetimeData.forEach(log => {
      if (log.schoolAttendance) {
        attendanceMap.set(log.date, log.schoolAttendance as 'present' | 'absent' | 'holiday');
        if (log.schoolAttendance === 'present') presentDays++;
        if (log.schoolAttendance === 'absent') absentDays++;
        if (log.schoolAttendance !== 'holiday') totalDays++;
      }
    });

    // Add Sundays as automatic holidays
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (date.getDay() === 0 && !attendanceMap.has(dateStr)) {
        attendanceMap.set(dateStr, 'holiday');
      }
    }

    return { attendanceMap, presentDays, absentDays, totalDays };
  };

  const attendanceData = getAttendanceData();

  const getSubjectWiseStats = () => {
    const subjectStats = {
      Mathematics: { questions: 0, time: 0 },
      Physics: { questions: 0, time: 0 },  
      Chemistry: { questions: 0, time: 0 }
    };

    lifetimeData.forEach(log => {
      // Count questions
      Object.entries(log.studyData).forEach(([subject, data]) => {
        if (subjectStats[subject as keyof typeof subjectStats]) {
          data.practiced.forEach(session => {
            subjectStats[subject as keyof typeof subjectStats].questions += session.count;
          });
        }
      });

      // Count lecture time
      log.lectures.forEach(lecture => {
        if (subjectStats[lecture.subject as keyof typeof subjectStats]) {
          subjectStats[lecture.subject as keyof typeof subjectStats].time += lecture.duration;
        }
      });
    });

    return subjectStats;
  };

  const getLast30DaysAverage = () => {
    const last30Days = lifetimeData.slice(-30);
    let totalQuestions = 0;
    let totalStudyTime = 0;
    let activeDays = 0;

    last30Days.forEach(log => {
      let dayQuestions = 0;
      let dayTime = 0;

      Object.values(log.studyData).forEach(subject => {
        subject.practiced.forEach(session => {
          dayQuestions += session.count;
        });
      });

      log.lectures.forEach(lecture => {
        dayTime += lecture.duration;
      });

      if (dayQuestions > 0 || dayTime > 0) {
        activeDays++;
        totalQuestions += dayQuestions;
        totalStudyTime += dayTime;
      }
    });

    return {
      avgQuestions: activeDays > 0 ? Math.round(totalQuestions / activeDays) : 0,
      avgStudyTime: activeDays > 0 ? Math.round((totalStudyTime / activeDays) / 60 * 10) / 10 : 0
    };
  };

  const getDailyRoutineBreakdown = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = lifetimeData.find(log => log.date === today);
    
    if (!todayLog) {
      return { sleep: 0, study: 0, school: 8, idle: 16 };
    }

    const sleepHours = todayLog.sleep.totalHours || 0;
    const studyHours = todayLog.lectures.reduce((sum, lecture) => sum + lecture.duration, 0) / 60;
    const schoolHours = todayLog.schoolAttendance === 'present' ? 6 : 0;
    const idleHours = Math.max(0, 24 - sleepHours - studyHours - schoolHours);

    return { sleep: sleepHours, study: studyHours, school: schoolHours, idle: idleHours };
  };

  const { attendanceMap, presentDays, absentDays, totalDays } = getAttendanceData();
  const subjectStats = getSubjectWiseStats();
  const avgStats = getLast30DaysAverage();
  const routineBreakdown = getDailyRoutineBreakdown();

  const getDateStyle = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const status = attendanceMap.get(dateStr);
    
    if (status === 'present') return 'bg-green-500 text-white hover:bg-green-600';
    if (status === 'absent') return 'bg-red-500 text-white hover:bg-red-600';
    if (status === 'holiday') return 'bg-gray-300 text-gray-700 hover:bg-gray-400';
    return '';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lifetimeData.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalQuestions}</p>
              </div>
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalStudyTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Sleep</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lifetimeData.length > 0 
                    ? Math.round(lifetimeData.reduce((sum, log) => sum + (log.sleep.totalHours || 0), 0) / lifetimeData.length * 10) / 10
                    : 0
                  }h
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Routine Breakdown */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Daily Routine Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div 
                className="bg-blue-500 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${(routineBreakdown.sleep / 24) * 100}%` }}
              >
                Sleep
              </div>
              <div 
                className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${(routineBreakdown.study / 24) * 100}%` }}
              >
                Study
              </div>
              <div 
                className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${(routineBreakdown.school / 24) * 100}%` }}
              >
                School
              </div>
              <div 
                className="bg-gray-400 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${(routineBreakdown.idle / 24) * 100}%` }}
              >
                Idle
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <p className="font-medium text-blue-600">Sleep</p>
                <p>{Math.round(routineBreakdown.sleep * 10) / 10}h</p>
              </div>
              <div>
                <p className="font-medium text-green-600">Study</p>
                <p>{Math.round(routineBreakdown.study * 10) / 10}h</p>
              </div>
              <div>
                <p className="font-medium text-yellow-600">School</p>
                <p>{Math.round(routineBreakdown.school * 10) / 10}h</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Idle</p>
                <p>{Math.round(routineBreakdown.idle * 10) / 10}h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Attendance Calendar */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle>School Attendance Calendar</CardTitle>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Present ({attendanceData.presentDays})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Absent ({attendanceData.absentDays})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Holiday</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date) {
                toggleAttendance(date);
              }
            }}
            className="rounded-md border cursor-pointer"
            modifiers={{
              present: (date) => attendanceData.attendanceMap.get(date.toISOString().split('T')[0]) === 'present',
              absent: (date) => attendanceData.attendanceMap.get(date.toISOString().split('T')[0]) === 'absent',
              holiday: (date) => attendanceData.attendanceMap.get(date.toISOString().split('T')[0]) === 'holiday',
            }}
            modifiersClassNames={{
              present: 'bg-green-500 text-white hover:bg-green-600',
              absent: 'bg-red-500 text-white hover:bg-red-600', 
              holiday: 'bg-gray-300 text-gray-700 hover:bg-gray-400',
            }}
            data-testid="attendance-calendar"
          />
          
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">
              Attendance Rate: {attendanceData.totalDays > 0 ? Math.round((attendanceData.presentDays / attendanceData.totalDays) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {attendanceData.presentDays} present out of {attendanceData.totalDays} school days
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Click on dates to toggle attendance status
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Averages */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Last 30 Days Average</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Avg. Study Time</span>
                  <span className="text-lg font-bold text-primary">{avgStats.avgStudyTime}h/day</span>
                </div>
                <div className="progress-grey-green">
                  <Progress value={Math.min((avgStats.avgStudyTime / 8) * 100, 100)} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Avg. Questions</span>
                  <span className="text-lg font-bold text-secondary">{avgStats.avgQuestions}/day</span>
                </div>
                <div className="progress-grey-green">
                  <Progress value={Math.min((avgStats.avgQuestions / 50) * 100, 100)} />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Subject-wise Totals</h4>
              {Object.entries(subjectStats).map(([subject, stats]) => (
                <div key={subject} className="flex justify-between items-center">
                  <span className="text-sm">{subject}</span>
                  <div className="text-right">
                    <Badge variant="outline">{stats.questions} questions</Badge>
                    <Badge variant="outline" className="ml-2">
                      {Math.round(stats.time / 60 * 10) / 10}h
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle>Weekly Study Activity</CardTitle>
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
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/70 rounded-lg transition-all duration-500"
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
