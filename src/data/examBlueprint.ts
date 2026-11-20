import { DomainConfig, ExamBlueprintConfig } from '../types';

export const OFFICIAL_DOMAINS: DomainConfig[] = [
  {
    id: 'd1',
    number: 1,
    title: 'Fundamentals of AI and ML',
    shortTitle: 'AI & ML Fundamentals',
    weightPercent: 20,
    description:
      'Core concepts of artificial intelligence, machine learning, deep learning, supervised/unsupervised/reinforcement learning, the ML development lifecycle, data quality, and model evaluation metrics.',
    taskStatements: [
      {
        code: '1.1',
        title: 'Explain basic AI concepts and terminologies',
        objectives: [
          'Define AI, ML, deep learning, neural networks, and their hierarchical relationship',
          'Distinguish traditional rule-based programming from machine learning',
          'Contrast supervised, unsupervised, and reinforcement learning paradigms',
          'Explain inference (batch vs. real-time), training, features, labels, and model parameters',
        ],
      },
      {
        code: '1.2',
        title: 'Identify practical use cases for AI',
        objectives: [
          'Select ML solutions for classification, regression, clustering, forecasting, and recommendations',
          'Identify appropriate computer vision, NLP, speech AI, and predictive AI scenarios',
          'Recognize when simple heuristics or non-AI automation is preferable to ML',
        ],
      },
      {
        code: '1.3',
        title: 'Describe the machine learning development lifecycle',
        objectives: [
          'Explain data collection, cleaning, labeling, feature engineering, and train/validation/test splitting',
          'Diagnose data leakage, class imbalance, overfitting, underfitting, and bias-variance tradeoffs',
          'Interpret evaluation metrics: accuracy, precision, recall, F1-score, AUC-ROC, RMSE, and confusion matrices',
          'Outline deployment, monitoring for data/concept drift, and iterative retraining on AWS',
        ],
      },
    ],
    relatedServices: ['sagemaker-ai', 'rekognition', 'comprehend', 'personalize', 'forecast', 'glue', 's3'],
    examTips: [
      'When labeled historical outcomes exist and you predict a category (spam/fraud) -> Supervised Classification; a continuous number (price/demand) -> Supervised Regression.',
      'When no labels exist and you discover hidden segments or anomalies -> Unsupervised Clustering.',
      'Watch out for Precision vs. Recall traps: high cost of false positives favors Precision; high cost of missed detections (medical/fraud) favors Recall.',
      'Remember AWS SageMaker AI manages the full custom ML lifecycle from data prep to endpoints and drift monitoring.',
    ],
  },
  {
    id: 'd2',
    number: 2,
    title: 'Fundamentals of Generative AI',
    shortTitle: 'Generative AI Fundamentals',
    weightPercent: 24,
    description:
      'Core concepts of foundation models, large language models, transformers, tokenization, embeddings, prompt mechanics, inference parameters, multimodal generation, and model capabilities and limitations.',
    taskStatements: [
      {
        code: '2.1',
        title: 'Explain the basic concepts of generative AI',
        objectives: [
          'Contrast generative AI with traditional predictive/discriminative ML',
          'Explain foundation models (FMs), LLMs, transformer self-attention conceptually, tokens, and context windows',
          'Describe embeddings, vector representations, and semantic similarity',
          'Understand inference controls (temperature, top-p, top-k, max tokens, stop sequences)',
        ],
      },
      {
        code: '2.2',
        title: 'Understand the capabilities and limitations of generative AI for solving business problems',
        objectives: [
          'Match GenAI tasks (summarization, translation, code/content/image generation, synthetic data) to business value',
          'Diagnose hallucinations, knowledge cutoffs, non-determinism, and context-window truncation',
          'Identify grounding strategies (RAG vs. fine-tuning) conceptually and evaluate GenAI outputs',
        ],
      },
      {
        code: '2.3',
        title: 'Describe AWS infrastructure and technologies for building generative AI applications',
        objectives: [
          'Differentiate managed FM access (Amazon Bedrock), turnkey apps (Amazon Q), and custom model training (SageMaker AI)',
          'Recognize AWS purpose-built AI silicon (AWS Trainium for training, AWS Inferentia for inference)',
          'Understand serverless FM invocation, model selection trade-offs, and managed customization concepts',
        ],
      },
    ],
    relatedServices: ['bedrock', 'q-business', 'sagemaker-ai', 'translate', 'polly'],
    examTips: [
      'Lowering temperature (near 0) makes responses more deterministic and factual; raising temperature increases creativity and randomness.',
      'Context window limits how much text (prompt + retrieved context + output) a model can process in a single call—if a document exceeds it, chunking + RAG is needed.',
      'Hallucinations occur when an FM generates plausible-sounding but factually false statements; grounding with RAG reduces hallucinations.',
      'AWS Trainium accelerates training of large models; AWS Inferentia accelerates low-cost, high-throughput inference.',
    ],
  },
  {
    id: 'd3',
    number: 3,
    title: 'Applications of Foundation Models',
    shortTitle: 'FM Applications',
    weightPercent: 28,
    description:
      'Architectural decisions for FM-powered solutions: model selection criteria, prompt engineering techniques, RAG with Knowledge Bases and vector stores, fine-tuning vs. continued pre-training, agents/tool use, guardrails, and evaluation.',
    taskStatements: [
      {
        code: '3.1',
        title: 'Describe design considerations for applications that use foundation models',
        objectives: [
          'Select an FM based on capability, cost, latency, context window length, multimodality, and throughput',
          'Apply cost and latency optimization strategies (smaller models, prompt caching, provisioned throughput vs. on-demand)',
          'Design multimodal architectures combining text, images, documents, and audio',
        ],
      },
      {
        code: '3.2',
        title: 'Choose effective prompt engineering techniques',
        objectives: [
          'Apply zero-shot, few-shot, chain-of-thought, system prompts, and reusable prompt templates',
          'Control output formatting (JSON, delimiters) and prevent prompt leakage/over-reliance on brittle phrasing',
        ],
      },
      {
        code: '3.3',
        title: 'Describe the training and fine-tuning process for foundation models',
        objectives: [
          'Choose between prompt engineering, RAG, instruction fine-tuning, and continued pre-training',
          'Understand when domain-specific unlabeled corpora justify continued pre-training vs. labeled pairs for fine-tuning',
        ],
      },
      {
        code: '3.4',
        title: 'Evaluate methods to retrieve and integrate external data (RAG & Agents)',
        objectives: [
          'Architect RAG pipelines using embeddings, chunking, vector databases (OpenSearch Serverless, Aurora pgvector), and Amazon Bedrock Knowledge Bases',
          'Use Agents for Amazon Bedrock to orchestrate multi-step tasks and invoke APIs/Lambda tools',
        ],
      },
      {
        code: '3.5',
        title: 'Evaluate foundation model performance and human-in-the-loop workflows',
        objectives: [
          'Evaluate responses using automated metrics (ROUGE, BLEU, BERTScore), LLM-as-a-judge, and human evaluation (Amazon A2I / Bedrock Model Evaluation)',
          'Measure RAG retrieval quality (context relevance) and generation quality (groundedness, faithfulness)',
        ],
      },
    ],
    relatedServices: ['bedrock', 'sagemaker-ai', 'textract', 'comprehend', 'lex', 'kendra', 's3'],
    examTips: [
      'Domain 3 is the largest exam domain (28%). Always follow the AWS escalation ladder: Prompt Engineering first (cheapest/fastest) -> RAG (up-to-date/private facts) -> Fine-tuning (style/format/task behavior) -> Continued Pre-training (deep domain vocabulary).',
      'RAG solves knowledge freshness and citations without retraining the model weights.',
      'Bedrock Agents execute multi-step workflows by calling external APIs/AWS Lambda functions; Knowledge Bases only retrieve and ground answers from documents.',
      'Amazon Augmented AI (A2I) adds human review when model confidence falls below a threshold.',
    ],
  },
  {
    id: 'd4',
    number: 4,
    title: 'Guidelines for Responsible AI',
    shortTitle: 'Responsible AI',
    weightPercent: 14,
    description:
      'Core responsible AI dimensions—fairness, explainability, transparency, privacy, safety, robustness, and governance—alongside bias detection, toxicity filtering, hallucination mitigation, and human oversight.',
    taskStatements: [
      {
        code: '4.1',
        title: 'Explain the development of AI systems that are responsible',
        objectives: [
          'Define AWS Responsible AI core dimensions: Fairness, Explainability, Transparency, Privacy & Security, Safety, Controllability, Veracity & Robustness, Governance',
          'Identify sources of bias (selection, sampling, historical, confirmation, measurement) and imbalance',
          'Choose AWS tools for bias detection and explainability (Amazon SageMaker Clarify, SHAP values, Model Cards)',
        ],
      },
      {
        code: '4.2',
        title: 'Recognize the importance of transparent and explainable models',
        objectives: [
          'Distinguish interpretable-by-design models (decision trees, linear regression) from black-box models (deep neural networks, LLMs)',
          'Implement Amazon Bedrock Guardrails to filter hate/violence/insults, block denied topics, and perform contextual grounding checks',
          'Design human-in-the-loop oversight and transparent AI system documentation (Model Cards)',
        ],
      },
    ],
    relatedServices: ['bedrock', 'sagemaker-ai', 'comprehend', 'rekognition'],
    examTips: [
      'SageMaker Clarify is the flagship AWS service for detecting pre-training/post-training bias and generating SHAP feature-attribution explainability reports.',
      'Amazon Bedrock Guardrails protects GenAI apps with content filters, denied topics, word filters, PII redaction, and contextual grounding checks to catch hallucinations.',
      'Explainability answers "why did the model make this decision?"; Transparency communicates model capabilities, limitations, and training data lineage (e.g., SageMaker Model Cards).',
      'Fairness issues almost always trace back to unrepresentative or historically biased training datasets—fix the data or apply bias mitigation rather than blindly adding compute.',
    ],
  },
  {
    id: 'd5',
    number: 5,
    title: 'Security, Compliance, and Governance for AI Solutions',
    shortTitle: 'Security & Governance',
    weightPercent: 14,
    description:
      'Securing AI workloads under the AWS Shared Responsibility Model, IAM least privilege, KMS encryption, VPC/PrivateLink isolation, PII detection/redaction, generative AI threats (prompt injection, data poisoning), and audit/governance services.',
    taskStatements: [
      {
        code: '5.1',
        title: 'Explain methods to secure AI systems',
        objectives: [
          'Apply the AWS Shared Responsibility Model to managed AI services (Bedrock) vs. self-managed models (SageMaker/EC2)',
          'Enforce IAM least privilege, resource policies, AWS KMS encryption at rest, TLS encryption in transit, and AWS PrivateLink',
          'Detect and protect PII using Amazon Macie (S3 data), Amazon Comprehend PII detection, and Bedrock Guardrails PII masking',
          'Recognize GenAI security threats: prompt injection, jailbreaking, data poisoning, model inversion, and shadow AI',
        ],
      },
      {
        code: '5.2',
        title: 'Understand governance and compliance regulations for AI systems',
        objectives: [
          'Audit API calls and model invocations using AWS CloudTrail and Bedrock Model Invocation Logging',
          'Monitor operational metrics and anomalies with Amazon CloudWatch, and enforce configuration compliance with AWS Config and AWS Artifact',
          'Understand data residency, customer data isolation in Bedrock (prompts are not used to train base models), and model lineage tracking',
        ],
      },
    ],
    relatedServices: ['iam', 'kms', 'cloudwatch', 's3', 'bedrock', 'sagemaker-ai', 'comprehend'],
    examTips: [
      'In Amazon Bedrock, customer prompts and completions are NEVER shared with model providers or used to train base foundation models.',
      'Match the security/governance service precisely: Macie -> discovers PII in S3 buckets; Comprehend -> detects/redacts PII in text streams; KMS -> manages encryption keys; CloudTrail -> logs API activity for auditing; CloudWatch -> monitors latency, token counts, and alarms; AWS Artifact -> downloads third-party compliance reports (SOC 2, ISO, HIPAA).',
      'Prompt injection tricks an LLM into overriding system instructions; mitigate with Bedrock Guardrails, input validation, least-privilege tool permissions, and separating system instructions from untrusted user data.',
      'Data poisoning corrupts training or fine-tuning data to skew behavior; mitigate with strict S3 access controls, data validation, and provenance tracking.',
    ],
  },
];

export const OFFICIAL_EXAM_BLUEPRINT: ExamBlueprintConfig = {
  examCode: 'AIF-C01',
  examTitle: 'AWS Certified AI Practitioner',
  totalQuestions: 65,
  scoredQuestions: 50,
  unscoredQuestions: 15,
  durationMinutes: 90,
  passingScoreScaled: 700,
  maxScoreScaled: 1000,
  minScoreScaled: 100,
  passingPercentageBenchmark: 70,
  domains: OFFICIAL_DOMAINS,
};
