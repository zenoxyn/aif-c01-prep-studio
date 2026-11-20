import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppView, DomainId, UserProgressState } from './types';
import {
  getTodayDateKey,
  loadProgressState,
  resetProgressState,
  saveProgressState,
} from './utils/storage';
import { getLessonById } from './data/lessons';
import { Layout } from './components/Layout';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { DashboardView } from './components/DashboardView';
import { LearnView } from './components/LearnView';
import { ServicesView } from './components/ServicesView';
import { PracticeLaunchConfig, PracticeView } from './components/PracticeView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { ReviewTab, ReviewView } from './components/ReviewView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';

export function App() {
  const [progress, setProgress] = useState<UserProgressState>(() => loadProgressState());
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);

  // Cross-view deep navigation state
  const [learnDomainId, setLearnDomainId] = useState<DomainId>('d1');
  const [learnLessonId, setLearnLessonId] = useState<string | null>(null);

  const [serviceTarget, setServiceTarget] = useState<{
    id: string | null;
    tab: 'services' | 'comparisons';
  }>({ id: null, tab: 'services' });

  const [practiceLaunch, setPracticeLaunch] = useState<PracticeLaunchConfig | null>(null);
  const [reviewInitialTab, setReviewInitialTab] = useState<ReviewTab>('due');

  // Persist progress changes
  const updateProgress = useCallback(
    (updater: (prev: UserProgressState) => UserProgressState) => {
      setProgress((prev) => {
        const next = updater(prev);
        saveProgressState(next);
        return next;
      });
    },
    []
  );

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (progress.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.theme]);

  // Global Cmd/Ctrl + K search shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!isExamRunning) {
          setSearchOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExamRunning]);

  // Active study timer (logs 30s increments while user is studying in visible tab)
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const dayKey = getTodayDateKey();
      updateProgress((prev) => ({
        ...prev,
        studySecondsByDay: {
          ...prev.studySecondsByDay,
          [dayKey]: (prev.studySecondsByDay[dayKey] ?? 0) + 30,
        },
      }));
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [updateProgress]);

  const dueReviewCount = useMemo(() => {
    const now = Date.now();
    return Object.values(progress.questionStats).filter(
      (s) => s.attempts > 0 && (s.nextReviewAt <= now || s.incorrectAttempts > s.correctAttempts)
    ).length;
  }, [progress.questionStats]);

  const handleOpenLesson = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    if (lesson) {
      setLearnDomainId(lesson.domainId);
      setLearnLessonId(lesson.id);
    }
    setCurrentView('learn');
  };

  const handleOpenService = (serviceId: string, tab: 'services' | 'comparisons' = 'services') => {
    setServiceTarget({ id: serviceId, tab });
    setCurrentView('services');
  };

  const handleStartPractice = (opts: PracticeLaunchConfig) => {
    setPracticeLaunch({ ...opts, autoStart: opts.autoStart ?? true });
    setCurrentView('practice');
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'review') setReviewInitialTab('due');
    setCurrentView(view);
  };

  return (
    <>
      <Layout
        currentView={currentView}
        onNavigate={handleNavigate}
        theme={progress.theme}
        onToggleTheme={() =>
          updateProgress((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        onOpenSearch={() => setSearchOpen(true)}
        dueReviewCount={dueReviewCount}
        distractionFree={isExamRunning && currentView === 'exam'}
      >
        {currentView === 'dashboard' && (
          <DashboardView
            progress={progress}
            onNavigate={handleNavigate}
            onOpenLesson={handleOpenLesson}
            onStartPractice={(opts) => handleStartPractice({ ...opts, autoStart: true })}
            onOpenService={(id) => handleOpenService(id, 'services')}
          />
        )}

        {currentView === 'learn' && (
          <LearnView
            progress={progress}
            selectedDomainId={learnDomainId}
            selectedLessonId={learnLessonId}
            onSelectDomain={setLearnDomainId}
            onSelectLesson={setLearnLessonId}
            onUpdateProgress={updateProgress}
            onStartDomainPractice={(domainId) =>
              handleStartPractice({ mode: 'domain', domainId, autoStart: true })
            }
            onOpenService={(id) => handleOpenService(id, 'services')}
          />
        )}

        {currentView === 'services' && (
          <ServicesView
            key={`${serviceTarget.id ?? 'default'}-${serviceTarget.tab}`}
            initialServiceId={serviceTarget.id}
            initialTab={serviceTarget.tab}
          />
        )}

        {currentView === 'practice' && (
          <PracticeView
            progress={progress}
            launchConfig={practiceLaunch}
            onConsumeLaunchConfig={() => setPracticeLaunch(null)}
            onUpdateProgress={updateProgress}
            onOpenLesson={handleOpenLesson}
          />
        )}

        {currentView === 'exam' && (
          <ExamSimulatorView
            progress={progress}
            onUpdateProgress={updateProgress}
            onExamActiveChange={setIsExamRunning}
            onOpenLesson={handleOpenLesson}
          />
        )}

        {currentView === 'review' && (
          <ReviewView
            progress={progress}
            initialTab={reviewInitialTab}
            onUpdateProgress={updateProgress}
            onDrillQuestions={(questionIds, domainId) =>
              handleStartPractice({ mode: 'review', domainId, questionIds, autoStart: false })
            }
            onOpenLesson={handleOpenLesson}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            progress={progress}
            onStartTopicPractice={(domainId, topic) =>
              handleStartPractice({ mode: 'domain', domainId, topic, autoStart: true })
            }
            onStartDomainPractice={(domainId) =>
              handleStartPractice({ mode: 'domain', domainId, autoStart: true })
            }
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            progress={progress}
            onUpdateProgress={updateProgress}
            onResetProgress={() => {
              const fresh = resetProgressState();
              setProgress(fresh);
            }}
          />
        )}
      </Layout>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenLesson={handleOpenLesson}
        onOpenService={handleOpenService}
        onStartTopicPractice={(domainId, topic) =>
          handleStartPractice({ mode: 'domain', domainId, topic, autoStart: true })
        }
      />
    </>
  );
}

export default App;
