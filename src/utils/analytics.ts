import {
  DomainConfig,
  DomainId,
  ExamAttemptRecord,
  Lesson,
  PracticeSessionRecord,
  Question,
  QuestionStats,
  UserProgressState,
} from '../types';

export interface DomainMasterySummary {
  domainId: DomainId;
  title: string;
  shortTitle: string;
  weightPercent: number;
  uniqueAttempted: number;
  totalQuestionsInDomain: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  masteryScore: number; // 0..100 conservative score penalizing tiny sample sizes
  confidenceLevel: 'Insufficient Data' | 'Low Sample' | 'Moderate Confidence' | 'High Confidence';
  lessonsCompleted: number;
  totalLessons: number;
  topicsCovered: number;
  totalTopics: number;
}

export interface TopicAnalyticsItem {
  topic: string;
  domainId: DomainId;
  attempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  uniqueQuestionsAttempted: number;
  totalQuestionsInTopic: number;
  status: 'Not Studied' | 'Weak' | 'Needs Review' | 'Improving' | 'Strong';
}

export interface StudyRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  actionLabel: string;
  actionTarget:
    | { view: 'learn'; domainId?: DomainId; lessonId?: string }
    | { view: 'practice'; domainId?: DomainId; mode?: 'weakness' | 'domain' | 'quick' }
    | { view: 'services'; serviceId?: string }
    | { view: 'review'; tab?: string };
}

/**
 * Computes conservative domain mastery (0-100) factoring in:
 * - Sample size coverage (prevents 100% mastery from answering just 1 or 2 questions)
 * - Overall accuracy & difficulty-weighted correctness
 * - Repeated mistakes penalty
 * - Lesson completion contribution (15% of mastery readiness)
 */
export function computeDomainMastery(
  domains: DomainConfig[],
  questions: Question[],
  lessons: Lesson[],
  progress: UserProgressState
): DomainMasterySummary[] {
  return domains.map((domain) => {
    const domQuestions = questions.filter((q) => q.domainId === domain.id);
    const domLessons = lessons.filter((l) => l.domainId === domain.id);
    const completedLessons = domLessons.filter((l) =>
      progress.completedLessonIds.includes(l.id)
    ).length;

    const allTopics = new Set(domQuestions.map((q) => q.topic));
    const coveredTopics = new Set<string>();

    let uniqueAttempted = 0;
    let totalAttempts = 0;
    let correctAttempts = 0;
    let weightedPointsEarned = 0;
    let weightedPointsPossible = 0;
    let repeatMistakePenalty = 0;

    for (const q of domQuestions) {
      const stat = progress.questionStats[q.id];
      if (!stat || stat.attempts === 0) continue;

      uniqueAttempted += 1;
      coveredTopics.add(q.topic);
      totalAttempts += stat.attempts;
      correctAttempts += stat.correctAttempts;

      const diffWeight = q.difficulty === 'Hard' ? 1.3 : q.difficulty === 'Medium' ? 1.1 : 1.0;
      weightedPointsPossible += stat.attempts * diffWeight;
      weightedPointsEarned += stat.correctAttempts * diffWeight;

      if (stat.incorrectAttempts >= 2 && stat.consecutiveCorrect === 0) {
        repeatMistakePenalty += 2.5;
      }
    }

    const rawAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const weightedAcc =
      weightedPointsPossible > 0 ? (weightedPointsEarned / weightedPointsPossible) * 100 : 0;

    // Sample size reliability factor: reaches 1.0 once at least 25 unique questions (or 25% of domain) attempted
    const targetSample = Math.min(domQuestions.length, 25);
    const sampleFactor = targetSample > 0 ? Math.min(1, uniqueAttempted / targetSample) : 0;

    const lessonContribution =
      domLessons.length > 0 ? (completedLessons / domLessons.length) * 15 : 0;

    const questionContribution = weightedAcc * 0.85 * sampleFactor;
    const rawMastery = Math.max(
      0,
      Math.min(100, Math.round(questionContribution + lessonContribution - repeatMistakePenalty))
    );

    let confidenceLevel: DomainMasterySummary['confidenceLevel'] = 'Insufficient Data';
    if (uniqueAttempted >= 25) confidenceLevel = 'High Confidence';
    else if (uniqueAttempted >= 12) confidenceLevel = 'Moderate Confidence';
    else if (uniqueAttempted >= 4) confidenceLevel = 'Low Sample';

    return {
      domainId: domain.id,
      title: domain.title,
      shortTitle: domain.shortTitle,
      weightPercent: domain.weightPercent,
      uniqueAttempted,
      totalQuestionsInDomain: domQuestions.length,
      totalAttempts,
      correctAttempts,
      accuracyPercent: Math.round(rawAccuracy),
      masteryScore: rawMastery,
      confidenceLevel,
      lessonsCompleted: completedLessons,
      totalLessons: domLessons.length,
      topicsCovered: coveredTopics.size,
      totalTopics: allTopics.size,
    };
  });
}

export function computeTopicAnalytics(
  questions: Question[],
  questionStats: Record<string, QuestionStats>
): TopicAnalyticsItem[] {
  const byTopic = new Map<
    string,
    {
      domainId: DomainId;
      totalQuestions: number;
      uniqueAttempted: number;
      attempts: number;
      correctAttempts: number;
      consecutiveCorrectSum: number;
    }
  >();

  for (const q of questions) {
    if (!byTopic.has(q.topic)) {
      byTopic.set(q.topic, {
        domainId: q.domainId,
        totalQuestions: 0,
        uniqueAttempted: 0,
        attempts: 0,
        correctAttempts: 0,
        consecutiveCorrectSum: 0,
      });
    }
    const entry = byTopic.get(q.topic)!;
    entry.totalQuestions += 1;

    const stat = questionStats[q.id];
    if (stat && stat.attempts > 0) {
      entry.uniqueAttempted += 1;
      entry.attempts += stat.attempts;
      entry.correctAttempts += stat.correctAttempts;
      entry.consecutiveCorrectSum += stat.consecutiveCorrect;
    }
  }

  const items: TopicAnalyticsItem[] = [];
  byTopic.forEach((v, topic) => {
    const acc = v.attempts > 0 ? Math.round((v.correctAttempts / v.attempts) * 100) : 0;
    let status: TopicAnalyticsItem['status'] = 'Not Studied';
    if (v.attempts === 0) {
      status = 'Not Studied';
    } else if (v.uniqueAttempted < 2 || acc < 60) {
      status = acc < 60 ? 'Weak' : 'Needs Review';
    } else if (acc < 80) {
      status = v.consecutiveCorrectSum >= 2 ? 'Improving' : 'Needs Review';
    } else {
      status = v.uniqueAttempted >= 3 ? 'Strong' : 'Improving';
    }

    items.push({
      topic,
      domainId: v.domainId,
      attempts: v.attempts,
      correctAttempts: v.correctAttempts,
      accuracyPercent: acc,
      uniqueQuestionsAttempted: v.uniqueAttempted,
      totalQuestionsInTopic: v.totalQuestions,
      status,
    });
  });

  return items.sort((a, b) => a.accuracyPercent - b.accuracyPercent);
}

export function computeStudyStreakDays(studySecondsByDay: Record<string, number>, nowDate = new Date()): number {
  const formatKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  let streak = 0;
  const cursor = new Date(nowDate);
  const todayKey = formatKey(cursor);
  // If user hasn't studied yet today, check if yesterday had activity to keep streak alive
  if ((studySecondsByDay[todayKey] ?? 0) === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = formatKey(cursor);
    if ((studySecondsByDay[key] ?? 0) > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function generateRecommendations(
  masteries: DomainMasterySummary[],
  topics: TopicAnalyticsItem[],
  lessons: Lesson[],
  progress: UserProgressState
): StudyRecommendation[] {
  const recs: StudyRecommendation[] = [];

  // 1. Weakest domain with attempts OR unstarted high-weight domain
  const attemptedDomains = masteries.filter((m) => m.totalAttempts > 0);
  if (attemptedDomains.length > 0) {
    const weakest = [...attemptedDomains].sort((a, b) => a.masteryScore - b.masteryScore)[0];
    if (weakest.masteryScore < 75) {
      recs.push({
        id: `rec-weak-dom-${weakest.domainId}`,
        priority: 'high',
        title: `Strengthen Domain ${weakest.domainId.slice(1)}: ${weakest.shortTitle}`,
        reason: `Current mastery is ${weakest.masteryScore}% (${weakest.accuracyPercent}% accuracy across ${weakest.uniqueAttempted} questions).`,
        actionLabel: 'Practice Weak Areas',
        actionTarget: { view: 'practice', domainId: weakest.domainId, mode: 'domain' },
      });
    }
  }

  // 2. Weakest specific topic
  const weakTopics = topics.filter((t) => t.status === 'Weak' && t.attempts > 0);
  if (weakTopics.length > 0) {
    const t = weakTopics[0];
    recs.push({
      id: `rec-weak-topic-${t.topic}`,
      priority: 'high',
      title: `Review "${t.topic}"`,
      reason: `Accuracy is ${t.accuracyPercent}% across ${t.attempts} attempts. Targeted revision will close this gap.`,
      actionLabel: 'Run Weakness Practice',
      actionTarget: { view: 'practice', mode: 'weakness' },
    });
  }

  // 3. Unfinished or recommended next lesson
  const nextLesson = lessons.find((l) => !progress.completedLessonIds.includes(l.id));
  if (nextLesson) {
    recs.push({
      id: `rec-next-lesson-${nextLesson.id}`,
      priority: 'medium',
      title: `Continue Lesson: ${nextLesson.title}`,
      reason: `Part of Domain ${nextLesson.domainId.slice(1)} · Estimated ${nextLesson.estimatedMinutes} min study.`,
      actionLabel: 'Open Lesson',
      actionTarget: { view: 'learn', domainId: nextLesson.domainId, lessonId: nextLesson.id },
    });
  }

  // 4. Due spaced repetition review items
  const now = Date.now();
  const dueCount = Object.values(progress.questionStats).filter(
    (s) => s.attempts > 0 && (s.incorrectAttempts > s.correctAttempts || s.nextReviewAt <= now)
  ).length;
  if (dueCount > 0) {
    recs.push({
      id: 'rec-review-queue',
      priority: 'medium',
      title: `Clear ${dueCount} question${dueCount === 1 ? '' : 's'} due for spaced review`,
      reason: 'Revisiting missed or aging questions prevents forgetting before exam day.',
      actionLabel: 'Open Review Queue',
      actionTarget: { view: 'review', tab: 'due' },
    });
  }

  // 5. Unexplored high-weight domain
  const unpracticed = masteries
    .filter((m) => m.totalAttempts === 0)
    .sort((a, b) => b.weightPercent - a.weightPercent)[0];
  if (unpracticed) {
    recs.push({
      id: `rec-unpracticed-${unpracticed.domainId}`,
      priority: 'medium',
      title: `Start practicing ${unpracticed.shortTitle} (${unpracticed.weightPercent}% exam weight)`,
      reason: 'You have not attempted practice questions in this domain yet.',
      actionLabel: 'Start 10-Question Drill',
      actionTarget: { view: 'practice', domainId: unpracticed.domainId, mode: 'domain' },
    });
  }

  // 6. AWS Service Comparison reminder if no exams yet
  if (progress.examHistory.length === 0) {
    recs.push({
      id: 'rec-service-guide',
      priority: 'low',
      title: 'Study Amazon Bedrock vs. Amazon SageMaker AI',
      reason: 'Service-selection comparisons appear heavily in Domain 3 (28% of the AIF-C01 exam).',
      actionLabel: 'Open Decision Guide',
      actionTarget: { view: 'services', serviceId: 'bedrock' },
    });
  }

  return recs.slice(0, 4);
}

export function computeOverallQuizAccuracy(
  practiceHistory: PracticeSessionRecord[],
  examHistory: ExamAttemptRecord[],
  questionStats: Record<string, QuestionStats>
): { accuracyPercent: number; totalAnswered: number } {
  let attempts = 0;
  let correct = 0;
  Object.values(questionStats).forEach((s) => {
    attempts += s.attempts;
    correct += s.correctAttempts;
  });

  if (attempts === 0) {
    practiceHistory.forEach((p) => {
      attempts += p.totalQuestions;
      correct += p.correctCount;
    });
    examHistory.forEach((e) => {
      attempts += e.correctCount + e.incorrectCount;
      correct += e.correctCount;
    });
  }

  return {
    accuracyPercent: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
    totalAnswered: attempts,
  };
}
