import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_QUESTIONS, getQuestionsByDomain } from '../data/questions';
import { ALL_LESSONS, getLessonById } from '../data/lessons';
import { AWS_SERVICES_GUIDE } from '../data/awsServices';
import { OFFICIAL_DOMAINS, OFFICIAL_EXAM_BLUEPRINT } from '../data/examBlueprint';
import {
  allocateDomainCounts,
  calculateScaledScore,
  computeUpdatedQuestionStat,
  isAnswerCorrect,
  selectPracticeQuestions,
  shuffleQuestionOptions,
  createRng,
} from './examEngine';
import { computeDomainMastery, computeStudyStreakDays, computeTopicAnalytics } from './analytics';
import { DEFAULT_USER_PROGRESS } from './storage';
import { DomainId, UserProgressState } from '../types';

describe('AIF-C01 Question Bank Integrity & Anti-Duplication Audit', () => {
  it('contains at least 500 unique questions total and at least 100 per domain', () => {
    assert.ok(
      ALL_QUESTIONS.length >= 500,
      `Expected >= 500 questions, found ${ALL_QUESTIONS.length}`
    );
    (['d1', 'd2', 'd3', 'd4', 'd5'] as DomainId[]).forEach((domainId) => {
      const domQuestions = getQuestionsByDomain(domainId);
      assert.ok(
        domQuestions.length >= 100,
        `Expected >= 100 questions in ${domainId}, found ${domQuestions.length}`
      );
    });
  });

  it('has strictly unique question IDs and unique normalized question prompts', () => {
    const ids = new Set<string>();
    const stems = new Set<string>();

    for (const q of ALL_QUESTIONS) {
      assert.ok(!ids.has(q.id), `Duplicate question ID: ${q.id}`);
      ids.add(q.id);

      const normalized = `${q.scenario ?? ''} ${q.text}`.toLowerCase().replace(/\s+/g, ' ').trim();
      assert.ok(!stems.has(normalized), `Duplicate question stem on ${q.id}`);
      stems.add(normalized);
    }
  });

  it('validates every question option, distractor reason, correct IDs, and lesson references', () => {
    const serviceIds = new Set(AWS_SERVICES_GUIDE.map((s) => s.id));
    assert.ok(serviceIds.size >= 15);

    for (const q of ALL_QUESTIONS) {
      assert.ok(q.options.length >= 4, `${q.id} should have at least 4 options`);
      assert.ok(q.correctOptionIds.length >= 1, `${q.id} missing correctOptionIds`);
      assert.ok(q.explanation.trim().length > 10, `${q.id} missing explanation`);
      assert.ok(q.examReasoning.trim().length > 5, `${q.id} missing examReasoning`);

      const optIds = new Set(q.options.map((o) => o.id));
      assert.equal(optIds.size, q.options.length, `${q.id} has duplicate option IDs`);

      for (const cid of q.correctOptionIds) {
        assert.ok(optIds.has(cid), `${q.id} correctOptionId "${cid}" missing from options`);
      }

      if (q.type === 'multiple-response') {
        assert.ok(q.correctOptionIds.length >= 2, `${q.id} multiple-response needs >=2 answers`);
      } else {
        assert.equal(q.correctOptionIds.length, 1, `${q.id} single-choice needs 1 answer`);
      }

      for (const opt of q.options) {
        const reason = q.optionExplanations[opt.id];
        assert.ok(
          reason && reason.trim().length > 0,
          `${q.id} option "${opt.id}" missing optionExplanations entry`
        );
      }

      if (q.lessonId) {
        assert.ok(getLessonById(q.lessonId), `${q.id} references unknown lessonId ${q.lessonId}`);
      }
    }

    assert.ok(ALL_LESSONS.length >= 20, `Expected >= 20 lessons, got ${ALL_LESSONS.length}`);
  });
});

describe('Exam Blueprint & Weighted Allocation', () => {
  it('allocates exact official 65-question AIF-C01 weights [13, 16, 18, 9, 9]', () => {
    const counts = allocateDomainCounts(OFFICIAL_EXAM_BLUEPRINT.totalQuestions, {
      d1: 20,
      d2: 24,
      d3: 28,
      d4: 14,
      d5: 14,
    });
    assert.deepEqual(counts, { d1: 13, d2: 16, d3: 18, d4: 9, d5: 9 });
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    assert.equal(sum, 65);
  });

  it('converts raw ratios cleanly to AWS 100-1000 scaled score with 70% = 700', () => {
    assert.equal(calculateScaledScore(0, 65), 100);
    assert.equal(calculateScaledScore(65, 65), 1000);
    assert.equal(calculateScaledScore(70, 100), 730);
    assert.equal(calculateScaledScore(35, 50), 730);
    assert.equal(Math.round(100 + (43 / 65) * 900), calculateScaledScore(43, 65));
  });
});

describe('Dynamic Option Shuffling & Exact Answer Validation', () => {
  it('validates single-choice and multiple-response answers accurately regardless of option order', () => {
    const singleQ = ALL_QUESTIONS.find((q) => q.type === 'single-choice')!;
    const multiQ = ALL_QUESTIONS.find((q) => q.type === 'multiple-response')!;
    const rng = createRng(42);

    for (let i = 0; i < 10; i++) {
      const shuffledSingle = shuffleQuestionOptions(singleQ, rng);
      assert.equal(shuffledSingle.shuffledOptions.length, singleQ.options.length);
      assert.equal(isAnswerCorrect(singleQ, singleQ.correctOptionIds), true);
      const wrongSingle = singleQ.options.find((o) => !singleQ.correctOptionIds.includes(o.id))!;
      assert.equal(isAnswerCorrect(singleQ, [wrongSingle.id]), false);
    }

    const shuffledMulti = shuffleQuestionOptions(multiQ, rng);
    assert.equal(shuffledMulti.displayOrder.length, multiQ.options.length);
    const reversedCorrect = [...multiQ.correctOptionIds].reverse();
    assert.equal(isAnswerCorrect(multiQ, reversedCorrect), true);
    assert.equal(isAnswerCorrect(multiQ, [multiQ.correctOptionIds[0]]), false);
    assert.equal(isAnswerCorrect(multiQ, []), false);
  });
});

describe('Practice Selection & Spaced Repetition Scheduling', () => {
  it('never returns duplicate question IDs in a single session and honors domain weighting', () => {
    const examSession = selectPracticeQuestions({
      questions: ALL_QUESTIONS,
      count: 65,
      useWeightedDistribution: true,
      domainWeights: { d1: 20, d2: 24, d3: 28, d4: 14, d5: 14 },
      seed: 1234,
    });
    assert.equal(examSession.length, 65);
    const uniqueIds = new Set(examSession.map((item) => item.question.id));
    assert.equal(uniqueIds.size, 65);

    const perDomain: Record<DomainId, number> = { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 };
    examSession.forEach((item) => {
      perDomain[item.question.domainId] += 1;
    });
    assert.deepEqual(perDomain, { d1: 13, d2: 16, d3: 18, d4: 9, d5: 9 });
  });

  it('schedules short review interval on incorrect answer and expanding intervals on consecutive correct answers', () => {
    const baseTime = 1_700_000_000_000;
    const wrongStat = computeUpdatedQuestionStat(undefined, 'd1-q001', false, baseTime);
    assert.equal(wrongStat.consecutiveCorrect, 0);
    assert.equal(wrongStat.incorrectAttempts, 1);
    assert.equal(wrongStat.nextReviewAt - baseTime, 4 * 60 * 60 * 1000);

    const right1 = computeUpdatedQuestionStat(wrongStat, 'd1-q001', true, baseTime + 10_000);
    assert.equal(right1.consecutiveCorrect, 1);
    assert.equal(right1.nextReviewAt - (baseTime + 10_000), 24 * 60 * 60 * 1000);

    const right2 = computeUpdatedQuestionStat(right1, 'd1-q001', true, baseTime + 20_000);
    assert.equal(right2.consecutiveCorrect, 2);
    assert.equal(right2.nextReviewAt - (baseTime + 20_000), 3 * 24 * 60 * 60 * 1000);
  });
});

describe('Sample-Size Weighted Domain Mastery & Study Streak', () => {
  it('prevents 1 or 2 correct answers from inflating domain mastery to 100%', () => {
    const progress: UserProgressState = {
      ...DEFAULT_USER_PROGRESS,
      questionStats: {
        'd1-q001': {
          questionId: 'd1-q001',
          attempts: 1,
          correctAttempts: 1,
          incorrectAttempts: 0,
          consecutiveCorrect: 1,
          lastAnsweredAt: Date.now(),
          nextReviewAt: Date.now() + 86_400_000,
          flagged: false,
          bookmarked: false,
        },
        'd1-q002': {
          questionId: 'd1-q002',
          attempts: 1,
          correctAttempts: 1,
          incorrectAttempts: 0,
          consecutiveCorrect: 1,
          lastAnsweredAt: Date.now(),
          nextReviewAt: Date.now() + 86_400_000,
          flagged: false,
          bookmarked: false,
        },
      },
    };

    const masteries = computeDomainMastery(OFFICIAL_DOMAINS, ALL_QUESTIONS, ALL_LESSONS, progress);
    const d1 = masteries.find((m) => m.domainId === 'd1')!;
    assert.equal(d1.accuracyPercent, 100);
    assert.equal(d1.confidenceLevel, 'Insufficient Data');
    assert.ok(d1.masteryScore < 20, `Expected conservative mastery < 20 for 2 Qs, got ${d1.masteryScore}`);

    const topics = computeTopicAnalytics(ALL_QUESTIONS, progress.questionStats);
    assert.ok(topics.length > 0);
  });

  it('computes study streak accurately across consecutive calendar days', () => {
    const ref = new Date('2026-11-20T12:00:00Z');
    const fmt = (offset: number) => {
      const d = new Date(ref);
      d.setDate(d.getDate() - offset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const map = {
      [fmt(0)]: 300,
      [fmt(1)]: 600,
      [fmt(2)]: 450,
      [fmt(4)]: 900,
    };
    assert.equal(computeStudyStreakDays(map, ref), 3);
  });
});
