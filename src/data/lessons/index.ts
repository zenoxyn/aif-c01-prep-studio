import { Lesson } from '../../types';
import { DOMAIN_1_LESSONS } from './d1Lessons';
import { DOMAIN_2_LESSONS } from './d2Lessons';
import { DOMAIN_3_LESSONS } from './d3Lessons';
import { DOMAIN_4_LESSONS } from './d4Lessons';
import { DOMAIN_5_LESSONS } from './d5Lessons';

export const ALL_LESSONS: Lesson[] = [
  ...DOMAIN_1_LESSONS,
  ...DOMAIN_2_LESSONS,
  ...DOMAIN_3_LESSONS,
  ...DOMAIN_4_LESSONS,
  ...DOMAIN_5_LESSONS,
];

export function getLessonsByDomain(domainId: string): Lesson[] {
  return ALL_LESSONS.filter((l) => l.domainId === domainId).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}
