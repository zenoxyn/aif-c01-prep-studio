import React, { useMemo, useState } from 'react';
import { Target, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { DomainId, UserProgressState } from '../types';
import { OFFICIAL_DOMAINS } from '../data/examBlueprint';
import { ALL_LESSONS } from '../data/lessons';
import { ALL_QUESTIONS } from '../data/questions';
import {
  computeDomainMastery,
  computeStudyStreakDays,
  computeTopicAnalytics,
  TopicAnalyticsItem,
} from '../utils/analytics';

interface ProgressViewProps {
  progress: UserProgressState;
  onStartTopicPractice: (domainId: DomainId, topic: string) => void;
  onStartDomainPractice: (domainId: DomainId) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  onStartTopicPractice,
  onStartDomainPractice,
}) => {
  const [topicDomainFilter, setTopicDomainFilter] = useState<DomainId | 'all'>('all');
  const [topicStatusFilter, setTopicStatusFilter] = useState<
    'all' | TopicAnalyticsItem['status']
  >('all');

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

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (topicDomainFilter !== 'all' && t.domainId !== topicDomainFilter) return false;
      if (topicStatusFilter !== 'all' && t.status !== topicStatusFilter) return false;
      return true;
    });
  }, [topics, topicDomainFilter, topicStatusFilter]);

  const trendPoints = useMemo(() => {
    const pPoints = progress.practiceHistory.map((p) => ({
      id: p.id,
      label: p.mode === 'weakness' ? 'Weakness' : 'Practice',
      accuracy: Math.round((p.correctCount / Math.max(1, p.totalQuestions)) * 100),
      at: p.completedAt,
    }));
    const ePoints = progress.examHistory.map((e) => ({
      id: e.id,
      label: e.mode === 'full' ? 'Full Exam' : 'Mock Exam',
      accuracy: e.percentage,
      at: e.completedAt,
    }));
    return [...pPoints, ...ePoints].sort((a, b) => a.at - b.at).slice(-14);
  }, [progress.practiceHistory, progress.examHistory]);

  const streakDays = useMemo(
    () => computeStudyStreakDays(progress.studySecondsByDay),
    [progress.studySecondsByDay]
  );

  const recentDaysStudy = useMemo(() => {
    return Object.entries(progress.studySecondsByDay)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
  }, [progress.studySecondsByDay]);

  return (
    <div className="space-y-6">
      {/* Domain Mastery Detail */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Domain Mastery & Sample-Size Confidence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mastery blends difficulty-weighted accuracy (scaled smoothly up to 25 unique questions per domain) with lesson completion so 1–2 lucky answers never inflate readiness.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-600 dark:text-slate-300 shrink-0">
            Streak: {streakDays} day{streakDays === 1 ? '' : 's'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {masteries.map((m) => (
            <div
              key={m.domainId}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>D{m.domainId.slice(1)}</span>
                  <span>{m.weightPercent}% exam</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {m.shortTitle}
                </div>
                <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                  {m.masteryScore}%
                </div>
                <div className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {m.confidenceLevel}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 pt-1">
                  <div>
                    Unique Qs: {m.uniqueAttempted}/{m.totalQuestionsInDomain}
                  </div>
                  <div>
                    Raw Accuracy: {m.totalAttempts > 0 ? `${m.accuracyPercent}%` : '—'}
                  </div>
                  <div>
                    Topics Touched: {m.topicsCovered}/{m.totalTopics}
                  </div>
                  <div>
                    Lessons Done: {m.lessonsCompleted}/{m.totalLessons}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onStartDomainPractice(m.domainId)}
                className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-white dark:hover:bg-slate-800"
              >
                Practice Domain {m.domainId.slice(1)}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Accuracy Trend Chart + Study Days */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Accuracy Trend Across Sessions
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500">
              Last {trendPoints.length} graded sessions
            </span>
          </div>

          {trendPoints.length < 2 ? (
            <div className="h-48 flex items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 px-4 text-center">
              Complete at least 2 practice sessions or mock exams to visualize your accuracy trajectory.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-52 overflow-visible"
                role="img"
                aria-label="Accuracy trend across practice and exam sessions"
              >
                {[0, 25, 50, 70, 100].map((val) => {
                  const y = 170 - (val / 100) * 140;
                  return (
                    <g key={val}>
                      <line
                        x1="40"
                        y1={y}
                        x2="580"
                        y2={y}
                        stroke="currentColor"
                        className={
                          val === 70
                            ? 'text-amber-400/70'
                            : 'text-slate-200 dark:text-slate-800'
                        }
                        strokeDasharray={val === 70 ? '4 4' : undefined}
                      />
                      <text
                        x="32"
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px] font-mono"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                <polyline
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  points={trendPoints
                    .map((pt, i) => {
                      const x = 55 + (i / Math.max(1, trendPoints.length - 1)) * 510;
                      const y = 170 - (pt.accuracy / 100) * 140;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {trendPoints.map((pt, i) => {
                  const x = 55 + (i / Math.max(1, trendPoints.length - 1)) * 510;
                  const y = 170 - (pt.accuracy / 100) * 140;
                  return (
                    <g key={pt.id}>
                      <circle cx={x} cy={y} r="4.5" fill="#0d9488" />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        className="fill-slate-700 dark:fill-slate-200 text-[10px] font-mono"
                      >
                        {pt.accuracy}%
                      </text>
                      <text
                        x={x}
                        y={190}
                        textAnchor="middle"
                        className="fill-slate-400 text-[9px]"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Study Log
            </h3>
          </div>

          {recentDaysStudy.length === 0 ? (
            <p className="text-sm text-slate-500">
              Active study time in the app is tracked automatically per calendar day.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentDaysStudy.map(([dateKey, secs]) => (
                <div key={dateKey} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600 dark:text-slate-300">{dateKey}</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                    {Math.max(1, Math.round(secs / 60))} min
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {progress.completedLessonIds.length} of {ALL_LESSONS.length} lessons completed
            </span>
          </div>
        </div>
      </section>

      {/* Topic Analytics Table */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Topic-by-Topic Readiness ({filteredTopics.length} topics)
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              aria-label="Filter topics by domain"
              value={topicDomainFilter}
              onChange={(e) => setTopicDomainFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option value="all">All Domains</option>
              {OFFICIAL_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  Domain {d.number}: {d.shortTitle}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter topics by readiness status"
              value={topicStatusFilter}
              onChange={(e) => setTopicStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option value="all">All Statuses</option>
              <option value="Weak">Weak</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Improving">Improving</option>
              <option value="Strong">Strong</option>
              <option value="Not Studied">Not Studied</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 sticky top-0">
              <tr>
                <th className="px-5 py-3 font-semibold">Topic</th>
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Coverage</th>
                <th className="px-4 py-3 font-semibold">Accuracy</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTopics.slice(0, 60).map((t) => (
                <tr key={`${t.domainId}-${t.topic}`}>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                    {t.topic}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    D{t.domainId.slice(1)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                    {t.uniqueQuestionsAttempted}/{t.totalQuestionsInTopic}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums">
                    {t.attempts > 0 ? `${t.accuracyPercent}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    <span
                      className={
                        t.status === 'Weak'
                          ? 'text-rose-700 dark:text-rose-400'
                          : t.status === 'Needs Review'
                          ? 'text-amber-700 dark:text-amber-400'
                          : t.status === 'Strong'
                          ? 'text-teal-700 dark:text-teal-400'
                          : 'text-slate-500'
                      }
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onStartTopicPractice(t.domainId, t.topic)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      <Target className="w-3.5 h-3.5" />
                      Drill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
