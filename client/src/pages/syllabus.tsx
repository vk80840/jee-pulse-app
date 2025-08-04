import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, BookOpen, Award, Clock } from "lucide-react";
import { StorageManager, SYLLABUS_STRUCTURE } from "@/lib/storage";
import { TopicProgress } from "@/lib/data-types";

export default function SyllabusPage() {
  const [syllabusProgress, setSyllabusProgress] = useState<Record<string, TopicProgress>>(
    StorageManager.getSyllabusProgress()
  );
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set(["Mathematics"]));
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyllabusProgress(StorageManager.getSyllabusProgress());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleChapter = (chapterKey: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterKey)) {
      newExpanded.delete(chapterKey);
    } else {
      newExpanded.add(chapterKey);
    }
    setExpandedChapters(newExpanded);
  };

  const getTopicProgress = (subject: string, chapter: string, topic: string): TopicProgress => {
    const key = `${subject}-${chapter}-${topic}`;
    return syllabusProgress[key] || {
      subject,
      chapter,
      topic,
      questionsCompleted: 0,
      lecturesAttended: 0,
      goalsCompleted: 0
    };
  };

  const getChapterProgress = (subject: string, chapter: string) => {
    const topics = SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE]?.[chapter] || [];
    let totalQuestions = 0;
    let totalLectures = 0;
    let completedTopics = 0;

    topics.forEach(topic => {
      const progress = getTopicProgress(subject, chapter, topic);
      totalQuestions += progress.questionsCompleted;
      totalLectures += progress.lecturesAttended;
      if (progress.questionsCompleted > 0 || progress.lecturesAttended > 0) {
        completedTopics++;
      }
    });

    return {
      totalQuestions,
      totalLectures,
      completedTopics,
      totalTopics: topics.length,
      completionPercentage: topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0
    };
  };

  const getSubjectProgress = (subject: string) => {
    const chapters = Object.keys(SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE] || {});
    let totalQuestions = 0;
    let totalLectures = 0;
    let completedTopics = 0;
    let totalTopics = 0;

    chapters.forEach(chapter => {
      const chapterProgress = getChapterProgress(subject, chapter);
      totalQuestions += chapterProgress.totalQuestions;
      totalLectures += chapterProgress.totalLectures;
      completedTopics += chapterProgress.completedTopics;
      totalTopics += chapterProgress.totalTopics;
    });

    return {
      totalQuestions,
      totalLectures,
      completedTopics,
      totalTopics,
      completionPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    };
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Mathematics": return "blue";
      case "Physics": return "red";
      case "Chemistry": return "green";
      default: return "gray";
    }
  };

  const getSubjectEmoji = (subject: string) => {
    switch (subject) {
      case "Mathematics": return "📐";
      case "Physics": return "⚛️";
      case "Chemistry": return "🧪";
      default: return "📚";
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syllabus Progress</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your topic-wise progress</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setExpandedSubjects(expandedSubjects.size === 3 ? new Set() : new Set(Object.keys(SYLLABUS_STRUCTURE)))}
          data-testid="toggle-all-subjects"
        >
          {expandedSubjects.size === 3 ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      {/* Overall Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.keys(SYLLABUS_STRUCTURE).map(subject => {
          const progress = getSubjectProgress(subject);
          const color = getSubjectColor(subject);
          
          return (
            <Card key={subject} className="neumorphic">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{getSubjectEmoji(subject)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{subject}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {progress.completedTopics}/{progress.totalTopics} topics
                    </p>
                  </div>
                </div>
                <Progress value={progress.completionPercentage} className="h-2 mb-2" />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{progress.totalQuestions} questions</span>
                  <span>{Math.round(progress.totalLectures / 60 * 10) / 10}h lectures</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Subject Breakdown */}
      <div className="space-y-4">
        {Object.entries(SYLLABUS_STRUCTURE).map(([subject, chapters]) => {
          const subjectProgress = getSubjectProgress(subject);
          const color = getSubjectColor(subject);
          
          return (
            <Card key={subject} className="neumorphic">
              <Collapsible
                open={expandedSubjects.has(subject)}
                onOpenChange={() => toggleSubject(subject)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center`}>
                          <span className="text-2xl">{getSubjectEmoji(subject)}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{subject}</CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {Object.keys(chapters).length} chapters • {subjectProgress.completedTopics}/{subjectProgress.totalTopics} topics completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold text-${color}-600`}>{subjectProgress.completionPercentage}%</p>
                          <p className="text-sm text-gray-500">Complete</p>
                        </div>
                        {expandedSubjects.has(subject) ? 
                          <ChevronDown className="h-5 w-5" /> : 
                          <ChevronRight className="h-5 w-5" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Progress value={subjectProgress.completionPercentage} className="mb-6" />
                    
                    <div className="space-y-4">
                      {Object.entries(chapters).map(([chapter, topics]) => {
                        const chapterProgress = getChapterProgress(subject, chapter);
                        const chapterKey = `${subject}-${chapter}`;
                        
                        return (
                          <div key={chapter} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Collapsible
                              open={expandedChapters.has(chapterKey)}
                              onOpenChange={() => toggleChapter(chapterKey)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900 dark:text-white">{chapter}</h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {chapterProgress.completedTopics}/{chapterProgress.totalTopics} topics • 
                                        {chapterProgress.totalQuestions} questions • 
                                        {Math.round(chapterProgress.totalLectures / 60 * 10) / 10}h lectures
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <Badge variant="outline">
                                        {chapterProgress.completionPercentage}%
                                      </Badge>
                                      {expandedChapters.has(chapterKey) ? 
                                        <ChevronDown className="h-4 w-4" /> : 
                                        <ChevronRight className="h-4 w-4" />
                                      }
                                    </div>
                                  </div>
                                  <Progress value={chapterProgress.completionPercentage} className="mt-2 h-1" />
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="px-4 pb-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {topics.map(topic => {
                                      const topicProgress = getTopicProgress(subject, chapter, topic);
                                      const hasProgress = topicProgress.questionsCompleted > 0 || topicProgress.lecturesAttended > 0;
                                      
                                      return (
                                        <div
                                          key={topic}
                                          className={`p-3 rounded-lg border transition-colors ${
                                            hasProgress 
                                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                          }`}
                                          data-testid={`topic-${subject.toLowerCase()}-${chapter.toLowerCase().replace(/\s+/g, '-')}-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <h5 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                              {topic}
                                            </h5>
                                            {hasProgress && (
                                              <Badge variant="secondary" className="ml-2 text-xs">
                                                ✓
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center space-x-2">
                                              <BookOpen className="h-3 w-3" />
                                              <span>{topicProgress.questionsCompleted} questions</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Clock className="h-3 w-3" />
                                              <span>{topicProgress.lecturesAttended} lectures</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Award className="h-3 w-3" />
                                              <span>{topicProgress.goalsCompleted} goals</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
