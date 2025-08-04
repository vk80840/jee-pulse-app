import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StorageManager, SYLLABUS_STRUCTURE } from "@/lib/storage";
import { DailyLogData, Goal } from "@/lib/data-types";
import { Plus, Target, Moon, BookOpen, GraduationCap, StickyNote, Save } from "lucide-react";

export default function DailyLog() {
  const { toast } = useToast();
  const [todayLog, setTodayLog] = useState<DailyLogData>(StorageManager.getTodayLog());
  const [activeSubject, setActiveSubject] = useState<string>("Mathematics");
  
  // Form states
  const [textGoal, setTextGoal] = useState("");
  const [topicGoal, setTopicGoal] = useState({ subject: "", chapter: "", topic: "" });
  const [sleepData, setSleepData] = useState(todayLog.sleep);
  const [studyTarget, setStudyTarget] = useState<string>("");
  const [questionSession, setQuestionSession] = useState({ chapter: "", topic: "", count: "" });
  const [lecture, setLecture] = useState({ subject: "", chapter: "", topic: "", duration: "105" });
  const [notes, setNotes] = useState(todayLog.notes);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayLog(StorageManager.getTodayLog());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSleepData(todayLog.sleep);
    setNotes(todayLog.notes);
  }, [todayLog]);

  const addTextGoal = () => {
    if (!textGoal.trim()) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      text: textGoal,
      completed: false,
      type: 'text'
    };
    
    StorageManager.addGoal(goal);
    setTextGoal("");
    toast({ description: "Goal added successfully!" });
  };

  const addTopicGoal = () => {
    if (!topicGoal.subject || !topicGoal.chapter || !topicGoal.topic) {
      toast({ variant: "destructive", description: "Please select subject, chapter, and topic" });
      return;
    }
    
    const goal: Goal = {
      id: Date.now().toString(),
      text: `Complete ${topicGoal.topic} (${topicGoal.subject})`,
      completed: false,
      type: 'topic',
      subject: topicGoal.subject,
      chapter: topicGoal.chapter,
      topic: topicGoal.topic
    };
    
    StorageManager.addGoal(goal);
    setTopicGoal({ subject: "", chapter: "", topic: "" });
    toast({ description: "Topic goal added!" });
  };

  const updateSleep = (field: 'bedtime' | 'wakeTime', value: string) => {
    const newSleepData = { ...sleepData, [field]: value };
    setSleepData(newSleepData);
    StorageManager.updateSleepData(newSleepData);
  };

  const setSubjectTarget = () => {
    if (!studyTarget || isNaN(Number(studyTarget))) return;
    
    StorageManager.setStudyTarget(activeSubject, Number(studyTarget));
    setStudyTarget("");
    toast({ description: `Target set for ${activeSubject}!` });
  };

  const addQuestionSet = () => {
    if (!questionSession.chapter || !questionSession.topic || !questionSession.count) {
      toast({ variant: "destructive", description: "Please fill all fields" });
      return;
    }
    
    StorageManager.addStudySession(activeSubject, {
      chapter: questionSession.chapter,
      topic: questionSession.topic,
      count: Number(questionSession.count)
    });
    
    setQuestionSession({ chapter: "", topic: "", count: "" });
    toast({ description: `Added ${questionSession.count} questions for ${questionSession.topic}!` });
  };

  const addLectureSession = () => {
    if (!lecture.subject || !lecture.chapter || !lecture.topic) {
      toast({ variant: "destructive", description: "Please fill all fields" });
      return;
    }
    
    StorageManager.addLecture({
      subject: lecture.subject,
      chapter: lecture.chapter,
      topic: lecture.topic,
      duration: Number(lecture.duration)
    });
    
    setLecture({ subject: "", chapter: "", topic: "", duration: "105" });
    toast({ description: "Lecture attendance recorded!" });
  };

  const saveNotes = () => {
    StorageManager.updateNotes(notes);
    toast({ description: "Notes saved!" });
  };

  const subjects = Object.keys(SYLLABUS_STRUCTURE);
  const activeSubjectChapters = SYLLABUS_STRUCTURE[activeSubject as keyof typeof SYLLABUS_STRUCTURE] || {};
  const activeChapterTopics = questionSession.chapter ? activeSubjectChapters[questionSession.chapter] || [] : [];
  
  const lectureChapters = lecture.subject ? SYLLABUS_STRUCTURE[lecture.subject as keyof typeof SYLLABUS_STRUCTURE] || {} : {};
  const lectureTopics = lecture.chapter ? lectureChapters[lecture.chapter] || [] : [];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Log</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your daily progress</p>
        </div>
        <Button onClick={() => window.location.reload()} data-testid="refresh-log">
          <Save className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Goal Setting */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-accent" />
            <span>🎯 Set Today's Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="text-goal">Add Text Goal</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="text-goal"
                placeholder="Enter your goal..."
                value={textGoal}
                onChange={(e) => setTextGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTextGoal()}
                data-testid="text-goal-input"
              />
              <Button onClick={addTextGoal} data-testid="add-text-goal">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Add Topic Goal</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <Select value={topicGoal.subject} onValueChange={(value) => setTopicGoal({...topicGoal, subject: value, chapter: "", topic: ""})}>
                <SelectTrigger data-testid="topic-goal-subject">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={topicGoal.chapter} onValueChange={(value) => setTopicGoal({...topicGoal, chapter: value, topic: ""})}>
                <SelectTrigger data-testid="topic-goal-chapter">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SYLLABUS_STRUCTURE[topicGoal.subject as keyof typeof SYLLABUS_STRUCTURE] || {}).map(chapter => (
                    <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={topicGoal.topic} onValueChange={(value) => setTopicGoal({...topicGoal, topic: value})}>
                <SelectTrigger data-testid="topic-goal-topic">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                  {(SYLLABUS_STRUCTURE[topicGoal.subject as keyof typeof SYLLABUS_STRUCTURE]?.[topicGoal.chapter] || []).map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="mt-3 w-full" onClick={addTopicGoal} data-testid="add-topic-goal">
              Add Topic Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sleep Tracking */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-purple-500" />
            <span>🛌 Sleep Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedtime">Bedtime</Label>
              <Input
                id="bedtime"
                type="time"
                value={sleepData.bedtime || ""}
                onChange={(e) => updateSleep('bedtime', e.target.value)}
                data-testid="bedtime-input"
              />
            </div>
            <div>
              <Label htmlFor="wake-time">Wake Time</Label>
              <Input
                id="wake-time"
                type="time"
                value={sleepData.wakeTime || ""}
                onChange={(e) => updateSleep('wakeTime', e.target.value)}
                data-testid="wake-time-input"
              />
            </div>
          </div>
          {sleepData.totalHours && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💤 Total Sleep: <span className="font-medium">{sleepData.totalHours} hours</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Tracker */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>📚 Study Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Subject Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={activeSubject === subject ? "default" : "outline"}
                className="p-4 h-auto flex flex-col space-y-2"
                onClick={() => setActiveSubject(subject)}
                data-testid={`subject-${subject.toLowerCase()}`}
              >
                <div className="text-2xl">
                  {subject === "Mathematics" ? "📐" : subject === "Physics" ? "⚛️" : "🧪"}
                </div>
                <div className="text-sm font-medium">{subject}</div>
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="study-target">Question Target for {activeSubject}</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="study-target"
                  type="number"
                  placeholder="Enter target number"
                  value={studyTarget}
                  onChange={(e) => setStudyTarget(e.target.value)}
                  data-testid="study-target-input"
                />
                <Button onClick={setSubjectTarget} data-testid="set-target">
                  Set Target
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Questions Practiced</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <Select value={questionSession.chapter} onValueChange={(value) => setQuestionSession({...questionSession, chapter: value, topic: ""})}>
                  <SelectTrigger data-testid="question-chapter">
                    <SelectValue placeholder="Select Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(activeSubjectChapters).map(chapter => (
                      <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={questionSession.topic} onValueChange={(value) => setQuestionSession({...questionSession, topic: value})}>
                  <SelectTrigger data-testid="question-topic">
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeChapterTopics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  placeholder="Count"
                  value={questionSession.count}
                  onChange={(e) => setQuestionSession({...questionSession, count: e.target.value})}
                  data-testid="question-count"
                />
              </div>
              <Button className="w-full mt-3" onClick={addQuestionSet} data-testid="add-questions">
                Add Questions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lecture Attendance */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-green-500" />
            <span>🎓 Lecture Attendance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={lecture.subject} onValueChange={(value) => setLecture({...lecture, subject: value, chapter: "", topic: ""})}>
              <SelectTrigger data-testid="lecture-subject">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={lecture.chapter} onValueChange={(value) => setLecture({...lecture, chapter: value, topic: ""})}>
              <SelectTrigger data-testid="lecture-chapter">
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(lectureChapters).map(chapter => (
                  <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={lecture.topic} onValueChange={(value) => setLecture({...lecture, topic: value})}>
              <SelectTrigger data-testid="lecture-topic">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {lectureTopics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Duration</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { label: "1hr", value: "60" },
                { label: "1hr 45min", value: "105" },
                { label: "2hr", value: "120" },
                { label: "Custom", value: "custom" }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={lecture.duration === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLecture({...lecture, duration: option.value})}
                  data-testid={`duration-${option.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {lecture.duration === "custom" && (
              <Input
                type="number"
                placeholder="Duration in minutes"
                className="mt-2"
                onChange={(e) => setLecture({...lecture, duration: e.target.value})}
                data-testid="custom-duration"
              />
            )}
            <Button className="w-full mt-3" onClick={addLectureSession} data-testid="add-lecture">
              Mark Lecture Attended
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Notes */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StickyNote className="h-5 w-5 text-yellow-500" />
            <span>📝 Daily Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your daily notes, reflections, or important points..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
            data-testid="daily-notes"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Notes are saved automatically</p>
            <Button size="sm" onClick={saveNotes} data-testid="save-notes">
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
