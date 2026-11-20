import React, { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Target,
  Cpu,
  Clock,
  Flame,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { AppView, DomainId, UserProgressState } from '../types';
import { OFFICIAL_DOMAINS, OFFICIAL_EXAM_BLUEPRINT } from '../data/examBlueprint';
import { ALL_LESSONS } from '../data/lessons';
import { ALL_QUESTIONS } from '../data/questions';
import {
  computeDomainMastery,
  computeOverallQuizAccuracy,
  computeStudyStreakDays,
  computeTopicAnalytics,
  generateRecommendations,
} from '../utils/analytics';

interface DashboardViewProps {
  progress: UserProgressState;
  onNavigate: (view: AppView) => void;
  onOpenLesson: (lessonId: string) => void;
  onStartPractice: (opts: { domainId?: DomainId | 'all'; mode?: 'quick' | 'domain' | 'weakness' | 'mixed' }) => void;
  onOpenService: (serviceId: string) => void;
}

function formatStudyDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${remMins}m`;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onOpenLesson,
  onStartPractice,
  onOpenService,
}) => {
  const domainsWithWeights = useMemo(
    () =>
      OFFICIAL_DOMAINS.map((d) => ({
        ...d,
        weightPercent: progress.blueprintOverrides[d.id] ?? d.weightPercent,
      })),
    [progress.blueprintOverrides]
  );

  const masteries = useMemo(
    () => computeDomainMastery(domainsWithWeights, ALL_QUESTIONS, ALL_LESSONS, progress),
    [domainsWithWeights, progress]
  );

  const topics = useMemo(
    () => computeTopicAnalytics(ALL_QUESTIONS, progress.questionStats),
    [progress.questionStats]
  );

  const recommendations = useMemo(
    () => generateRecommendations(masteries, topics, ALL_LESSONS, progress),
    [masteries, topics, progress]
  );

  const overallAccuracy = useMemo(
    () =>
      computeOverallQuizAccuracy(
        progress.practiceHistory,
        progress.examHistory,
        progress.questionStats
      ),
    [progress.practiceHistory, progress.examHistory, progress.questionStats]
  );

  const totalStudySeconds = useMemo(
    () => Object.values(progress.studySecondsByDay).reduce((sum, s) => sum + s, 0),
    [progress.studySecondsByDay]
  );

  const streakDays = useMemo(
    () => computeStudyStreakDays(progress.studySecondsByDay),
    [progress.studySecondsByDay]
  );

  const weightedReadiness = useMemo(() => {
    const totalWeight = masteries.reduce((sum, m) => sum + m.weightPercent, 0);
    if (totalWeight <= 0) return 0;
    const sum = masteries.reduce((acc, m) => acc + m.masteryScore * m.weightPercent, 0);
    return Math.round(sum / totalWeight);
  }, [masteries]);

  const weakestDomain = useMemo(() => {
    const attempted = masteries.filter((m) => m.totalAttempts > 0);
    if (attempted.length === 0) {
      return [...masteries].sort((a, b) => b.weightPercent - a.weightPercent)[0];
    }
    return [...attempted].sort((a, b) => a.masteryScore - b.masteryScore)[0];
  }, [masteries]);

  const recentActivity = useMemo(() => {
    const practices = progress.practiceHistory.map((p) => ({
      id: p.id,
      kind: 'Practice' as const,
      title:
        p.mode === 'weakness'
          ? 'Weakness Drill'
          : p.domainFilter === 'all'
          ? 'Mixed Practice'
          : `Domain ${p.domainFilter.slice(1)} Practice`,
      scoreText: `${p.correctCount}/${p.totalQuestions} (${Math.round(
        (p.correctCount / Math.max(1, p.totalQuestions)) * 100
      )}%)`,
      timestamp: p.completedAt,
    }));
    const exams = progress.examHistory.map((e) => ({
      id: e.id,
      kind: 'Exam' as const,
      title: e.title,
      scoreText: `${e.scaledScore}/1000 · ${e.passed ? 'Passed Benchmark' : 'Below Benchmark'}`,
      timestamp: e.completedAt,
    }));
    return [...practices, ...exams].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, [progress.practiceHistory, progress.examHistory]);

  const completedLessonsCount = progress.completedLessonIds.length;
  const remainingLessonsCount = Math.max(0, ALL_LESSONS.length - completedLessonsCount);

  return (
    <div className="space-y-6">
      {/* Top Blueprint & Quick Launch Header */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {OFFICIAL_EXAM_BLUEPRINT.examCode} · {OFFICIAL_EXAM_BLUEPRINT.totalQuestions} Questions ·{' '}
            {OFFICIAL_EXAM_BLUEPRINT.durationMinutes} Minutes · {OFFICIAL_EXAM_BLUEPRINT.passingScoreScaled}/1000 Benchmark
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            AWS Certified AI Practitioner Preparation
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Master all 5 official exam domains across {ALL_LESSONS.length} structured lessons,{' '}
            {ALL_QUESTIONS.length} original exam-style questions, and interactive AWS service comparison guides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onStartPractice({ mode: 'quick', domainId: 'all' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Target className="w-4 h-4" />
            Quick 10-Q Practice
          </button>
          <button
            type="button"
            onClick={() => onNavigate('exam')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            Exam Simulator
          </button>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Cpu className="w-4 h-4" />
            Services Guide
          </button>
        </div>
      </section>

      {/* Key Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Curriculum Progress</span>
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {completedLessonsCount}/{ALL_LESSONS.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              lessons ({remainingLessonsCount} left)
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-teal-600 dark:bg-teal-400 transition-all"
              style={{
                width: `${Math.round((completedLessonsCount / Math.max(1, ALL_LESSONS.length)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Overall Quiz Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {overallAccuracy.totalAnswered > 0 ? `${overallAccuracy.accuracyPercent}%` : '—'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {overallAccuracy.totalAnswered > 0
                ? `${overallAccuracy.totalAnswered} answered`
                : 'No questions answered yet'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
            Weighted Readiness: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{weightedReadiness}%</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Study Time & Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {formatStudyDuration(totalStudySeconds)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              · {streakDays} day{streakDays === 1 ? '' : 's'} streak
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {progress.examHistory.length} exam simulation{progress.examHistory.length === 1 ? '' : 's'} logged
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Priority Focus Area</span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white truncate">
            Domain {weakestDomain.domainId.slice(1)}: {weakestDomain.shortTitle}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Weight {weakestDomain.weightPercent}% · Mastery {weakestDomain.masteryScore}% ({weakestDomain.confidenceLevel})
          </div>
          <button
            type="button"
            onClick={() => onStartPractice({ mode: 'domain', domainId: weakestDomain.domainId })}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            Drill this domain <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Domain Mastery Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Domain Mastery Breakdown
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Mastery adjusts conservatively for small question sample sizes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {masteries.map((m) => (
            <div
              key={m.domainId}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-medium">Domain {m.domainId.slice(1)}</span>
                  <span className="font-mono tabular-nums">{m.weightPercent}% weight</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white leading-snug xl:min-h-[2.5rem]">
                  {m.shortTitle}
                </div>

                <div>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {m.masteryScore}% mastery
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.confidenceLevel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        m.masteryScore >= 75
                          ? 'bg-teal-600 dark:bg-teal-400'
                          : m.masteryScore >= 45
                          ? 'bg-amber-500'
                          : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                      style={{ width: `${m.masteryScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                  <div>
                    Lessons: <span className="tabular-nums font-medium">{m.lessonsCompleted}/{m.totalLessons}</span>
                  </div>
                  <div>
                    Questions:{' '}
                    <span className="tabular-nums font-medium">
                      {m.uniqueAttempted}/{m.totalQuestionsInDomain}
                    </span>
                    {m.totalAttempts > 0 ? ` · ${m.accuracyPercent}% acc.` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const firstDomLesson = ALL_LESSONS.find((l) => l.domainId === m.domainId);
                    if (firstDomLesson) onOpenLesson(firstDomLesson.id);
                    else onNavigate('learn');
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Study
                </button>
                <button
                  type="button"
                  onClick={() => onStartPractice({ mode: 'domain', domainId: m.domainId })}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium hover:opacity-90"
                >
                  Practice
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations + Recent History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Recommended Next Actions
            </h3>
            {progress.lastVisitedLessonId && (
              <button
                type="button"
                onClick={() => onOpenLesson(progress.lastVisitedLessonId!)}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
              >
                Resume Last Lesson →
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {rec.priority === 'high' ? 'High Impact' : rec.priority === 'medium' ? 'Next Step' : 'Study Tip'}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {rec.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{rec.reason}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = rec.actionTarget;
                    if (target.view === 'learn' && target.lessonId) {
                      onOpenLesson(target.lessonId);
                    } else if (target.view === 'practice') {
                      onStartPractice({ mode: target.mode ?? 'quick', domainId: target.domainId ?? 'all' });
                    } else if (target.view === 'services' && target.serviceId) {
                      onOpenService(target.serviceId);
                    } else {
                      onNavigate(target.view);
                    }
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {rec.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Practice & Exams
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline"
            >
              View Analytics →
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No practice sessions or mock exams recorded yet.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Start a 10-question quick drill or read Lesson 1 to build your baseline.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {act.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {act.kind} · {new Date(act.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 shrink-0 tabular-nums">
                    {act.scoreText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
