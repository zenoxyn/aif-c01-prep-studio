import React, { useMemo, useState } from 'react';
import { Search, Cpu, Scale, Check, XCircle, Lightbulb } from 'lucide-react';
import { AWS_SERVICES_GUIDE, SERVICE_COMPARISONS } from '../data/awsServices';
import { AwsServiceGuide, DomainId } from '../types';

interface ServicesViewProps {
  initialServiceId?: string | null;
  initialTab?: 'services' | 'comparisons';
}

const CATEGORIES: ('All' | AwsServiceGuide['category'])[] = [
  'All',
  'Generative AI',
  'Managed ML',
  'Vision & Document',
  'Language & Speech',
  'Personalization & Search',
  'Data, Security & Governance',
];

const PRIORITIES: ('All' | AwsServiceGuide['priority'])[] = [
  'All',
  'Core Exam Priority',
  'Important Supporting',
  'Supplementary',
];

export const ServicesView: React.FC<ServicesViewProps> = ({
  initialServiceId,
  initialTab = 'services',
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'comparisons'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AwsServiceGuide['category']>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | AwsServiceGuide['priority']>('All');
  const [domainFilter, setDomainFilter] = useState<'all' | DomainId>('all');

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId && AWS_SERVICES_GUIDE.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : AWS_SERVICES_GUIDE[0].id
  );

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return AWS_SERVICES_GUIDE.filter((s) => {
      if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && s.priority !== priorityFilter) return false;
      if (domainFilter !== 'all' && !s.domains.includes(domainFilter)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.whatItDoes.toLowerCase().includes(q) ||
        s.memoryAid.toLowerCase().includes(q) ||
        s.examClues.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, categoryFilter, priorityFilter, domainFilter]);

  const activeService = useMemo(
    () =>
      filteredServices.find((s) => s.id === selectedServiceId) ??
      filteredServices[0] ??
      AWS_SERVICES_GUIDE.find((s) => s.id === selectedServiceId) ??
      AWS_SERVICES_GUIDE[0],
    [filteredServices, selectedServiceId]
  );

  const filteredComparisons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SERVICE_COMPARISONS.filter((c) => {
      if (domainFilter !== 'all' && !c.domains.includes(domainFilter)) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.examRuleOfThumb.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, domainFilter]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation + Search/Filter Toolbar */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-950 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'services'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Cpu className="w-4 h-4" />
              AWS Services ({AWS_SERVICES_GUIDE.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comparisons')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'comparisons'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Scale className="w-4 h-4" />
              Comparison Guides ({SERVICE_COMPARISONS.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter services, exam clues, or comparisons..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {activeTab === 'services' && (
            <>
              <select
                aria-label="Filter by service category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by exam priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    Priority: {p}
                  </option>
                ))}
              </select>
            </>
          )}

          <select
            aria-label="Filter by AIF-C01 domain"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Domain: All Domains</option>
            <option value="d1">Domain 1: AI & ML Fundamentals</option>
            <option value="d2">Domain 2: Generative AI Fundamentals</option>
            <option value="d3">Domain 3: FM Applications</option>
            <option value="d4">Domain 4: Responsible AI</option>
            <option value="d5">Domain 5: Security & Governance</option>
          </select>
        </div>
      </section>

      {activeTab === 'services' ? (
        filteredServices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-500">
            No AWS services match those filters. Reset filters to view all {AWS_SERVICES_GUIDE.length} services.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Service Selector */}
            <div className="lg:col-span-4 space-y-2">
              {filteredServices.map((srv) => {
                const selected = srv.id === activeService.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{srv.name}</span>
                      <span
                        className={`font-mono text-[11px] ${
                          selected
                            ? 'text-amber-300 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {srv.domains.map((d) => `D${d.slice(1)}`).join('/')}
                      </span>
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        selected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {srv.category} · {srv.priority}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Service Decision Detail Card */}
            <article className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <header className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="font-mono text-xs text-amber-700 dark:text-amber-400">
                  {activeService.category} · {activeService.priority} ·{' '}
                  {activeService.domains.length === 1 ? 'Domain' : 'Domains'}{' '}
                  {activeService.domains.map((d) => d.slice(1)).join(', ')}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {activeService.name}
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeService.whatItDoes}
                </p>
              </header>

              {/* Memory Aid */}
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/25 p-4 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-950 dark:text-amber-100">
                  <span className="font-semibold">Memory Aid: </span>
                  {activeService.memoryAid}
                </div>
              </div>

              {/* Purpose & Problem Solved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Primary Purpose
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeService.primaryPurpose}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Problem It Solves
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeService.problemItSolves}
                  </p>
                </div>
              </div>

              {/* Input / Output & Use Cases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Input & Output
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                    <div>
                      <strong className="text-slate-900 dark:text-white">Input:</strong>{' '}
                      {activeService.inputHandled}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Output:</strong>{' '}
                      {activeService.outputProduced}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Typical Use Cases
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {activeService.typicalUseCases.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* When to Choose vs When NOT to Choose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="rounded-lg border border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    <Check className="w-4 h-4" />
                    When to Choose
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {activeService.whenToChoose.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    <XCircle className="w-4 h-4" />
                    When NOT to Choose
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {activeService.whenNotToChoose.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Differences, Exam Clues & Scenario */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Key Distinction vs. Similar Services
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeService.keyDifferences}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Exam Trigger Clues
                  </h3>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                    {activeService.examClues.join(' · ')}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Realistic Exam Scenario
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {activeService.realisticScenario}
                  </p>
                </div>
              </div>
            </article>
          </div>
        )
      ) : (
        /* Side-by-Side Comparison Guides */
        <div className="space-y-6">
          {filteredComparisons.map((comp) => (
            <section
              key={comp.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Domains {comp.domains.map((d) => d.slice(1)).join(', ')}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {comp.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{comp.summary}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold w-1/4">Decision Criterion</th>
                      <th className="px-5 py-3 font-semibold w-[37.5%]">{comp.leftName}</th>
                      <th className="px-5 py-3 font-semibold w-[37.5%]">{comp.rightName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comp.criteria.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {row.leftValue}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {row.rightValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3.5 bg-amber-50/70 dark:bg-amber-950/20 border-t border-amber-200/70 dark:border-amber-900/40 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                <strong>Exam Rule of Thumb:</strong> {comp.examRuleOfThumb}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
