import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, BookOpen, Cpu, Target, ArrowRight, Scale } from 'lucide-react';
import { ALL_LESSONS } from '../data/lessons';
import { AWS_SERVICES_GUIDE, SERVICE_COMPARISONS } from '../data/awsServices';
import { ALL_QUESTIONS, getAllTopics } from '../data/questions';
import { DomainId } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenService: (serviceId: string, tab?: 'services' | 'comparisons') => void;
  onStartTopicPractice: (domainId: DomainId | 'all', topic: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenLesson,
  onOpenService,
  onStartTopicPractice,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const allTopics = useMemo(() => getAllTopics(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        lessons: ALL_LESSONS.slice(0, 4),
        services: AWS_SERVICES_GUIDE.slice(0, 4),
        comparisons: SERVICE_COMPARISONS.slice(0, 2),
        topics: [] as { topic: string; domainId: DomainId; count: number }[],
      };
    }

    const lessons = ALL_LESSONS.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.conceptExplanation.toLowerCase().includes(q) ||
        l.examKeywords.some((k) => k.toLowerCase().includes(q)) ||
        l.objectives.some((o) => o.toLowerCase().includes(q))
    ).slice(0, 6);

    const services = AWS_SERVICES_GUIDE.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.whatItDoes.toLowerCase().includes(q) ||
        s.examClues.some((c) => c.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q)
    ).slice(0, 6);

    const comparisons = SERVICE_COMPARISONS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.examRuleOfThumb.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedTopics = allTopics
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 6)
      .map((topic) => {
        const matchingQs = ALL_QUESTIONS.filter((item) => item.topic === topic);
        return {
          topic,
          domainId: matchingQs[0]?.domainId ?? 'd1',
          count: matchingQs.length,
        };
      });

    return { lessons, services, comparisons, topics: matchedTopics };
  }, [query, allTopics]);

  if (!isOpen) return null;

  const hasAny =
    results.lessons.length > 0 ||
    results.services.length > 0 ||
    results.comparisons.length > 0 ||
    results.topics.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global study search"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Bedrock, RAG, SageMaker Clarify, Prompt Injection, KMS..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-5">
          {!query.trim() && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Quick jump to popular curriculum lessons, AWS services, or comparison guides — or type any AIF-C01 keyword.
            </div>
          )}

          {!hasAny && (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No lessons, AWS services, or exam topics matched "{query}".
            </div>
          )}

          {results.services.length > 0 && (
            <section>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                AWS AI Services
              </div>
              <div className="space-y-1">
                {results.services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onOpenService(s.id, 'services');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {s.category} · {s.memoryAid}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {results.lessons.length > 0 && (
            <section>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Curriculum Lessons
              </div>
              <div className="space-y-1">
                {results.lessons.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onOpenLesson(l.id);
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {l.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Domain {l.domainId.slice(1)} · Task {l.taskStatement} · {l.estimatedMinutes} min
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {results.comparisons.length > 0 && (
            <section>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Service Comparison Guides
              </div>
              <div className="space-y-1">
                {results.comparisons.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onOpenService(c.id, 'comparisons');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {c.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {c.examRuleOfThumb}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {results.topics.length > 0 && (
            <section>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Practice by Question Topic
              </div>
              <div className="space-y-1">
                {results.topics.map((t) => (
                  <button
                    key={t.topic}
                    type="button"
                    onClick={() => {
                      onStartTopicPractice(t.domainId, t.topic);
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {t.topic}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Domain {t.domainId.slice(1)} · {t.count} practice question{t.count === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">
                      Drill Topic
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
