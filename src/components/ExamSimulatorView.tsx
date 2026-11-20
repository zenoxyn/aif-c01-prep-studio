import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  Grid3X3,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  Difficulty,
  DomainId,
  ExamAttemptRecord,
  ShuffledQuestion,
  UserProgressState,
} from '../types';
import { OFFICIAL_DOMAINS, OFFICIAL_EXAM_BLUEPRINT } from '../data/examBlueprint';
import { ALL_QUESTIONS, getQuestionById } from '../data/questions';
import {
  allocateDomainCounts,
  calculateScaledScore,
  computeUpdatedQuestionStat,
  isAnswerCorrect,
  selectPracticeQuestions,
} from '../utils/examEngine';

interface ExamSimulatorViewProps {
  progress: UserProgressState;
  onUpdateProgress: (updater: (prev: UserProgressState) => UserProgressState) => void;
  onExamActiveChange: (isActive: boolean) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  progress,
  onUpdateProgress,
  onExamActiveChange,
  onOpenLesson,
}) => {
  // Configurator state
  const [simType, setSimType] = useState<'full' | 'short'>('full');
  const [shortCount, setShortCount] = useState<number>(20);
  const [customCount, setCustomCount] = useState<number>(15);
  const [shortDomain, setShortDomain] = useState<DomainId | 'all'>('all');
  const [shortDiff, setShortDiff] = useState<Difficulty | 'all'>('all');
  const [shortTimed, setShortTimed] = useState<boolean>(true);

  // Runner state
  const [phase, setPhase] = useState<'lobby' | 'running' | 'results'>('lobby');
  const [examTitle, setExamTitle] = useState<string>('Full AIF-C01 Exam Simulation');
  const [examMode, setExamMode] = useState<'full' | 'short'>('full');
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [timeLimitSec, setTimeLimitSec] = useState<number | null>(5400);
  const [secondsLeft, setSecondsLeft] = useState<number>(5400);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [showGridMobile, setShowGridMobile] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState<boolean>(false);

  // Results state
  const [activeAttempt, setActiveAttempt] = useState<ExamAttemptRecord | null>(null);
  const [auditFilter, setAuditFilter] = useState<'all' | 'incorrect' | 'flagged' | 'unanswered'>('all');

  useEffect(() => {
    onExamActiveChange(phase === 'running');
    return () => onExamActiveChange(false);
  }, [phase, onExamActiveChange]);

  const fullBlueprintCounts = useMemo(
    () =>
      allocateDomainCounts(
        OFFICIAL_EXAM_BLUEPRINT.totalQuestions,
        progress.blueprintOverrides
      ),
    [progress.blueprintOverrides]
  );

  const finalizeRef = useRef<() => void>(() => {});
  finalizeRef.current = () => {
    finalizeExamSubmission();
  };

  // Exam timer tick
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => {
      setElapsedSec((e) => e + 1);
      if (timeLimitSec !== null) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(id);
            finalizeRef.current();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, timeLimitSec]);

  const launchExam = () => {
    const isFull = simType === 'full';
    const targetCount = isFull
      ? OFFICIAL_EXAM_BLUEPRINT.totalQuestions
      : shortCount === -1
      ? Math.max(5, Math.min(65, customCount))
      : shortCount;

    const selected = selectPracticeQuestions({
      questions: ALL_QUESTIONS,
      count: targetCount,
      domain: isFull ? 'all' : shortDomain,
      difficulty: isFull ? 'all' : shortDiff,
      questionStats: progress.questionStats,
      domainWeights: progress.blueprintOverrides,
      useWeightedDistribution: isFull || shortDomain === 'all',
    });

    if (selected.length === 0) return;

    const limitSec = isFull
      ? OFFICIAL_EXAM_BLUEPRINT.durationMinutes * 60
      : shortTimed
      ? Math.round((selected.length / 65) * 90 * 60)
      : null;

    setExamMode(isFull ? 'full' : 'short');
    setExamTitle(
      isFull
        ? `Full AIF-C01 Simulation (${selected.length} Qs)`
        : `Short Mock Exam (${selected.length} Qs)`
    );
    setQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds({});
    setElapsedSec(0);
    setTimeLimitSec(limitSec);
    setSecondsLeft(limitSec ?? 0);
    setShowSubmitConfirm(false);
    setShowAbandonConfirm(false);
    setPhase('running');
  };

  const finalizeExamSubmission = () => {
    const now = Date.now();
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const domainBreakdown: Record<DomainId, { total: number; correct: number }> = {
      d1: { total: 0, correct: 0 },
      d2: { total: 0, correct: 0 },
      d3: { total: 0, correct: 0 },
      d4: { total: 0, correct: 0 },
      d5: { total: 0, correct: 0 },
    };

    const nextStats = { ...progress.questionStats };

    const questionOutcomes = questions.map((item) => {
      const q = item.question;
      const selected = answers[q.id] ?? [];
      const isFlagged = Boolean(flaggedIds[q.id]);
      const correct = selected.length > 0 && isAnswerCorrect(q, selected);

      domainBreakdown[q.domainId].total += 1;
      if (selected.length === 0) {
        unansweredCount += 1;
      } else if (correct) {
        correctCount += 1;
        domainBreakdown[q.domainId].correct += 1;
      } else {
        incorrectCount += 1;
      }

      if (selected.length > 0 || isFlagged) {
        const updated =
          selected.length > 0
            ? computeUpdatedQuestionStat(nextStats[q.id], q.id, correct, now)
            : nextStats[q.id] ?? {
                questionId: q.id,
                attempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                consecutiveCorrect: 0,
                lastAnsweredAt: 0,
                nextReviewAt: 0,
                flagged: isFlagged,
                bookmarked: false,
              };
        nextStats[q.id] = {
          ...updated,
          flagged: isFlagged || updated.flagged,
        };
      }

      return {
        questionId: q.id,
        domainId: q.domainId,
        topic: q.topic,
        selectedOptionIds: selected,
        correctOptionIds: q.correctOptionIds,
        isCorrect: correct,
        flagged: isFlagged,
        shuffledOptionIds: item.shuffledOptions.map((o) => o.id),
      };
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const scaledScore = calculateScaledScore(correctCount, total);
    const passed = percentage >= progress.customExamPassingPercentage;

    const record: ExamAttemptRecord = {
      id: `exam-${now}`,
      mode: examMode,
      title: examTitle,
      totalQuestions: total,
      correctCount,
      incorrectCount,
      unansweredCount,
      scaledScore,
      percentage,
      passed,
      durationSeconds: Math.max(1, elapsedSec),
      timeLimitSeconds: timeLimitSec,
      completedAt: now,
      domainBreakdown,
      questionOutcomes,
    };

    onUpdateProgress((prev) => ({
      ...prev,
      questionStats: nextStats,
      examHistory: [...prev.examHistory, record],
    }));

    setActiveAttempt(record);
    setAuditFilter('all');
    setShowSubmitConfirm(false);
    setPhase('results');
  };

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // RUNNING DISTRACTION-FREE EXAM UI
  if (phase === 'running' && questions.length > 0) {
    const item = questions[currentIndex];
    const q = item.question;
    const selected = answers[q.id] ?? [];
    const isFlagged = Boolean(flaggedIds[q.id]);

    const answeredCount = questions.filter((s) => (answers[s.question.id]?.length ?? 0) > 0).length;
    const flaggedCount = questions.filter((s) => flaggedIds[s.question.id]).length;
    const unansweredCount = questions.length - answeredCount;
    const lowTime = timeLimitSec !== null && secondsLeft <= 300;

    const toggleExamOption = (optId: string) => {
      setAnswers((prev) => {
        const cur = prev[q.id] ?? [];
        if (q.type === 'single-choice') {
          return { ...prev, [q.id]: [optId] };
        }
        const next = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId];
        return { ...prev, [q.id]: next };
      });
    };

    const navigatorGrid = (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>Question Navigator</span>
          <span className="font-mono tabular-nums">
            {answeredCount}/{questions.length} done
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((s, idx) => {
            const isCurr = idx === currentIndex;
            const isAns = (answers[s.question.id]?.length ?? 0) > 0;
            const isFlg = Boolean(flaggedIds[s.question.id]);

            let cellClass =
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
            if (isAns) {
              cellClass =
                'border-slate-900 bg-slate-900 text-white dark:border-teal-600 dark:bg-teal-700 dark:text-white';
            }
            if (isFlg) {
              cellClass = isAns
                ? 'border-amber-400 bg-amber-600 text-white ring-2 ring-amber-400/50'
                : 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300';
            }

            return (
              <button
                key={s.question.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowGridMobile(false);
                }}
                className={`h-9 rounded-lg border font-mono text-xs font-medium tabular-nums transition-all ${cellClass} ${
                  isCurr ? 'ring-2 ring-blue-600 dark:ring-amber-400 ring-offset-1 dark:ring-offset-slate-900' : ''
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>Answered: {answeredCount} · Unanswered: {unansweredCount}</div>
          <div>Flagged for review: {flaggedCount}</div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Top Exam Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setShowAbandonConfirm(true)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Exit
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="font-semibold text-sm truncate">{examTitle}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums px-3 py-1 rounded-lg border ${
                lowTime
                  ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'
              }`}
            >
              <Clock className="w-4 h-4" />
              {timeLimitSec !== null ? formatTimer(secondsLeft) : formatTimer(elapsedSec)}
            </div>

            <button
              type="button"
              onClick={() => setShowGridMobile((v) => !v)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700"
              aria-label="Toggle question navigator grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs sm:text-sm font-medium hover:opacity-90"
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* Exam Body */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-5">
            <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Question {currentIndex + 1} of {questions.length} ·{' '}
                  {q.type === 'multiple-response'
                    ? `Select ${q.correctOptionIds.length}`
                    : 'Single-Choice'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => {
                        const copy = { ...prev };
                        delete copy[q.id];
                        return copy;
                      })
                    }
                    disabled={selected.length === 0}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40"
                  >
                    Clear Answer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFlaggedIds((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium ${
                      isFlagged
                        ? 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {isFlagged ? 'Flagged' : 'Flag for Review'}
                  </button>
                </div>
              </div>

              {q.scenario && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {q.scenario}
                </div>
              )}

              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                {q.text}
              </h2>

              <div className="space-y-2.5">
                {item.displayOrder.map((disp) => {
                  const isSelected = selected.includes(disp.optionId);
                  return (
                    <button
                      key={disp.optionId}
                      type="button"
                      onClick={() => toggleExamOption(disp.optionId)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 dark:border-amber-400 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
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
                      <span className="text-sm leading-relaxed">{disp.text}</span>
                    </button>
                  );
                })}
              </div>
            </article>

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>

          {/* Desktop Sidebar Question Navigator */}
          <aside className="hidden lg:block lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sticky top-22 max-h-[calc(100vh-7rem)] overflow-y-auto">
            {navigatorGrid}
          </aside>
        </div>

        {/* Mobile Grid Modal */}
        {showGridMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 max-h-[80vh] overflow-y-auto space-y-4">
              {navigatorGrid}
              <button
                type="button"
                onClick={() => setShowGridMobile(false)}
                className="w-full py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium"
              >
                Close Navigator
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Submit Exam for Grading?
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Once submitted, answers are locked and your full domain score breakdown will be generated.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-mono space-y-1 tabular-nums">
                <div>Answered: {answeredCount}</div>
                <div>Unanswered: {unansweredCount}</div>
                <div>Flagged for review: {flaggedCount}</div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={finalizeExamSubmission}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium"
                >
                  Confirm & Grade Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Abandon Confirmation Modal */}
        {showAbandonConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Exit Exam Without Grading?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your current responses in this unsubmitted exam will be discarded.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAbandonConfirm(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  Resume Exam
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('lobby')}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RESULTS & AUDIT PAGE
  if (phase === 'results' && activeAttempt) {
    const filteredOutcomes = activeAttempt.questionOutcomes.filter((o) => {
      if (auditFilter === 'incorrect') return !o.isCorrect && o.selectedOptionIds.length > 0;
      if (auditFilter === 'unanswered') return o.selectedOptionIds.length === 0;
      if (auditFilter === 'flagged') return o.flagged;
      return true;
    });

    const benchmarkScaled = Math.round(100 + (progress.customExamPassingPercentage / 100) * 900);

    return (
      <div className="max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPhase('lobby')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exam Simulator
          </button>
          <button
            type="button"
            onClick={launchExam}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Take Fresh Simulation
          </button>
        </div>

        {/* Score Overview Card */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-2">
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {activeAttempt.title} · {new Date(activeAttempt.completedAt).toLocaleString()}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                {activeAttempt.scaledScore}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                / 1000 scaled ({activeAttempt.percentage}%)
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                activeAttempt.passed
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {activeAttempt.passed
                ? `Passed Benchmark (${benchmarkScaled}+)`
                : `Below Benchmark (${benchmarkScaled} target)`}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Estimated practice score based on percentage accuracy; official AWS exams use psychometric item scaling.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-xs text-slate-500">Correct</div>
              <div className="text-xl font-semibold font-mono text-teal-700 dark:text-teal-400 tabular-nums">
                {activeAttempt.correctCount}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-xs text-slate-500">Incorrect</div>
              <div className="text-xl font-semibold font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                {activeAttempt.incorrectCount}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-xs text-slate-500">Unanswered</div>
              <div className="text-xl font-semibold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                {activeAttempt.unansweredCount}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-xs text-slate-500">Time Used</div>
              <div className="text-xl font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatTimer(activeAttempt.durationSeconds)}
              </div>
            </div>
          </div>
        </section>

        {/* Domain Breakdown */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Domain Performance Breakdown
          </h3>
          <div className="space-y-3">
            {OFFICIAL_DOMAINS.map((dom) => {
              const stat = activeAttempt.domainBreakdown[dom.id];
              if (!stat || stat.total === 0) return null;
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={dom.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Domain {dom.number}: {dom.title}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        pct >= 70 ? 'bg-teal-600 dark:bg-teal-400' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Question-by-Question Audit */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Question-by-Question Audit ({filteredOutcomes.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'incorrect', 'flagged', 'unanswered'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAuditFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border ${
                    auditFilter === tab
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredOutcomes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
              No questions matched this audit filter.
            </div>
          ) : (
            filteredOutcomes.map((outcome, idx) => {
              const q = getQuestionById(outcome.questionId);
              if (!q) return null;
              const orderedOpts =
                outcome.shuffledOptionIds.length > 0
                  ? outcome.shuffledOptionIds
                      .map((id) => q.options.find((o) => o.id === id))
                      .filter(Boolean)
                  : q.options;

              return (
                <article
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      Item {idx + 1} · {q.id.toUpperCase()} · Domain {q.domainId.slice(1)} · {q.topic}
                      {outcome.flagged ? ' · Flagged' : ''}
                    </div>
                    <div className="text-xs font-semibold">
                      {outcome.selectedOptionIds.length === 0 ? (
                        <span className="text-slate-500">Unanswered</span>
                      ) : outcome.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
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
                    {orderedOpts.map((opt, optIdx) => {
                      if (!opt) return null;
                      const letter = String.fromCharCode(65 + optIdx);
                      const isRight = q.correctOptionIds.includes(opt.id);
                      const wasSelected = outcome.selectedOptionIds.includes(opt.id);

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border text-xs sm:text-sm ${
                            isRight
                              ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                              : wasSelected
                              ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="font-medium text-slate-900 dark:text-white">
                            <span className="font-mono mr-2">{letter}.</span>
                            {opt.text}
                            {wasSelected && (
                              <span className="ml-2 font-mono text-[11px] text-slate-500">
                                (Selected)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {q.optionExplanations[opt.id]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg space-y-1">
                    <div>
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                    <div>
                      <strong>Exam Reasoning:</strong> {q.examReasoning}
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
            })
          )}
        </section>
      </div>
    );
  }

  // LOBBY CONFIGURATOR
  return (
    <div className="max-w-4xl space-y-6">
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            AIF-C01 Exam Simulator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Practice under real exam pacing in a distraction-free test console with question flagging, navigation grid, and zero mid-exam answer reveals.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSimType('full')}
            className={`text-left p-5 rounded-xl border transition-colors space-y-2 ${
              simType === 'full'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="font-mono text-xs opacity-80">OFFICIAL EXAM FORMAT</div>
            <div className="text-base font-semibold">Full AIF-C01 Simulation</div>
            <div className="text-xs opacity-85 leading-relaxed">
              65 Questions · 90 Minutes · Weighted across all 5 domains (
              {Object.values(progress.blueprintOverrides).join('/')}%) · 700/1000 passing benchmark.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSimType('short')}
            className={`text-left p-5 rounded-xl border transition-colors space-y-2 ${
              simType === 'short'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="font-mono text-xs opacity-80">FLEXIBLE MOCK TEST</div>
            <div className="text-base font-semibold">Short / Custom Mock Exam</div>
            <div className="text-xs opacity-85 leading-relaxed">
              10, 20, 30, or custom question count with optional domain isolation and proportional timer.
            </div>
          </button>
        </div>

        {simType === 'full' ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-900 dark:text-white">
              65-Question Allocation Preview (Configurable in Settings)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono tabular-nums pt-1">
              {OFFICIAL_DOMAINS.map((d) => (
                <div
                  key={d.id}
                  className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2"
                >
                  <div className="text-[11px] text-slate-500">Domain {d.number}</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {fullBlueprintCounts[d.id]} Qs ({progress.blueprintOverrides[d.id]}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Mock Exam Length</span>
              <select
                value={shortCount}
                onChange={(e) => setShortCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value={10}>10 Questions (~14 min)</option>
                <option value={20}>20 Questions (~28 min)</option>
                <option value={30}>30 Questions (~42 min)</option>
                <option value={-1}>Custom Length</option>
              </select>
            </label>

            {shortCount === -1 && (
              <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Custom Count (5–65)</span>
                <input
                  type="number"
                  min={5}
                  max={65}
                  value={customCount}
                  onChange={(e) => setCustomCount(Number(e.target.value) || 15)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-white"
                />
              </label>
            )}

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Domain Coverage</span>
              <select
                value={shortDomain}
                onChange={(e) => setShortDomain(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">Blueprint Weighted (All 5)</option>
                {OFFICIAL_DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Domain {d.number}: {d.shortTitle}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Difficulty</span>
              <select
                value={shortDiff}
                onChange={(e) => setShortDiff(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">Mixed Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          {simType === 'short' ? (
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={shortTimed}
                onChange={(e) => setShortTimed(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Enforce proportional exam countdown timer</span>
            </label>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Official AWS note: real exams include 50 scored + 15 unscored items; this simulation scores all 65 equally to maximize feedback.
            </div>
          )}

          <button
            type="button"
            onClick={launchExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:opacity-90"
          >
            <ClipboardCheck className="w-4 h-4" />
            Begin Exam Simulation
          </button>
        </div>
      </section>

      {/* Past Exam Attempts */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Completed Exam Simulations ({progress.examHistory.length})
        </h3>

        {progress.examHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No completed mock exams yet. Your graded attempts and question-by-question audits will appear here.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...progress.examHistory].reverse().map((attempt) => (
              <div
                key={attempt.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {attempt.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {new Date(attempt.completedAt).toLocaleString()} · {attempt.correctCount}/
                    {attempt.totalQuestions} correct · {formatTimer(attempt.durationSeconds)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      attempt.passed
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {attempt.scaledScore}/1000 ({attempt.passed ? 'Pass' : 'Below 700'})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAttempt(attempt);
                      setAuditFilter('all');
                      setPhase('results');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Inspect Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
