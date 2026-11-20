import {
  DomainId,
  Difficulty,
  Question,
  QuestionStats,
  QuestionType,
  ShuffledQuestion,
} from '../types';

export interface PracticeSelectionOptions {
  questions: Question[];
  count: number;
  domain?: DomainId | 'all';
  topic?: string | 'all';
  difficulty?: Difficulty | 'all';
  type?: QuestionType | 'all';
  weaknessMode?: boolean;
  questionStats?: Record<string, QuestionStats>;
  recentlySeenIds?: string[];
  domainWeights?: Record<DomainId, number>;
  useWeightedDistribution?: boolean;
  seed?: number;
}

/**
 * Mulberry32 deterministic PRNG for reproducible testing when seed is provided,
 * falling back to Math.random() for fresh study sessions.
 */
export function createRng(seed?: number): () => number {
  if (seed === undefined) {
    return () => Math.random();
  }
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/**
 * Shuffles a question's answer options while preserving exact option IDs
 * so answer validation remains 100% accurate regardless of visual order.
 */
export function shuffleQuestionOptions(
  question: Question,
  rng: () => number = Math.random
): ShuffledQuestion {
  const shuffledOptions = shuffleArray(question.options, rng);
  const displayOrder = shuffledOptions.map((opt, idx) => ({
    label: OPTION_LABELS[idx] ?? String(idx + 1),
    optionId: opt.id,
    text: opt.text,
  }));
  return {
    question,
    shuffledOptions,
    displayOrder,
  };
}

/**
 * Validates selected option IDs against the question's canonical correctOptionIds.
 * Works identically for single-choice and multiple-response questions regardless of shuffle order.
 */
export function isAnswerCorrect(question: Question, selectedOptionIds: string[]): boolean {
  if (!selectedOptionIds || selectedOptionIds.length === 0) return false;
  const uniqueSelected = Array.from(new Set(selectedOptionIds));
  if (uniqueSelected.length !== question.correctOptionIds.length) return false;
  const correctSet = new Set(question.correctOptionIds);
  return uniqueSelected.every((id) => correctSet.has(id));
}

/**
 * Computes how many questions should be allocated to each domain given target count and weights.
 * Uses largest-remainder method so totals match `count` exactly.
 */
export function allocateDomainCounts(
  count: number,
  weights: Record<DomainId, number>
): Record<DomainId, number> {
  const domains: DomainId[] = ['d1', 'd2', 'd3', 'd4', 'd5'];
  const totalWeight = domains.reduce((sum, d) => sum + Math.max(0, weights[d] ?? 0), 0);

  if (totalWeight <= 0) {
    const base = Math.floor(count / domains.length);
    let rem = count % domains.length;
    const eq: Record<DomainId, number> = { d1: base, d2: base, d3: base, d4: base, d5: base };
    for (const d of domains) {
      if (rem > 0) {
        eq[d] += 1;
        rem -= 1;
      }
    }
    return eq;
  }

  const exact = domains.map((d) => ({
    domain: d,
    exact: (count * Math.max(0, weights[d] ?? 0)) / totalWeight,
  }));

  const result: Record<DomainId, number> = { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 };
  let allocated = 0;

  const remainders = exact.map((item) => {
    const floorVal = Math.floor(item.exact);
    result[item.domain] = floorVal;
    allocated += floorVal;
    return { domain: item.domain, remainder: item.exact - floorVal };
  });

  remainders.sort((a, b) => b.remainder - a.remainder);
  let leftover = count - allocated;
  let idx = 0;
  while (leftover > 0 && idx < remainders.length) {
    result[remainders[idx].domain] += 1;
    leftover -= 1;
    idx += 1;
  }

  return result;
}

/**
 * Computes a priority score for weakness-focused selection.
 * Higher score = higher priority, balanced with jitter so sessions don't repeat identically.
 */
function computeWeaknessPriority(
  q: Question,
  stats: Record<string, QuestionStats>,
  domainAccuracy: Record<DomainId, number>,
  topicAccuracy: Record<string, number>,
  now: number,
  rng: () => number
): number {
  const qStat = stats[q.id];
  let score = 0;

  // Domain weakness boost
  const dAcc = domainAccuracy[q.domainId];
  if (dAcc !== undefined) {
    score += (1 - dAcc) * 35;
  } else {
    score += 15; // Never practiced domain
  }

  // Topic weakness boost
  const tAcc = topicAccuracy[q.topic];
  if (tAcc !== undefined) {
    score += (1 - tAcc) * 30;
  } else {
    score += 12;
  }

  // Question history
  if (!qStat || qStat.attempts === 0) {
    score += 18; // Unseen question in weak area
  } else {
    const errRate = qStat.incorrectAttempts / qStat.attempts;
    score += errRate * 40;
    if (qStat.nextReviewAt <= now) {
      score += 22; // Due for spaced repetition review
    } else {
      // Recently answered correctly -> deprioritize heavily
      score -= Math.min(30, qStat.consecutiveCorrect * 12);
    }
    // Avoid showing the exact same question within last 30 minutes if others exist
    if (now - qStat.lastAnsweredAt < 30 * 60 * 1000) {
      score -= 45;
    }
  }

  // Controlled randomness so weakness practice stays varied
  score += rng() * 18;
  return score;
}

export function selectPracticeQuestions(options: PracticeSelectionOptions): ShuffledQuestion[] {
  const rng = createRng(options.seed);
  const now = Date.now();
  const stats = options.questionStats ?? {};
  const recentSet = new Set(options.recentlySeenIds ?? []);

  let pool = options.questions.filter((q) => {
    if (options.domain && options.domain !== 'all' && q.domainId !== options.domain) return false;
    if (options.topic && options.topic !== 'all' && q.topic !== options.topic) return false;
    if (options.difficulty && options.difficulty !== 'all' && q.difficulty !== options.difficulty)
      return false;
    if (options.type && options.type !== 'all' && q.type !== options.type) return false;
    return true;
  });

  if (pool.length === 0) return [];

  const targetCount = Math.min(options.count, pool.length);
  let chosen: Question[] = [];

  if (options.weaknessMode) {
    // Compute domain & topic accuracy
    const domTotals: Record<DomainId, { a: number; c: number }> = {
      d1: { a: 0, c: 0 },
      d2: { a: 0, c: 0 },
      d3: { a: 0, c: 0 },
      d4: { a: 0, c: 0 },
      d5: { a: 0, c: 0 },
    };
    const topTotals: Record<string, { a: number; c: number }> = {};

    for (const q of options.questions) {
      const s = stats[q.id];
      if (!s || s.attempts === 0) continue;
      domTotals[q.domainId].a += s.attempts;
      domTotals[q.domainId].c += s.correctAttempts;
      if (!topTotals[q.topic]) topTotals[q.topic] = { a: 0, c: 0 };
      topTotals[q.topic].a += s.attempts;
      topTotals[q.topic].c += s.correctAttempts;
    }

    const domainAcc = {} as Record<DomainId, number>;
    (['d1', 'd2', 'd3', 'd4', 'd5'] as DomainId[]).forEach((d) => {
      if (domTotals[d].a > 0) domainAcc[d] = domTotals[d].c / domTotals[d].a;
    });
    const topicAcc: Record<string, number> = {};
    Object.entries(topTotals).forEach(([t, v]) => {
      if (v.a > 0) topicAcc[t] = v.c / v.a;
    });

    const scored = pool.map((q) => ({
      q,
      score: computeWeaknessPriority(q, stats, domainAcc, topicAcc, now, rng),
    }));
    scored.sort((a, b) => b.score - a.score);
    chosen = scored.slice(0, targetCount).map((item) => item.q);
    chosen = shuffleArray(chosen, rng);
  } else if (options.useWeightedDistribution && options.domainWeights && (!options.domain || options.domain === 'all')) {
    const quotas = allocateDomainCounts(targetCount, options.domainWeights);
    const chosenIds = new Set<string>();

    (['d1', 'd2', 'd3', 'd4', 'd5'] as DomainId[]).forEach((d) => {
      const domPool = pool.filter((q) => q.domainId === d);
      const fresh = shuffleArray(
        domPool.filter((q) => !recentSet.has(q.id) && (!stats[q.id] || stats[q.id].attempts === 0)),
        rng
      );
      const lessRecent = shuffleArray(
        domPool.filter((q) => !recentSet.has(q.id) && stats[q.id] && stats[q.id].attempts > 0),
        rng
      );
      const recent = shuffleArray(
        domPool.filter((q) => recentSet.has(q.id)),
        rng
      );
      const ordered = [...fresh, ...lessRecent, ...recent];
      const take = ordered.slice(0, quotas[d]);
      take.forEach((q) => {
        chosen.push(q);
        chosenIds.add(q.id);
      });
    });

    // If any domain didn't have enough under filters, backfill from remaining pool
    if (chosen.length < targetCount) {
      const remaining = shuffleArray(
        pool.filter((q) => !chosenIds.has(q.id)),
        rng
      );
      chosen.push(...remaining.slice(0, targetCount - chosen.length));
    }
    chosen = shuffleArray(chosen, rng);
  } else {
    // Standard randomized selection prioritizing unseen and non-recent questions
    const unseen = shuffleArray(
      pool.filter((q) => !recentSet.has(q.id) && (!stats[q.id] || stats[q.id].attempts === 0)),
      rng
    );
    const seenNotRecent = shuffleArray(
      pool.filter((q) => !recentSet.has(q.id) && stats[q.id] && stats[q.id].attempts > 0),
      rng
    );
    const recent = shuffleArray(
      pool.filter((q) => recentSet.has(q.id)),
      rng
    );
    chosen = shuffleArray([...unseen, ...seenNotRecent, ...recent].slice(0, targetCount), rng);
  }

  return chosen.map((q) => shuffleQuestionOptions(q, rng));
}

/**
 * Spaced-repetition interval update (Leitner/SM-2 inspired).
 * Incorrect answers schedule an immediate/short review interval (e.g. 4 hours).
 * Consecutive correct answers expand intervals: 1d -> 3d -> 7d -> 14d -> 30d.
 */
export function computeUpdatedQuestionStat(
  existing: QuestionStats | undefined,
  questionId: string,
  isCorrect: boolean,
  now: number = Date.now(),
  confidence?: 'low' | 'medium' | 'high'
): QuestionStats {
  const prev: QuestionStats = existing ?? {
    questionId,
    attempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    consecutiveCorrect: 0,
    lastAnsweredAt: 0,
    nextReviewAt: 0,
    flagged: false,
    bookmarked: false,
  };

  const consecutiveCorrect = isCorrect ? prev.consecutiveCorrect + 1 : 0;
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  let intervalMs: number;
  if (!isCorrect) {
    intervalMs = 4 * HOUR;
  } else {
    const schedule = [1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
    const idx = Math.min(consecutiveCorrect - 1, schedule.length - 1);
    intervalMs = schedule[Math.max(0, idx)];
    if (confidence === 'low') {
      intervalMs = Math.max(12 * HOUR, Math.floor(intervalMs * 0.5));
    }
  }

  return {
    ...prev,
    attempts: prev.attempts + 1,
    correctAttempts: prev.correctAttempts + (isCorrect ? 1 : 0),
    incorrectAttempts: prev.incorrectAttempts + (isCorrect ? 0 : 1),
    consecutiveCorrect,
    lastAnsweredAt: now,
    nextReviewAt: now + intervalMs,
    lastConfidence: confidence ?? prev.lastConfidence,
  };
}

/**
 * Converts raw percentage (0..1) into AWS scaled score (100..1000).
 * 70% corresponds to 700 (passing benchmark).
 */
export function calculateScaledScore(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 100;
  const ratio = Math.max(0, Math.min(1, correctCount / totalQuestions));
  return Math.round(100 + ratio * 900);
}
