import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Flag,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  BookOpen,
  Target,
} from 'lucide-react';
import {
  Difficulty,
  DomainId,
  PracticeSessionRecord,
  Question,
  QuestionType,
  ShuffledQuestion,
  UserProgressState,
} from '../types';
import { OFFICIAL_DOMAINS } from '../data/examBlueprint';
import { ALL_QUESTIONS, getAllTopics } from '../data/questions';
import {
  computeUpdatedQuestionStat,
  isAnswerCorrect,
  selectPracticeQuestions,
  shuffleQuestionOptions,
} from '../utils/examEngine';

export interface PracticeLaunchConfig {
  mode?: 'quick' | 'domain' | 'weakness' | 'mixed' | 'review';
  domainId?: DomainId | 'all';
  topic?: string | 'all';
  questionIds?: string[];
  autoStart?: boolean;
}

interface PracticeViewProps {
  progress: UserProgressState;
  launchConfig?: PracticeLaunchConfig | null;
  onConsumeLaunchConfig?: () => void;
  onUpdateProgress: (updater: (prev: UserProgressState) => UserProgressState) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  progress,
  launchConfig,
  onConsumeLaunchConfig,
  onUpdateProgress,
  onOpenLesson,
}) => {
  // Configuration state
  const [mode, setMode] = useState<'quick' | 'domain' | 'weakness' | 'mixed' | 'review'>('quick');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<string | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [immediateFeedback, setImmediateFeedback] = useState<boolean>(true);
  const [timedMode, setTimedMode] = useState<boolean>(false);

  // Active session state
  const [phase, setPhase] = useState<'config' | 'running' | 'summary'>('config');
  const [sessionQuestions, setSessionQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [confidenceMap, setConfidenceMap] = useState<Record<string, 'low' | 'medium' | 'high'>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const availableTopics = useMemo(() => getAllTopics(domainFilter), [domainFilter]);

  useEffect(() => {
    if (topicFilter !== 'all' && !availableTopics.includes(topicFilter)) {
      setTopicFilter('all');
    }
  }, [availableTopics, topicFilter]);

  // Handle incoming launch configs (from Dashboard, Learn, Search, or Review)
  useEffect(() => {
    if (!launchConfig) return;

    const nextMode = launchConfig.mode ?? 'quick';
    const nextDomain = launchConfig.domainId ?? 'all';
    const nextTopic = launchConfig.topic ?? 'all';

    setMode(nextMode);
    setDomainFilter(nextDomain);
    setTopicFilter(nextTopic);

    if (launchConfig.questionIds && launchConfig.questionIds.length > 0) {
      const subset = ALL_QUESTIONS.filter((q) => launchConfig.questionIds!.includes(q.id));
      const shuffled = subset.map((q) => shuffleQuestionOptions(q));
      startLoadedSession(shuffled, 'review', nextDomain);
    } else if (launchConfig.autoStart) {
      startSessionWithParams({
        selMode: nextMode,
        selCount: nextMode === 'quick' ? 10 : 15,
        selDomain: nextDomain,
        selTopic: nextTopic,
        selDiff: 'all',
        selType: 'all',
      });
    }

    onConsumeLaunchConfig?.();
  }, [launchConfig]);

  // Session timer
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const recentlySeenIds = useMemo(() => {
    const ids: string[] = [];
    progress.practiceHistory.slice(-2).forEach((s) => {
      s.questionResults.forEach((r) => ids.push(r.questionId));
    });
    return ids;
  }, [progress.practiceHistory]);

  const startLoadedSession = (
    items: ShuffledQuestion[],
    sessionMode: typeof mode,
    sessionDomain: DomainId | 'all'
  ) => {
    if (items.length === 0) return;
    setMode(sessionMode);
    setDomainFilter(sessionDomain);
    setSessionQuestions(items);
    setCurrentIndex(0);
    setAnswers({});
    setCheckedMap({});
    setConfidenceMap({});
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    setPhase('running');
  };

  const startSessionWithParams = (opts?: {
    selMode?: typeof mode;
    selCount?: number;
    selDomain?: DomainId | 'all';
    selTopic?: string | 'all';
    selDiff?: Difficulty | 'all';
    selType?: QuestionType | 'all';
  }) => {
    const effMode = opts?.selMode ?? mode;
    const effCount = opts?.selCount ?? questionCount;
    const effDomain = opts?.selDomain ?? domainFilter;
    const effTopic = opts?.selTopic ?? topicFilter;
    const effDiff = opts?.selDiff ?? difficultyFilter;
    const effType = opts?.selType ?? typeFilter;

    const selected = selectPracticeQuestions({
      questions: ALL_QUESTIONS,
      count: effCount,
      domain: effMode === 'mixed' ? 'all' : effDomain,
      topic: effTopic,
      difficulty: effDiff,
      type: effType,
      weaknessMode: effMode === 'weakness',
      questionStats: progress.questionStats,
      recentlySeenIds,
      domainWeights: progress.blueprintOverrides,
      useWeightedDistribution: effMode === 'mixed',
    });

    startLoadedSession(selected, effMode, effDomain);
  };

  const matchingPoolCount = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      if (mode !== 'mixed' && domainFilter !== 'all' && q.domainId !== domainFilter) return false;
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      return true;
    }).length;
  }, [mode, domainFilter, topicFilter, difficultyFilter, typeFilter]);

  const toggleOption = (q: Question, optionId: string) => {
    if (immediateFeedback && checkedMap[q.id]) return;
    setAnswers((prev) => {
      const existing = prev[q.id] ?? [];
      if (q.type === 'single-choice') {
        return { ...prev, [q.id]: [optionId] };
      }
      const next = existing.includes(optionId)
        ? existing.filter((id) => id !== optionId)
        : [...existing, optionId];
      return { ...prev, [q.id]: next };
    });
  };

  const recordQuestionAttempt = (q: Question, selectedIds: string[]) => {
    const correct = isAnswerCorrect(q, selectedIds);
    const conf = confidenceMap[q.id];
    onUpdateProgress((prev) => ({
      ...prev,
      questionStats: {
        ...prev.questionStats,
        [q.id]: computeUpdatedQuestionStat(prev.questionStats[q.id], q.id, correct, Date.now(), conf),
      },
    }));
  };

  const handleCheckCurrent = () => {
    const item = sessionQuestions[currentIndex];
    if (!item) return;
    const q = item.question;
    const selected = answers[q.id] ?? [];
    if (selected.length === 0) return;

    if (!checkedMap[q.id]) {
      recordQuestionAttempt(q, selected);
      setCheckedMap((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  const handleFinishSession = () => {
    const now = Date.now();
    let correctCount = 0;
    const nextStats = { ...progress.questionStats };

    const questionResults = sessionQuestions.map((item) => {
      const q = item.question;
      const selectedOptionIds = answers[q.id] ?? [];
      const correct = isAnswerCorrect(q, selectedOptionIds);
      if (correct) correctCount += 1;

      if (!checkedMap[q.id] && selectedOptionIds.length > 0) {
        nextStats[q.id] = computeUpdatedQuestionStat(
          nextStats[q.id],
          q.id,
          correct,
          now,
          confidenceMap[q.id]
        );
      }

      return {
        questionId: q.id,
        domainId: q.domainId,
        topic: q.topic,
        selectedOptionIds,
        isCorrect: correct,
      };
    });

    const record: PracticeSessionRecord = {
      id: `prac-${now}`,
      mode,
      domainFilter,
      totalQuestions: sessionQuestions.length,
      correctCount,
      durationSeconds: Math.max(1, elapsedSeconds || Math.round((now - startedAt) / 1000)),
      completedAt: now,
      questionResults,
    };

    onUpdateProgress((prev) => ({
      ...prev,
      questionStats: nextStats,
      practiceHistory: [...prev.practiceHistory, record],
    }));

    // Reveal all in checkedMap for review in summary
    const allChecked: Record<string, boolean> = {};
    sessionQuestions.forEach((s) => {
      allChecked[s.question.id] = true;
    });
    setCheckedMap(allChecked);
    setPhase('summary');
  };

  const toggleFlag = (questionId: string) => {
    onUpdateProgress((prev) => {
      const cur = prev.questionStats[questionId] ?? {
        questionId,
        attempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        consecutiveCorrect: 0,
        lastAnsweredAt: 0,
        nextReviewAt: 0,
        flagged: false,
        bookmarked: false,
      };
      return {
        ...prev,
        questionStats: {
          ...prev.questionStats,
          [questionId]: { ...cur, flagged: !cur.flagged },
        },
      };
    });
  };

  const toggleBookmark = (questionId: string) => {
    onUpdateProgress((prev) => {
      const cur = prev.questionStats[questionId] ?? {
        questionId,
        attempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        consecutiveCorrect: 0,
        lastAnsweredAt: 0,
        nextReviewAt: 0,
        flagged: false,
        bookmarked: false,
      };
      return {
        ...prev,
        questionStats: {
          ...prev.questionStats,
          [questionId]: { ...cur, bookmarked: !cur.bookmarked },
        },
      };
    });
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // CONFIG PHASE
  if (phase === 'config') {
    return (
      <div className="max-w-4xl space-y-6">
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configure Randomized Practice Session
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Questions and answer option positions are dynamically shuffled on every run to build genuine understanding rather than letter memorization.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'quick' as const,
                title: 'Quick Practice',
                desc: 'Fast targeted drill with instant or end feedback',
              },
              {
                id: 'domain' as const,
                title: 'Domain Focus',
                desc: 'Isolate one official AIF-C01 exam domain',
              },
              {
                id: 'weakness' as const,
                title: 'Weakness Drill',
                desc: 'Prioritize missed, due SRS, & weak topics',
              },
              {
                id: 'mixed' as const,
                title: 'Blueprint Weighted',
                desc: 'Sampled across 20/24/28/14/14 exam weights',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`text-left p-3.5 rounded-xl border transition-colors ${
                  mode === item.id
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs opacity-80 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Number of Questions</span>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                {[5, 10, 15, 20, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} Questions
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Domain Filter</span>
              <select
                disabled={mode === 'mixed'}
                value={mode === 'mixed' ? 'all' : domainFilter}
                onChange={(e) => setDomainFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white disabled:opacity-50"
              >
                <option value="all">All 5 Domains</option>
                {OFFICIAL_DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Domain {d.number}: {d.shortTitle}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Topic Filter</span>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All Topics ({availableTopics.length})</option>
                {availableTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Difficulty</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Question Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">Single & Multiple-Response</option>
                <option value="single-choice">Single-Choice Only</option>
                <option value="multiple-response">Multiple-Response Only</option>
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Feedback Mode</span>
              <select
                value={immediateFeedback ? 'immediate' : 'end'}
                onChange={(e) => setImmediateFeedback(e.target.value === 'immediate')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="immediate">Immediate (Reveal after each question)</option>
                <option value="end">End of Session (Reveal after submit)</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timedMode}
                  onChange={(e) => setTimedMode(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Show elapsed session timer</span>
              </label>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Matching pool: {matchingPoolCount} questions
              </span>
            </div>

            <button
              type="button"
              disabled={matchingPoolCount === 0}
              onClick={() => startSessionWithParams()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:opacity-90 disabled:opacity-40"
            >
              <Target className="w-4 h-4" />
              Start Practice ({Math.min(questionCount, matchingPoolCount)} Qs)
            </button>
          </div>
        </section>
      </div>
    );
  }

  // SUMMARY PHASE
  if (phase === 'summary') {
    const total = sessionQuestions.length;
    const correctCount = sessionQuestions.filter((item) =>
      isAnswerCorrect(item.question, answers[item.question.id] ?? [])
    ).length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const missedIds = sessionQuestions
      .filter((item) => !isAnswerCorrect(item.question, answers[item.question.id] ?? []))
      .map((item) => item.question.id);

    return (
      <div className="max-w-4xl space-y-6">
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Practice Session Complete · {formatSec(elapsedSeconds)}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {correctCount} / {total} Correct ({pct}%)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Spaced repetition intervals and domain analytics have been updated automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {missedIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const missedQs = ALL_QUESTIONS.filter((q) => missedIds.includes(q.id));
                  startLoadedSession(
                    missedQs.map((q) => shuffleQuestionOptions(q)),
                    'review',
                    'all'
                  );
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry {missedIds.length} Missed
              </button>
            )}
            <button
              type="button"
              onClick={() => setPhase('config')}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium hover:opacity-90"
            >
              New Practice Session
            </button>
          </div>
        </section>

        {/* Question-by-question explanation breakdown */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Session Answer Breakdown
          </h3>
          {sessionQuestions.map((item, idx) => {
            const q = item.question;
            const userSel = answers[q.id] ?? [];
            const correct = isAnswerCorrect(q, userSel);

            return (
              <article
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    Q{idx + 1} · {q.id.toUpperCase()} · Domain {q.domainId.slice(1)} · {q.topic}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      correct
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {correct ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Incorrect
                      </>
                    )}
                  </div>
                </div>

                {q.scenario && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {q.scenario}
                  </p>
                )}
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.text}</p>

                <div className="space-y-1.5">
                  {item.displayOrder.map((disp) => {
                    const isRight = q.correctOptionIds.includes(disp.optionId);
                    const wasPicked = userSel.includes(disp.optionId);
                    return (
                      <div
                        key={disp.optionId}
                        className={`p-2.5 rounded-lg border text-xs sm:text-sm ${
                          isRight
                            ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                            : wasPicked
                            ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="font-medium text-slate-900 dark:text-white">
                          <span className="font-mono mr-2">{disp.label}.</span>
                          {disp.text}
                          {wasPicked && (
                            <span className="ml-2 font-mono text-[11px] text-slate-500">
                              (Your choice)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {q.optionExplanations[disp.optionId]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg space-y-1">
                  <div>
                    <strong>Why:</strong> {q.explanation}
                  </div>
                  <div>
                    <strong>Exam Clue:</strong> {q.examReasoning}
                  </div>
                  {q.lessonId && (
                    <button
                      type="button"
                      onClick={() => onOpenLesson(q.lessonId!)}
                      className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline pt-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Revise Related Lesson
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  // RUNNING PHASE
  const currentItem = sessionQuestions[currentIndex];
  if (!currentItem) return null;
  const q = currentItem.question;
  const selectedIds = answers[q.id] ?? [];
  const isChecked = Boolean(checkedMap[q.id]);
  const stat = progress.questionStats[q.id];
  const isCorrect = isAnswerCorrect(q, selectedIds);
  const allAnsweredCount = sessionQuestions.filter(
    (s) => (answers[s.question.id]?.length ?? 0) > 0
  ).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Runner Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums">
          Question {currentIndex + 1} of {sessionQuestions.length} · Answered {allAnsweredCount}/
          {sessionQuestions.length}
        </div>
        <div className="flex items-center gap-2">
          {timedMode && (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums mr-2">
              <Clock className="w-3.5 h-3.5" />
              {formatSec(elapsedSeconds)}
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleBookmark(q.id)}
            aria-label="Bookmark question"
            className={`p-1.5 rounded-lg border ${
              stat?.bookmarked
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFlag(q.id)}
            aria-label="Flag question for review"
            className={`p-1.5 rounded-lg border ${
              stat?.flagged
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700'
            }`}
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFinishSession}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Finish Session
          </button>
        </div>
      </div>

      {/* Question Card */}
      <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          Domain {q.domainId.slice(1)} · {q.topic} · {q.difficulty} ·{' '}
          {q.type === 'multiple-response'
            ? `Multiple-Response (Select ${q.correctOptionIds.length})`
            : 'Single-Choice'}
        </div>

        {q.scenario && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {q.scenario}
          </div>
        )}

        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-snug">
          {q.text}
        </h2>

        {/* Shuffled Options */}
        <div className="space-y-2.5">
          {currentItem.displayOrder.map((disp) => {
            const isSelected = selectedIds.includes(disp.optionId);
            const isRightOption = q.correctOptionIds.includes(disp.optionId);

            let style =
              'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60';
            if (isChecked) {
              if (isRightOption) {
                style =
                  'border-teal-500 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100';
              } else if (isSelected && !isRightOption) {
                style =
                  'border-rose-400 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100';
              }
            } else if (isSelected) {
              style =
                'border-slate-900 bg-slate-50 dark:border-amber-400 dark:bg-slate-800';
            }

            return (
              <button
                key={disp.optionId}
                type="button"
                disabled={immediateFeedback && isChecked}
                onClick={() => toggleOption(q, disp.optionId)}
                className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3 ${style}`}
              >
                <span
                  className={`w-6 h-6 ${
                    q.type === 'multiple-response' ? 'rounded-md' : 'rounded-full'
                  } border flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {disp.label}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="text-sm leading-relaxed">{disp.text}</div>
                  {isChecked && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                      {q.optionExplanations[disp.optionId]}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confidence selector before submitting */}
        {!isChecked && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Confidence (for SRS):</span>
              {(['low', 'medium', 'high'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConfidenceMap((prev) => ({ ...prev, [q.id]: c }))}
                  className={`px-2.5 py-1 rounded border capitalize ${
                    confidenceMap[q.id] === c
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-400 dark:bg-amber-500 dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {immediateFeedback && (
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={handleCheckCurrent}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium disabled:opacity-40"
              >
                Check Answer
              </button>
            )}
          </div>
        )}

        {/* Revealed Explanation Panel */}
        {isChecked && (
          <div
            className={`rounded-xl border p-4 space-y-2.5 ${
              isCorrect
                ? 'border-teal-300 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-950/20'
                : 'border-rose-300 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {isCorrect ? (
                <span className="text-teal-800 dark:text-teal-300 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correct Answer
                </span>
              ) : (
                <span className="text-rose-800 dark:text-rose-300 inline-flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Incorrect — Review Explanation Below
                </span>
              )}
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {q.explanation}
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Exam Clue:</strong> {q.examReasoning}
            </div>
            {q.lessonId && (
              <button
                type="button"
                onClick={() => onOpenLesson(q.lessonId!)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline pt-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Revise Related Lesson
              </button>
            )}
          </div>
        )}
      </article>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40"
        >
          Previous
        </button>

        {currentIndex < sessionQuestions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(sessionQuestions.length - 1, i + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium"
          >
            Next Question
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishSession}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700"
          >
            Submit & View Summary
          </button>
        )}
      </div>
    </div>
  );
};
