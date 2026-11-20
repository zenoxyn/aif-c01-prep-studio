import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Circle,
  Cpu,
  Target,
  Lightbulb,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { DomainId, Lesson, UserProgressState } from '../types';
import { OFFICIAL_DOMAINS } from '../data/examBlueprint';
import { ALL_LESSONS, getLessonById, getLessonsByDomain } from '../data/lessons';
import { AWS_SERVICES_GUIDE } from '../data/awsServices';

interface LearnViewProps {
  progress: UserProgressState;
  selectedDomainId: DomainId;
  selectedLessonId: string | null;
  onSelectDomain: (domainId: DomainId) => void;
  onSelectLesson: (lessonId: string | null) => void;
  onUpdateProgress: (updater: (prev: UserProgressState) => UserProgressState) => void;
  onStartDomainPractice: (domainId: DomainId) => void;
  onOpenService: (serviceId: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  progress,
  selectedDomainId,
  selectedLessonId,
  onSelectDomain,
  onSelectLesson,
  onUpdateProgress,
  onStartDomainPractice,
  onOpenService,
}) => {
  const activeLesson: Lesson | undefined = useMemo(
    () => (selectedLessonId ? getLessonById(selectedLessonId) : undefined),
    [selectedLessonId]
  );

  const activeDomainId = activeLesson ? activeLesson.domainId : selectedDomainId;
  const activeDomain = OFFICIAL_DOMAINS.find((d) => d.id === activeDomainId) ?? OFFICIAL_DOMAINS[0];
  const domainLessons = useMemo(() => getLessonsByDomain(activeDomainId), [activeDomainId]);

  const [kcChoice, setKcChoice] = useState<string>('');
  const [kcSubmitted, setKcSubmitted] = useState<boolean>(false);

  useEffect(() => {
    setKcChoice('');
    setKcSubmitted(false);
    if (activeLesson) {
      onUpdateProgress((prev) =>
        prev.lastVisitedLessonId === activeLesson.id
          ? prev
          : { ...prev, lastVisitedLessonId: activeLesson.id }
      );
    }
  }, [activeLesson?.id]);

  const toggleLessonComplete = (lessonId: string) => {
    onUpdateProgress((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      const completedLessonIds = exists
        ? prev.completedLessonIds.filter((id) => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];
      return { ...prev, completedLessonIds };
    });
  };

  const toggleLessonBookmark = (lessonId: string) => {
    onUpdateProgress((prev) => {
      const exists = prev.bookmarkedLessonIds.includes(lessonId);
      const bookmarkedLessonIds = exists
        ? prev.bookmarkedLessonIds.filter((id) => id !== lessonId)
        : [...prev.bookmarkedLessonIds, lessonId];
      return { ...prev, bookmarkedLessonIds };
    });
  };

  const handleNoteChange = (lessonId: string, text: string) => {
    onUpdateProgress((prev) => ({
      ...prev,
      lessonNotes: { ...prev.lessonNotes, [lessonId]: text },
    }));
  };

  const handleSubmitKnowledgeCheck = (lesson: Lesson) => {
    if (!kcChoice) return;
    setKcSubmitted(true);
    const passed = kcChoice === lesson.knowledgeCheck.correctOptionId;
    if (passed) {
      onUpdateProgress((prev) => ({
        ...prev,
        lessonKnowledgeChecksPassed: {
          ...prev.lessonKnowledgeChecksPassed,
          [lesson.id]: true,
        },
      }));
    }
  };

  // Lesson Reader Mode
  if (activeLesson) {
    const isCompleted = progress.completedLessonIds.includes(activeLesson.id);
    const isBookmarked = progress.bookmarkedLessonIds.includes(activeLesson.id);
    const kcPassedBefore = Boolean(progress.lessonKnowledgeChecksPassed[activeLesson.id]);
    const currentIndex = ALL_LESSONS.findIndex((l) => l.id === activeLesson.id);
    const prevLesson = currentIndex > 0 ? ALL_LESSONS[currentIndex - 1] : null;
    const nextLesson =
      currentIndex >= 0 && currentIndex < ALL_LESSONS.length - 1
        ? ALL_LESSONS[currentIndex + 1]
        : null;

    const relatedServices = AWS_SERVICES_GUIDE.filter((s) =>
      activeLesson.relatedServiceIds.includes(s.id)
    );

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onSelectLesson(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Domain {activeDomain.number}: {activeDomain.shortTitle}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLessonBookmark(activeLesson.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            <button
              type="button"
              onClick={() => toggleLessonComplete(activeLesson.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isCompleted
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>

        {/* Lesson Header */}
        <header className="space-y-2">
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
            Domain {activeDomain.number} · Task {activeLesson.taskStatement} · Lesson {activeLesson.order} ·{' '}
            {activeLesson.difficulty} · {activeLesson.estimatedMinutes} min read
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
            {activeLesson.title}
          </h2>
        </header>

        {/* 1. Learning Objectives */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Learning Objectives
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
            {activeLesson.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                  0{idx + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 2 & 3. Core Concept & Why It Matters */}
        <section className="space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Core Concept
              </h3>
              <p>{activeLesson.conceptExplanation}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1.5">
                Why This Matters on AIF-C01
              </h3>
              <p className="text-sm">{activeLesson.whyItMatters}</p>
            </div>
          </div>

          {/* 4. Detailed Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Detailed Walkthrough
            </h3>
            <div className="space-y-3.5">
              {activeLesson.detailedExplanation.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* 5. Real-World & AWS Architecture Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Real-World Example
              </div>
              <p className="text-sm leading-relaxed">{activeLesson.realWorldExample}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                AWS Reference Example
              </div>
              <p className="text-sm leading-relaxed">{activeLesson.awsExample}</p>
            </div>
          </div>

          {/* 6. Comparison Table (if present) */}
          {activeLesson.comparisonTable && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-900 dark:text-white">
                {activeLesson.comparisonTable.title}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      {activeLesson.comparisonTable.headers.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeLesson.comparisonTable.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                          {row.aspect}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                          {row.left}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                          {row.right}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. Common Misconceptions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Common Exam Misconceptions
            </div>
            <ul className="space-y-2 text-sm">
              {activeLesson.commonMisconceptions.map((m, idx) => (
                <li key={idx} className="text-slate-700 dark:text-slate-300">
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* 8, 9, 10. Keywords, Exam Clues & Key Takeaway */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Exam Keywords
              </div>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeLesson.examKeywords.join(' · ')}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                How to Recognize This on Exam Day
              </div>
              <p className="text-sm">{activeLesson.howToRecognize}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
                Key Takeaway
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {activeLesson.keyTakeaway}
              </p>
            </div>
          </div>

          {/* Related AWS Services */}
          {relatedServices.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Related AWS Services:
              </span>
              {relatedServices.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => onOpenService(srv.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-amber-500 transition-colors"
                >
                  <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  {srv.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 11. Interactive Quick Knowledge Check */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Quick Knowledge Check
            </h3>
            {kcPassedBefore && (
              <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Passed previously
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {activeLesson.knowledgeCheck.question}
          </p>

          <div className="space-y-2">
            {activeLesson.knowledgeCheck.options.map((opt) => {
              const selected = kcChoice === opt.id;
              const isCorrect = opt.id === activeLesson.knowledgeCheck.correctOptionId;
              let rowStyle =
                'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60';
              if (kcSubmitted) {
                if (isCorrect) {
                  rowStyle =
                    'border-teal-500 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100';
                } else if (selected && !isCorrect) {
                  rowStyle =
                    'border-rose-400 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100';
                }
              } else if (selected) {
                rowStyle = 'border-slate-900 dark:border-amber-400 bg-slate-50 dark:bg-slate-800';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={kcSubmitted}
                  onClick={() => setKcChoice(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-start gap-3 ${rowStyle}`}
                >
                  <span className="font-mono text-xs uppercase mt-0.5 text-slate-500">
                    {opt.id}.
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            {!kcSubmitted ? (
              <button
                type="button"
                disabled={!kcChoice}
                onClick={() => handleSubmitKnowledgeCheck(activeLesson)}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium disabled:opacity-40"
              >
                Check Answer
              </button>
            ) : (
              <div className="text-sm space-y-1">
                <div
                  className={`font-semibold ${
                    kcChoice === activeLesson.knowledgeCheck.correctOptionId
                      ? 'text-teal-700 dark:text-teal-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {kcChoice === activeLesson.knowledgeCheck.correctOptionId
                    ? 'Correct!'
                    : `Incorrect — correct answer is (${activeLesson.knowledgeCheck.correctOptionId.toUpperCase()}).`}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeLesson.knowledgeCheck.explanation}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 12. Personal Study Notes */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="lesson-notes-input"
              className="text-sm font-semibold text-slate-900 dark:text-white"
            >
              Personal Study Notes
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Saved automatically in browser
            </span>
          </div>
          <textarea
            id="lesson-notes-input"
            rows={4}
            value={progress.lessonNotes[activeLesson.id] ?? ''}
            onChange={(e) => handleNoteChange(activeLesson.id, e.target.value)}
            placeholder="Jot down key AWS distinctions, mnemonics, or exam traps for this lesson..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-500"
          />
        </section>

        {/* Bottom Lesson Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="sm:flex-1 flex justify-start">
            {prevLesson && (
              <button
                type="button"
                onClick={() => onSelectLesson(prevLesson.id)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 max-w-full"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[210px]">Previous: {prevLesson.title}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onStartDomainPractice(activeDomain.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 shrink-0"
          >
            <Target className="w-3.5 h-3.5" />
            Practice Domain {activeDomain.number}
          </button>

          <div className="sm:flex-1 flex justify-end">
            {nextLesson && (
              <button
                type="button"
                onClick={() => onSelectLesson(nextLesson.id)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium hover:opacity-90 max-w-full"
              >
                <span className="truncate max-w-[210px]">Next: {nextLesson.title}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Domain Curriculum Directory View
  const domainRelatedServices = AWS_SERVICES_GUIDE.filter((s) =>
    activeDomain.relatedServices.includes(s.id)
  );

  return (
    <div className="space-y-6">
      {/* Domain Tabs (All unlocked non-linearly) */}
      <div className="flex flex-wrap gap-2">
        {OFFICIAL_DOMAINS.map((dom) => {
          const active = dom.id === activeDomain.id;
          const domLs = getLessonsByDomain(dom.id);
          const done = domLs.filter((l) => progress.completedLessonIds.includes(l.id)).length;
          return (
            <button
              key={dom.id}
              type="button"
              onClick={() => {
                onSelectDomain(dom.id);
                onSelectLesson(null);
              }}
              className={`px-3.5 py-2 rounded-lg border text-left transition-colors ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-xs font-mono opacity-80">
                Domain {dom.number} · {dom.weightPercent}%
              </div>
              <div className="text-sm font-semibold">{dom.shortTitle}</div>
              <div className="text-[11px] opacity-80 tabular-nums">
                {done}/{domLs.length} completed
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain Overview Card */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="font-mono text-xs text-amber-700 dark:text-amber-400">
              Official Exam Weight: {activeDomain.weightPercent}% of Scored Items
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Domain {activeDomain.number}: {activeDomain.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeDomain.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartDomainPractice(activeDomain.id)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:opacity-90"
          >
            <Target className="w-4 h-4" />
            Practice Domain {activeDomain.number}
          </button>
        </div>

        {/* Task Statements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {activeDomain.taskStatements.map((ts) => (
            <div
              key={ts.code}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2"
            >
              <div className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
                Task Statement {ts.code}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {ts.title}
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                {ts.objectives.map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Exam Tips & Related Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Domain Exam Tips
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {activeDomain.examTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key AWS Services for Domain {activeDomain.number}
            </div>
            <div className="flex flex-wrap gap-2">
              {domainRelatedServices.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => onOpenService(srv.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-amber-500"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {srv.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ordered Lessons List */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Lessons in Domain {activeDomain.number} ({domainLessons.length})
        </h3>
        <div className="space-y-3">
          {domainLessons.map((lesson) => {
            const done = progress.completedLessonIds.includes(lesson.id);
            const bookmarked = progress.bookmarkedLessonIds.includes(lesson.id);
            const hasNotes = Boolean(progress.lessonNotes[lesson.id]?.trim());
            const kcPassed = Boolean(progress.lessonKnowledgeChecksPassed[lesson.id]);

            return (
              <div
                key={lesson.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span>Lesson {lesson.order}</span>
                    <span>· Task {lesson.taskStatement}</span>
                    <span>· {lesson.difficulty}</span>
                    <span>· {lesson.estimatedMinutes} min</span>
                    {kcPassed && <span className="text-teal-700 dark:text-teal-400">· Check Passed</span>}
                    {hasNotes && <span>· Has Notes</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className="text-left text-base font-semibold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    {lesson.title}
                  </button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {lesson.conceptExplanation}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleLessonBookmark(lesson.id)}
                    aria-label={bookmarked ? 'Remove lesson bookmark' : 'Bookmark lesson'}
                    className={`p-2 rounded-lg border ${
                      bookmarked
                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLessonComplete(lesson.id)}
                    aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                    className={`p-2 rounded-lg border ${
                      done
                        ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium hover:opacity-90"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Open Lesson
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
