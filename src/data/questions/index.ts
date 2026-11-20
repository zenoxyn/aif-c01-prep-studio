import { DomainId, Question } from '../../types';
import { DOMAIN_1_PART_1 } from './d1_part1';
import { DOMAIN_1_PART_2 } from './d1_part2';
import { DOMAIN_2_PART_1 } from './d2_part1';
import { DOMAIN_2_PART_2 } from './d2_part2';
import { DOMAIN_3_PART_1 } from './d3_part1';
import { DOMAIN_3_PART_2 } from './d3_part2';
import { DOMAIN_4_PART_1 } from './d4_part1';
import { DOMAIN_4_PART_2 } from './d4_part2';
import { DOMAIN_5_PART_1 } from './d5_part1';
import { DOMAIN_5_PART_2 } from './d5_part2';

export const ALL_QUESTIONS: Question[] = [
  ...DOMAIN_1_PART_1,
  ...DOMAIN_1_PART_2,
  ...DOMAIN_2_PART_1,
  ...DOMAIN_2_PART_2,
  ...DOMAIN_3_PART_1,
  ...DOMAIN_3_PART_2,
  ...DOMAIN_4_PART_1,
  ...DOMAIN_4_PART_2,
  ...DOMAIN_5_PART_1,
  ...DOMAIN_5_PART_2,
];

export function getQuestionsByDomain(domainId: DomainId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.domainId === domainId);
}

export function getQuestionById(questionId: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === questionId);
}

export function getAllTopics(domainId?: DomainId | 'all'): string[] {
  const source =
    domainId && domainId !== 'all' ? getQuestionsByDomain(domainId) : ALL_QUESTIONS;
  return Array.from(new Set(source.map((q) => q.topic))).sort();
}
