import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Flag,
  Target,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Search,
  Clock,
} from 'lucide-react';
import { DomainId, Question, UserProgressState } from '../types';
import { OFFICIAL_DOMAINS } from '../data/examBlueprint';
import { ALL_QUESTIONS, getAllTopics } from '../data/questions';

export type ReviewTab =
  | 'due'
  | 'incorrect'
  | 'bookmarked'
  | 'flagged'
  | 'hard'
  | 'recent'
  | 'unseen';

interface ReviewViewProps {
  progress: UserProgressState;
  initialTab?: ReviewTab;
  onUpdateProgress: (updater: (prev: UserProgressState) => UserProgressState) => void;
  onDrillQuestions: (questionIds: string[], domainId: DomainId | 'all') => void;
  onOpenLesson: (lessonId: string) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  progress,
  initialTab = 'due',
  onUpdateProgress,
  onDrillQuestions,
  onOpenLesson,
}) => {
  const [activeTab, setActiveTab] = useState<ReviewTab>(initialTab);
  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const now = Date.now();
  const availableTopics = useMemo(() => getAllTopics(domainFilter), [domainFilter]);

  const tabCounts = useMemo(() => {
    const counts: Record<ReviewTab, number> = {
      due: 0,
      incorrect: 0,
      bookmarked: 0,
      flagged: 0,
      hard: 0,
      recent: 0,
      unseen: 0,
    };

    for (const q of ALL_QUESTIONS) {
      const s = progress.questionStats[q.id];
      if (!s || s.attempts === 0) {
        counts.unseen += 1;
      } else {
        counts.recent += 1;
        if (s.nextReviewAt <= now || s.incorrectAttempts > s.correctAttempts) counts.due += 1;
        if (s.incorrectAttempts > 0 && s.consecutiveCorrect === 0) counts.incorrect += 1;
      }
      if (s?.bookmarked) counts.bookmarked += 1;
      if (s?.flagged) counts.flagged += 1;
      if (q.difficulty === 'Hard') counts.hard += 1;
    }
    return counts;
  }, [progress.questionStats, now]);

  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();

    const list = ALL_QUESTIONS.filter((q) => {
      if (domainFilter !== 'all' && q.domainId !== domainFilter) return false;
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;

      const s = progress.questionStats[q.id];
      switch (activeTab) {
        case 'due':
          if (!s || s.attempts === 0) return false;
          if (!(s.nextReviewAt <= now || s.incorrectAttempts > s.correctAttempts)) return false;
          break;
        case 'incorrect':
          if (!s || s.incorrectAttempts === 0 || s.consecutiveCorrect > 0) return false;
          break;
        case 'bookmarked':
          if (!s?.bookmarked) return false;
          break;
        case 'flagged':
          if (!s?.flagged) return false;
          break;
        case 'hard':
          if (q.difficulty !== 'Hard') return false;
          break;
        case 'recent':
          if (!s || s.attempts === 0) return false;
          break;
        case 'unseen':
          if (s && s.attempts > 0) return false;
          break;
      }

      if (!qLower) return true;
      return (
        q.text.toLowerCase().includes(qLower) ||
        q.topic.toLowerCase().includes(qLower) ||
        (q.scenario?.toLowerCase().includes(qLower) ?? false) ||
        q.tags.some((t) => t.toLowerCase().includes(qLower))
      );
    });

    if (activeTab === 'recent') {
      list.sort(
        (a, b) =>
          (progress.questionStats[b.id]?.lastAnsweredAt ?? 0) -
          (progress.questionStats[a.id]?.lastAnsweredAt ?? 0)
      );
    } else if (activeTab === 'due') {
      list.sort(
        (a, b) =>
          (progress.questionStats[a.id]?.nextReviewAt ?? 0) -
          (progress.questionStats[b.id]?.nextReviewAt ?? 0)
      );
    }

    return list;
  }, [activeTab, domainFilter, topicFilter, searchQuery, progress.questionStats, now]);

  const toggleFlag = (q: Question) => {
    onUpdateProgress((prev) => {
      const cur = prev.questionStats[q.id] ?? {
        questionId: q.id,
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
          [q.id]: { ...cur, flagged: !cur.flagged },
        },
      };
    });
  };

  const toggleBookmark = (q: Question) => {
    onUpdateProgress((prev) => {
      const cur = prev.questionStats[q.id] ?? {
        questionId: q.id,
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
          [q.id]: { ...cur, bookmarked: !cur.bookmarked },
        },
      };
    });
  };

  const formatReviewInterval = (nextReviewAt: number): string => {
    if (!nextReviewAt) return 'Not scheduled';
    const diffMs = nextReviewAt - now;
    if (diffMs <= 0) return 'Due now';
    const hrs = Math.round(diffMs / (1000 * 60 * 60));
    if (hrs < 24) return `In ${hrs}h`;
    const days = Math.round(hrs / 24);
    return `In ${days}d`;
  };

  const TABS: { id: ReviewTab; label: string }[] = [
    { id: 'due', label: 'Spaced Review Due' },
    { id: 'incorrect', label: 'Incorrect' },
    { id: 'bookmarked', label: 'Bookmarked' },
    { id: 'flagged', label: 'Flagged' },
    { id: 'hard', label: 'Hard' },
    { id: 'recent', label: 'Recently Answered' },
    { id: 'unseen', label: 'Unseen' },
  ];

  return (
    <div className="space-y-6">
      {/* Review Queue Tabs & Filters */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                activeTab === t.id
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{t.label}</span>
              <span className="font-mono opacity-80 tabular-nums">({tabCounts[t.id]})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search review questions..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm"
              />
            </div>

            <select
              aria-label="Filter review by domain"
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value as any);
                setTopicFilter('all');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
            >
              <option value="all">All Domains</option>
              {OFFICIAL_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  Domain {d.number}: {d.shortTitle}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter review by topic"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs max-w-xs"
            >
              <option value="all">All Topics ({availableTopics.length})</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={filteredQuestions.length === 0}
            onClick={() =>
              onDrillQuestions(
                filteredQuestions.slice(0, 20).map((q) => q.id),
                domainFilter
              )
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-medium disabled:opacity-40 shrink-0"
          >
            <Target className="w-3.5 h-3.5" />
            Drill Filtered Set ({Math.min(20, filteredQuestions.length)})
          </button>
        </div>
      </section>

      {/* Filtered Question List */}
      {filteredQuestions.length === 0 ? (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-2">
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
            No questions currently in "{TABS.find((t) => t.id === activeTab)?.label}".
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete practice drills or flag/bookmark items during sessions to build personalized review queues.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing {Math.min(40, filteredQuestions.length)} of {filteredQuestions.length} matching questions
          </div>

          {filteredQuestions.slice(0, 40).map((q) => {
            const stat = progress.questionStats[q.id];
            const expanded = Boolean(expandedIds[q.id]);

            return (
              <article
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {q.id.toUpperCase()} · Domain {q.domainId.slice(1)} · {q.topic} · {q.difficulty}
                      {stat && stat.attempts > 0
                        ? ` · ${stat.correctAttempts}/${stat.attempts} correct`
                        : ' · Unseen'}
                    </div>
                    {q.scenario && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{q.scenario}</p>
                    )}
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {q.text}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {stat && stat.attempts > 0 && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                        <Clock className="w-3 h-3" />
                        {formatReviewInterval(stat.nextReviewAt)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(q)}
                      aria-label="Toggle bookmark"
                      className={`p-1.5 rounded-lg border ${
                        stat?.bookmarked
                          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFlag(q)}
                      aria-label="Toggle flag"
                      className={`p-1.5 rounded-lg border ${
                        stat?.flagged
                          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {expanded ? (
                        <>
                          Hide Answer <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Reveal Answer <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="space-y-1.5">
                      {q.options.map((opt, idx) => {
                        const isRight = q.correctOptionIds.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border text-xs sm:text-sm ${
                              isRight
                                ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                                : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="font-medium text-slate-900 dark:text-white">
                              <span className="font-mono mr-2">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              {opt.text}
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
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
