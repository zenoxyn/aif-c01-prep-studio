import { DomainId, UserProgressState } from '../types';

const STORAGE_KEY = 'aif_c01_prep_studio_state_v1';

export const DEFAULT_USER_PROGRESS: UserProgressState = {
  theme: 'light',
  completedLessonIds: [],
  lastVisitedLessonId: null,
  lessonScrollPositions: {},
  lessonKnowledgeChecksPassed: {},
  bookmarkedLessonIds: [],
  lessonNotes: {},
  studySecondsByDay: {},
  questionStats: {},
  practiceHistory: [],
  examHistory: [],
  blueprintOverrides: {
    d1: 20,
    d2: 24,
    d3: 28,
    d4: 14,
    d5: 14,
  },
  customExamPassingPercentage: 70,
};

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function loadProgressState(): UserProgressState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_USER_PROGRESS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    return {
      ...DEFAULT_USER_PROGRESS,
      ...parsed,
      blueprintOverrides: {
        ...DEFAULT_USER_PROGRESS.blueprintOverrides,
        ...(parsed.blueprintOverrides ?? {}),
      },
      questionStats: parsed.questionStats ?? {},
      lessonNotes: parsed.lessonNotes ?? {},
      studySecondsByDay: parsed.studySecondsByDay ?? {},
      lessonScrollPositions: parsed.lessonScrollPositions ?? {},
      lessonKnowledgeChecksPassed: parsed.lessonKnowledgeChecksPassed ?? {},
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      bookmarkedLessonIds: Array.isArray(parsed.bookmarkedLessonIds) ? parsed.bookmarkedLessonIds : [],
      practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
    };
  } catch {
    return { ...DEFAULT_USER_PROGRESS };
  }
}

export function saveProgressState(state: UserProgressState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetProgressState(): UserProgressState {
  const fresh: UserProgressState = {
    ...DEFAULT_USER_PROGRESS,
    blueprintOverrides: { ...DEFAULT_USER_PROGRESS.blueprintOverrides },
  };
  saveProgressState(fresh);
  return fresh;
}

export function exportProgressJson(state: UserProgressState): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'AIF-C01 Prep Studio',
      version: 1,
      data: state,
    },
    null,
    2
  );
}

export function importProgressJson(jsonText: string): UserProgressState | null {
  try {
    const parsed = JSON.parse(jsonText);
    const candidate = parsed?.data ? parsed.data : parsed;
    if (!candidate || typeof candidate !== 'object') return null;
    const validDomains: DomainId[] = ['d1', 'd2', 'd3', 'd4', 'd5'];
    const overrides = { ...DEFAULT_USER_PROGRESS.blueprintOverrides };
    if (candidate.blueprintOverrides) {
      validDomains.forEach((d) => {
        const val = Number(candidate.blueprintOverrides[d]);
        if (!Number.isNaN(val) && val >= 0 && val <= 100) {
          overrides[d] = val;
        }
      });
    }
    const merged: UserProgressState = {
      ...DEFAULT_USER_PROGRESS,
      ...candidate,
      blueprintOverrides: overrides,
    };
    saveProgressState(merged);
    return merged;
  } catch {
    return null;
  }
}
