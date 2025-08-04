import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { StorageManager, SYLLABUS_STRUCTURE } from "@/lib/storage";

interface TopicProgress {
  subject: string;
  chapter: string;
  topic: string;
  questionsCompleted: number;
  lecturesAttended: number;
  goalsCompleted: number;
}

export default function SyllabusPage() {
  const [syllabusProgress, setSyllabusProgress] = useState(StorageManager.getSyllabusProgress());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set(['Mathematics']));
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedSubChapters, setExpandedSubChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyllabusProgress(StorageManager.getSyllabusProgress());
    }, 2000);
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

  const toggleSubChapter = (subChapterKey: string) => {
    const newExpanded = new Set(expandedSubChapters);
    if (newExpanded.has(subChapterKey)) {
      newExpanded.delete(subChapterKey);
    } else {
      newExpanded.add(subChapterKey);
    }
    setExpandedSubChapters(newExpanded);
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

  const getTopicsFromStructure = (subject: string, chapter: string, subChapter?: string): string[] => {
    const subjectData = SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE];
    
    if (subject === 'Chemistry') {
      const subSubject = (subjectData as any)?.[chapter];
      if (subChapter && subSubject) {
        return subSubject[subChapter] || [];
      } else if (subSubject) {
        return Object.keys(subSubject);
      }
    } else {
      return (subjectData as any)?.[chapter] || [];
    }
    
    return [];
  };

  const getChapterProgress = (subject: string, chapter: string) => {
    let topics: string[] = [];
    let totalQuestions = 0;
    let totalLectures = 0;
    let completedTopics = 0;
    
    if (subject === 'Chemistry') {
      // For Chemistry, get all topics from all sub-chapters
      const subSubject = (SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE] as any)?.[chapter];
      if (subSubject) {
        Object.values(subSubject).forEach((topicList: any) => {
          if (Array.isArray(topicList)) {
            topics = [...topics, ...topicList];
          }
        });
      }
    } else {
      topics = getTopicsFromStructure(subject, chapter);
    }

    topics.forEach((topic: string) => {
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
    const subjectData = SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE];
    const chapters = Object.keys(subjectData as any || {});
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

  const updateTopicProgress = (subject: string, chapter: string, topic: string, field: 'questionsCompleted' | 'lecturesAttended', increment: number) => {
    const current = getTopicProgress(subject, chapter, topic);
    const newValue = Math.max(0, current[field] + increment);
    
    StorageManager.updateSyllabusProgress(subject, chapter, topic, {
      [field]: newValue
    });
    setSyllabusProgress(StorageManager.getSyllabusProgress());
  };

  const renderTopics = (subject: string, chapter: string, topics: string[], subChapter?: string) => {
    return topics.map((topic: string) => {
      const progress = getTopicProgress(subject, chapter, topic);
      const isCompleted = progress.questionsCompleted > 0 || progress.lecturesAttended > 0;
      const progressPercentage = Math.min(100, (progress.questionsCompleted * 10) + (progress.lecturesAttended * 20));

      return (
        <div key={topic} className="ml-6 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{topic}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                {progress.questionsCompleted}Q / {progress.lecturesAttended}L
              </Badge>
            </div>
          </div>
          
          <div className="mb-2">
            <Progress 
              value={progressPercentage} 
              className="h-2"
              style={{
                background: 'rgb(156, 163, 175)',
              }}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateTopicProgress(subject, chapter, topic, 'questionsCompleted', 1)}
              data-testid={`add-question-${topic}`}
            >
              +1Q
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateTopicProgress(subject, chapter, topic, 'lecturesAttended', 1)}
              data-testid={`add-lecture-${topic}`}
            >
              +1L
            </Button>
            {progress.questionsCompleted > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTopicProgress(subject, chapter, topic, 'questionsCompleted', -1)}
                data-testid={`remove-question-${topic}`}
              >
                -1Q
              </Button>
            )}
            {progress.lecturesAttended > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTopicProgress(subject, chapter, topic, 'lecturesAttended', -1)}
                data-testid={`remove-lecture-${topic}`}
              >
                -1L
              </Button>
            )}
          </div>
        </div>
      );
    });
  };

  const renderChemistrySubject = (subject: string) => {
    const subjectData = SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE] as any;
    const subSubjects = Object.keys(subjectData || {});

    return subSubjects.map(subSubject => {
      const subSubjectKey = `${subject}-${subSubject}`;
      const isExpanded = expandedChapters.has(subSubjectKey);
      const chapters = Object.keys(subjectData[subSubject] || {});
      const progress = getChapterProgress(subject, subSubject);

      return (
        <div key={subSubject} className="space-y-2">
          <div
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            onClick={() => toggleChapter(subSubjectKey)}
            data-testid={`toggle-subsubject-${subSubject}`}
          >
            <div className="flex items-center space-x-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">{subSubject}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-xs">
                {progress.completedTopics}/{progress.totalTopics} topics
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {progress.completionPercentage}%
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-3 ml-4">
              {chapters.map(chapter => {
                const chapterKey = `${subject}-${subSubject}-${chapter}`;
                const isChapterExpanded = expandedSubChapters.has(chapterKey);
                const topics = subjectData[subSubject][chapter] || [];

                return (
                  <div key={chapter} className="space-y-2">
                    <div
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                      onClick={() => toggleSubChapter(chapterKey)}
                      data-testid={`toggle-chapter-${chapter}`}
                    >
                      <div className="flex items-center space-x-2">
                        {isChapterExpanded ? (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{chapter}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {topics.length} topics
                      </Badge>
                    </div>

                    {isChapterExpanded && (
                      <div className="space-y-2">
                        {renderTopics(subject, chapter, topics, subSubject)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const renderRegularSubject = (subject: string) => {
    const subjectData = SYLLABUS_STRUCTURE[subject as keyof typeof SYLLABUS_STRUCTURE] as any;
    const chapters = Object.keys(subjectData || {});

    return chapters.map(chapter => {
      const chapterKey = `${subject}-${chapter}`;
      const isExpanded = expandedChapters.has(chapterKey);
      const topics = getTopicsFromStructure(subject, chapter);
      const progress = getChapterProgress(subject, chapter);

      return (
        <div key={chapter} className="space-y-2">
          <div
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            onClick={() => toggleChapter(chapterKey)}
            data-testid={`toggle-chapter-${chapter}`}
          >
            <div className="flex items-center space-x-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">{chapter}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-xs">
                {progress.completedTopics}/{progress.totalTopics} topics
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {progress.completionPercentage}%
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-2">
              {renderTopics(subject, chapter, topics)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syllabus Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress across all subjects</p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(SYLLABUS_STRUCTURE).map(subject => {
          const isExpanded = expandedSubjects.has(subject);
          const progress = getSubjectProgress(subject);
          
          const getSubjectColor = (subj: string) => {
            switch(subj) {
              case 'Mathematics': return 'from-blue-500 to-purple-600';
              case 'Physics': return 'from-green-500 to-blue-600';
              case 'Chemistry': return 'from-red-500 to-pink-600';
              default: return 'from-gray-500 to-gray-600';
            }
          };

          return (
            <Card key={subject} className="neumorphic overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${getSubjectColor(subject)} text-white cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={() => toggleSubject(subject)}
                data-testid={`toggle-subject-${subject}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle>{subject}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {progress.completedTopics}/{progress.totalTopics} topics
                    </Badge>
                    <span className="text-lg font-bold">{progress.completionPercentage}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={progress.completionPercentage} 
                    className="h-3 bg-white/20"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-6 space-y-4">
                  {subject === 'Chemistry' ? renderChemistrySubject(subject) : renderRegularSubject(subject)}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}