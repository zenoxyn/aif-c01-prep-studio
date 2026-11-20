export type DomainId = 'd1' | 'd2' | 'd3' | 'd4' | 'd5';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'single-choice' | 'multiple-response';

export type QuestionStyle =
  | 'scenario'
  | 'service-selection'
  | 'conceptual'
  | 'comparison'
  | 'best-solution'
  | 'security-responsible-ai';

export interface DomainConfig {
  id: DomainId;
  number: number;
  title: string;
  shortTitle: string;
  weightPercent: number;
  description: string;
  taskStatements: {
    code: string;
    title: string;
    objectives: string[];
  }[];
  relatedServices: string[];
  examTips: string[];
}

export interface ExamBlueprintConfig {
  examCode: string;
  examTitle: string;
  totalQuestions: number;
  scoredQuestions: number;
  unscoredQuestions: number;
  durationMinutes: number;
  passingScoreScaled: number;
  maxScoreScaled: number;
  minScoreScaled: number;
  passingPercentageBenchmark: number;
  domains: DomainConfig[];
}

export interface LessonKnowledgeCheck {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface LessonComparisonRow {
  aspect: string;
  left: string;
  right: string;
}

export interface Lesson {
  id: string;
  domainId: DomainId;
  taskStatement: string;
  order: number;
  title: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  objectives: string[];
  conceptExplanation: string;
  whyItMatters: string;
  detailedExplanation: string[];
  realWorldExample: string;
  awsExample: string;
  comparisonTable?: {
    title: string;
    headers: [string, string, string];
    rows: LessonComparisonRow[];
  };
  commonMisconceptions: string[];
  examKeywords: string[];
  howToRecognize: string;
  keyTakeaway: string;
  knowledgeCheck: LessonKnowledgeCheck;
  relatedServiceIds: string[];
}

export interface AwsServiceGuide {
  id: string;
  name: string;
  category: 'Generative AI' | 'Managed ML' | 'Vision & Document' | 'Language & Speech' | 'Personalization & Search' | 'Data, Security & Governance';
  priority: 'Core Exam Priority' | 'Important Supporting' | 'Supplementary';
  domains: DomainId[];
  whatItDoes: string;
  primaryPurpose: string;
  problemItSolves: string;
  typicalUseCases: string[];
  inputHandled: string;
  outputProduced: string;
  whenToChoose: string[];
  whenNotToChoose: string[];
  keyDifferences: string;
  examClues: string[];
  realisticScenario: string;
  memoryAid: string;
}

export interface ServiceComparison {
  id: string;
  title: string;
  leftName: string;
  rightName: string;
  summary: string;
  criteria: {
    dimension: string;
    leftValue: string;
    rightValue: string;
  }[];
  examRuleOfThumb: string;
  domains: DomainId[];
}

export interface QuestionOption {
  id: string;
  text: string;
  distractorExplanation?: string;
}

export interface Question {
  id: string;
  domainId: DomainId;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  style: QuestionStyle;
  scenario?: string;
  text: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  explanation: string;
  optionExplanations: Record<string, string>;
  examReasoning: string;
  tags: string[];
  sourceTopicRef: string;
  lessonId?: string;
}

export interface ShuffledQuestion {
  question: Question;
  shuffledOptions: QuestionOption[];
  // Maps display letter (A, B, C...) -> original option id
  displayOrder: { label: string; optionId: string; text: string }[];
}

export interface QuestionStats {
  questionId: string;
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  consecutiveCorrect: number;
  lastAnsweredAt: number;
  nextReviewAt: number;
  lastConfidence?: 'low' | 'medium' | 'high';
  flagged: boolean;
  bookmarked: boolean;
}

export interface PracticeSessionRecord {
  id: string;
  mode: 'quick' | 'domain' | 'weakness' | 'mixed' | 'review';
  domainFilter: DomainId | 'all';
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  completedAt: number;
  questionResults: {
    questionId: string;
    domainId: DomainId;
    topic: string;
    selectedOptionIds: string[];
    isCorrect: boolean;
  }[];
}

export interface ExamAttemptRecord {
  id: string;
  mode: 'full' | 'short';
  title: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scaledScore: number;
  percentage: number;
  passed: boolean;
  durationSeconds: number;
  timeLimitSeconds: number | null;
  completedAt: number;
  domainBreakdown: Record<DomainId, { total: number; correct: number }>;
  questionOutcomes: {
    questionId: string;
    domainId: DomainId;
    topic: string;
    selectedOptionIds: string[];
    correctOptionIds: string[];
    isCorrect: boolean;
    flagged: boolean;
    shuffledOptionIds: string[];
  }[];
}

export interface UserProgressState {
  theme: 'light' | 'dark';
  completedLessonIds: string[];
  lastVisitedLessonId: string | null;
  lessonScrollPositions: Record<string, number>;
  lessonKnowledgeChecksPassed: Record<string, boolean>;
  bookmarkedLessonIds: string[];
  lessonNotes: Record<string, string>;
  studySecondsByDay: Record<string, number>;
  questionStats: Record<string, QuestionStats>;
  practiceHistory: PracticeSessionRecord[];
  examHistory: ExamAttemptRecord[];
  blueprintOverrides: Record<DomainId, number>;
  customExamPassingPercentage: number;
}

export type AppView =
  | 'dashboard'
  | 'learn'
  | 'services'
  | 'practice'
  | 'exam'
  | 'review'
  | 'progress'
  | 'settings';
