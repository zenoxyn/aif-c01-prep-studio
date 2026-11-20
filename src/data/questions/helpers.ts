import {
  Difficulty,
  DomainId,
  Question,
  QuestionStyle,
  QuestionType,
} from '../../types';

export interface CompactQuestionInput {
  id: string;
  domainId: DomainId;
  topic: string;
  difficulty: Difficulty;
  type?: QuestionType;
  style: QuestionStyle;
  scenario?: string;
  text: string;
  options: { id: string; text: string; reason: string }[];
  correctIds: string[];
  explanation: string;
  examReasoning: string;
  tags: string[];
  sourceTopicRef: string;
  lessonId?: string;
}

export function makeQ(input: CompactQuestionInput): Question {
  const optionExplanations: Record<string, string> = {};
  const options = input.options.map((o) => {
    optionExplanations[o.id] = o.reason;
    return {
      id: o.id,
      text: o.text,
      distractorExplanation: o.reason,
    };
  });

  return {
    id: input.id,
    domainId: input.domainId,
    topic: input.topic,
    difficulty: input.difficulty,
    type: input.type ?? (input.correctIds.length > 1 ? 'multiple-response' : 'single-choice'),
    style: input.style,
    scenario: input.scenario,
    text: input.text,
    options,
    correctOptionIds: input.correctIds,
    explanation: input.explanation,
    optionExplanations,
    examReasoning: input.examReasoning,
    tags: input.tags,
    sourceTopicRef: input.sourceTopicRef,
    lessonId: input.lessonId,
  };
}
