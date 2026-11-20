import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DomainId, UserProgressState } from '../types';
import { OFFICIAL_DOMAINS, OFFICIAL_EXAM_BLUEPRINT } from '../data/examBlueprint';
import { exportProgressJson, importProgressJson } from '../utils/storage';

interface SettingsViewProps {
  progress: UserProgressState;
  onUpdateProgress: (updater: (prev: UserProgressState) => UserProgressState) => void;
  onResetProgress: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  progress,
  onUpdateProgress,
  onResetProgress,
}) => {
  const [weights, setWeights] = useState<Record<DomainId, number>>({
    ...progress.blueprintOverrides,
  });
  const [passingPct, setPassingPct] = useState<number>(progress.customExamPassingPercentage);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalWeight = (Object.values(weights) as number[]).reduce((sum, n) => sum + Number(n || 0), 0);

  const handleSaveBlueprint = () => {
    if (totalWeight !== 100) {
      setStatusMessage({
        type: 'error',
        text: `Domain weights must sum to exactly 100% (currently ${totalWeight}%).`,
      });
      return;
    }
    const clampedPass = Math.max(50, Math.min(95, Math.round(passingPct)));
    onUpdateProgress((prev) => ({
      ...prev,
      blueprintOverrides: { ...weights },
      customExamPassingPercentage: clampedPass,
    }));
    setStatusMessage({
      type: 'success',
      text: 'Exam blueprint weights and passing benchmark saved.',
    });
  };

  const handleRestoreOfficialWeights = () => {
    const official: Record<DomainId, number> = {
      d1: 20,
      d2: 24,
      d3: 28,
      d4: 14,
      d5: 14,
    };
    setWeights(official);
    setPassingPct(OFFICIAL_EXAM_BLUEPRINT.passingPercentageBenchmark);
    onUpdateProgress((prev) => ({
      ...prev,
      blueprintOverrides: official,
      customExamPassingPercentage: OFFICIAL_EXAM_BLUEPRINT.passingPercentageBenchmark,
    }));
    setStatusMessage({
      type: 'success',
      text: 'Restored official AIF-C01 exam blueprint weights (20 / 24 / 28 / 14 / 14).',
    });
  };

  const handleExport = () => {
    const json = exportProgressJson(progress);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aif-c01-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({
      type: 'success',
      text: 'Progress backup JSON exported to your downloads.',
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const imported = importProgressJson(content);
      if (!imported) {
        setStatusMessage({
          type: 'error',
          text: 'Could not parse backup file. Please choose a valid JSON export from AIF-C01 Prep Studio.',
        });
        return;
      }
      onUpdateProgress(() => imported);
      setWeights({ ...imported.blueprintOverrides });
      setPassingPct(imported.customExamPassingPercentage);
      setStatusMessage({
        type: 'success',
        text: 'Study progress and analytics successfully restored from backup.',
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl space-y-6">
      {statusMessage && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${
            statusMessage.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-200'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Theme Preferences */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Appearance & Theme
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Switch between high-contrast daylight mode and low-glare dark study mode.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => onUpdateProgress((p) => ({ ...p, theme: 'light' }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                progress.theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              type="button"
              onClick={() => onUpdateProgress((p) => ({ ...p, theme: 'dark' }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                progress.theme === 'dark'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>
        </div>
      </section>

      {/* Exam Blueprint Configuration */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Configurable Exam Blueprint Weights
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Default weights match the verified AWS Certified AI Practitioner ({OFFICIAL_EXAM_BLUEPRINT.examCode}) exam guide:
              65 questions · 90 minutes · 700/1000 passing benchmark.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRestoreOfficialWeights}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Official Defaults
          </button>
        </div>

        <div className="space-y-3">
          {OFFICIAL_DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  Domain {domain.number}: {domain.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Official exam guide weight: {domain.weightPercent}%
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={100}
                  aria-label={`Domain ${domain.number} weight percentage`}
                  value={weights[domain.id]}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                    setWeights((prev) => ({ ...prev, [domain.id]: val }));
                  }}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm text-right tabular-nums text-slate-900 dark:text-white"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Total Allocation:{' '}
              <span
                className={`font-mono font-semibold tabular-nums ${
                  totalWeight === 100
                    ? 'text-teal-700 dark:text-teal-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {totalWeight}%
              </span>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Pass Benchmark %:</span>
              <input
                type="number"
                min={50}
                max={95}
                value={passingPct}
                onChange={(e) => setPassingPct(Number(e.target.value) || 70)}
                className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm text-right tabular-nums"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleSaveBlueprint}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Save Blueprint Config
          </button>
        </div>
      </section>

      {/* Backup & Reset */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Progress Backup & Local Data Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            All study streaks, lesson notes, bookmarks, spaced-repetition schedules, and mock exam audits are stored locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
            Export Progress JSON
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Upload className="w-4 h-4" />
            Import Progress JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Progress
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
              <span className="text-xs font-medium text-rose-800 dark:text-rose-200">
                Clear all notes & history?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                  setStatusMessage({ type: 'success', text: 'All local progress has been reset.' });
                }}
                className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Independent Disclaimer */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Independent Study Material Notice
          </div>
          <p>
            AIF-C01 Prep Studio is an independent study and exam-preparation application designed around publicly published AWS Certified AI Practitioner (AIF-C01) exam domain concepts. It is not affiliated with, endorsed by, or sponsored by Amazon Web Services (AWS). All curriculum lessons, decision guides, and 520 practice questions are original study items created for educational practice and are not official AWS exam questions.
          </p>
        </div>
      </section>
    </div>
  );
};
