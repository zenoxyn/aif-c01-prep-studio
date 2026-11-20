import { Lesson } from '../../types';

export const DOMAIN_4_LESSONS: Lesson[] = [
  {
    id: 'd4-l1',
    domainId: 'd4',
    taskStatement: '4.1',
    order: 1,
    title: 'Core Responsible AI Principles, Fairness & Bias Mitigation',
    difficulty: 'Easy',
    estimatedMinutes: 12,
    objectives: [
      'Define the core AWS Responsible AI dimensions: Fairness, Explainability, Transparency, Privacy & Security, Safety, Controllability, Veracity & Robustness, and Governance.',
      'Identify distinct sources of bias (selection, sampling, historical, confirmation, measurement) in datasets and models.',
      'Select appropriate mitigation strategies and AWS tools (Amazon SageMaker Clarify) for bias detection.',
    ],
    conceptExplanation:
      'Responsible AI ensures machine learning and generative AI systems are built and operated in ways that are fair, transparent, safe, accountable, and respectful of human privacy. Fairness means a model treats demographic groups equitably and does not amplify historical discrimination.',
    whyItMatters:
      'Domain 4 (14% of the exam) tests both conceptual definitions of Responsible AI dimensions and practical mitigation steps when a hiring, lending, or medical model shows skewed error rates across groups.',
    detailedExplanation: [
      'AWS frames Responsible AI around eight core dimensions: (1) Fairness (equitable outcomes across subpopulations), (2) Explainability (understanding why a decision occurred), (3) Transparency (communicating capabilities, limitations, and lineage clearly), (4) Privacy & Security (protecting sensitive data and preventing unauthorized exposure), (5) Safety (preventing harmful or toxic outputs), (6) Controllability (human ability to intervene or steer behavior), (7) Veracity & Robustness (accuracy, truthfulness, and resilience to edge cases), and (8) Governance (organizational accountability and compliance processes).',
      'Common Bias Types: Historical Bias reflects past societal inequities baked into old records (e.g., decades-old executive hiring data dominated by one gender). Selection/Sampling Bias happens when training data fails to represent the real deployment population (e.g., training a speech model only on one regional accent). Measurement Bias arises from flawed sensors or inconsistent human labeling. Confirmation Bias occurs when teams cherry-pick metrics or examples that confirm pre-existing beliefs.',
      'Important Exam Trap: Removing sensitive attributes like "race" or "gender" from tabular columns does NOT automatically eliminate bias! Proxy variables (such as zip code, school name, or club membership) correlate with protected attributes and still encode discrimination.',
      'Mitigation Strategies: Audit dataset balance before training (pre-training bias metrics), resample or reweight underrepresented groups, adjust decision thresholds per group (post-processing), and inspect ongoing production disparities continuously.',
    ],
    realWorldExample:
      'A resume-screening model trained on 10 years of past engineering hires penalized graduates of women’s colleges even after gender was removed from the input schema—because school names acted as a proxy variable reflecting historical hiring imbalance.',
    awsExample:
      'Amazon SageMaker Clarify measures pre-training data bias (e.g., Class Imbalance, DPL) and post-training model bias (e.g., Disparate Impact, Equal Opportunity Difference) across demographic facets—and helps teams monitor bias drift in production.',
    comparisonTable: {
      title: 'Common Types of AI Bias & Fixes',
      headers: ['Bias Type', 'How It Enters', 'Primary Mitigation'],
      rows: [
        { aspect: 'Sampling / Selection Bias', left: 'Training subset excludes real user groups', right: 'Collect diverse, representative training samples' },
        { aspect: 'Historical Bias', left: 'Past human prejudices embedded in labels', right: 'Rebalance/reweight data & audit with SageMaker Clarify' },
        { aspect: 'Proxy Variable Leakage', left: 'Zip code/school correlates with protected traits', right: 'Measure subgroup disparity directly via Clarify' },
        { aspect: 'Automation Bias', left: 'Humans blindly trust AI recommendations', right: 'Show confidence scores, explanations & enforce review' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Simply deleting the "gender" or "age" column guarantees a fair model. Reality: Correlated proxy features (zip code, income bracket, naming patterns) preserve bias unless explicitly audited.',
      'Misconception: Accuracy alone proves fairness. Reality: A model can be 92% accurate overall while failing 40% of the time on an underrepresented minority group.',
    ],
    examKeywords: ['Fairness', 'Selection bias', 'Historical bias', 'Proxy variable', 'SageMaker Clarify', 'Inclusiveness', 'Disparate impact'],
    howToRecognize:
      'When a scenario reports unequal approval rates or accuracy across age/gender/region groups—or asks how to detect dataset bias before and after training—select Amazon SageMaker Clarify and representative dataset curation.',
    keyTakeaway:
      'Fairness requires auditing subgroup outcomes rather than just dropping protected columns, using representative datasets and Amazon SageMaker Clarify.',
    knowledgeCheck: {
      question:
        'A lender removes "applicant gender" and "ethnicity" from its loan approval dataset, yet an audit shows applicants from certain postal codes are rejected at twice the rate of comparable applicants elsewhere. Which AWS tool helps detect and quantify this disparity?',
      options: [
        { id: 'a', text: 'Amazon Polly' },
        { id: 'b', text: 'Amazon SageMaker Clarify' },
        { id: 'c', text: 'Amazon Translate' },
        { id: 'd', text: 'AWS Trainium' },
      ],
      correctOptionId: 'b',
      explanation:
        'Postal code acted as a proxy variable. Amazon SageMaker Clarify detects pre-training and post-training bias across protected and proxy attributes.',
    },
    relatedServiceIds: ['sagemaker-ai'],
  },
  {
    id: 'd4-l2',
    domainId: 'd4',
    taskStatement: '4.2',
    order: 2,
    title: 'Explainability, Interpretability, Transparency & Model Cards',
    difficulty: 'Medium',
    estimatedMinutes: 12,
    objectives: [
      'Distinguish interpretability (inherently understandable models) from explainability (post-hoc feature attribution).',
      'Explain SHAP values and how SageMaker Clarify surfaces feature importance.',
      'Describe how Transparency and Amazon SageMaker Model Cards communicate intended use, limitations, and governance details.',
    ],
    conceptExplanation:
      'Explainability and interpretability enable humans to understand why an AI system produced a specific output, while transparency ensures stakeholders know how the system works, where its data came from, and what limitations apply.',
    whyItMatters:
      'Regulated industries (banking, healthcare, insurance) often legally require adverse-action explanations ("why was my loan declined?"). The exam frequently contrasts intrinsically interpretable models with black-box neural networks plus SHAP explainability.',
    detailedExplanation: [
      'Interpretability refers to how easily a human can trace a model’s internal logic directly from its structure. Linear regression, logistic regression, and shallow decision trees are inherently interpretable—you can read exact weights or split thresholds.',
      'Explainability refers to techniques that explain complex "black-box" models (such as deep neural networks, gradient-boosted ensembles, or LLMs) after training. SHAP (SHapley Additive exPlanations) calculates how much each input feature pushed an individual prediction higher or lower.',
      'Trade-Off: Often there is a tension between predictive accuracy on complex data (deep neural networks) and intrinsic interpretability (simple decision trees). When business or regulatory requirements mandate full auditability, choosing a simpler interpretable model—or pairing a complex model with SageMaker Clarify SHAP reports—is essential.',
      'Transparency means openly disclosing to users and auditors that they are interacting with AI, what data/benchmarks evaluated it, known failure modes, and boundaries of safe operation. Amazon SageMaker Model Cards provide structured, standardized documentation capturing intended use, training details, evaluation metrics, ethical considerations, and risk ratings across a model’s lifecycle.',
      'AWS AI Service Cards also publish transparent capabilities, limitations, and responsible use guidelines for managed services like Rekognition and Bedrock.',
    ],
    realWorldExample:
      'A credit union must provide specific reason codes whenever an automated model denies a credit line. By integrating Amazon SageMaker Clarify SHAP explanations, each denial letter automatically lists the top three contributing factors (e.g., debt-to-income ratio, recent credit inquiries).',
    awsExample:
      'Amazon SageMaker Clarify computes global and per-prediction SHAP feature attributions, while Amazon SageMaker Model Cards centralize governance documentation for auditors and product owners.',
    comparisonTable: {
      title: 'Interpretability vs. Explainability vs. Transparency',
      headers: ['Concept', 'Focus Question', 'Typical AWS Mechanism'],
      rows: [
        { aspect: 'Interpretability', left: 'Can humans directly read the model mechanics?', right: 'Linear/logistic regression, shallow decision trees' },
        { aspect: 'Explainability', left: 'Which features drove this prediction?', right: 'SageMaker Clarify (SHAP feature attribution)' },
        { aspect: 'Transparency', left: 'Are users/auditors informed of scope & limits?', right: 'SageMaker Model Cards & clear AI disclosures' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Explainability and transparency mean publishing proprietary model weights publicly. Reality: Transparency means documenting capabilities, training scope, limitations, and clear AI user disclosures—not exposing IP secrets.',
      'Misconception: Deep neural networks are easy to interpret directly. Reality: Deep models have millions/billions of opaque weights and require post-hoc explainability methods (like SHAP) or simpler surrogate/interpretable models.',
    ],
    examKeywords: ['Explainability', 'Interpretability', 'Transparency', 'SHAP values', 'Feature attribution', 'SageMaker Model Cards', 'Black-box model'],
    howToRecognize:
      'Look for "explain why a specific loan/claim prediction was made" -> SageMaker Clarify / SHAP; "standardized governance documentation of intended use and limitations" -> SageMaker Model Cards; "inherently understandable without post-hoc tools" -> Decision trees / Linear models.',
    keyTakeaway:
      'Use inherently interpretable models when simplicity suffices, SageMaker Clarify (SHAP) to explain complex predictions, and SageMaker Model Cards to standardize organizational transparency.',
    knowledgeCheck: {
      question:
        'A compliance officer asks the ML team to produce standardized documentation detailing a fraud model’s intended use cases, evaluation results, training data assumptions, and known limitations. Which AWS feature is built for this?',
      options: [
        { id: 'a', text: 'Amazon SageMaker Model Cards' },
        { id: 'b', text: 'Amazon Transcribe Custom Vocabulary' },
        { id: 'c', text: 'AWS Inferentia' },
        { id: 'd', text: 'Amazon Bedrock Batch Inference' },
      ],
      correctOptionId: 'a',
      explanation:
        'Amazon SageMaker Model Cards provide centralized, structured documentation of model purpose, metrics, assumptions, and risk considerations for governance and transparency.',
    },
    relatedServiceIds: ['sagemaker-ai'],
  },
  {
    id: 'd4-l3',
    domainId: 'd4',
    taskStatement: '4.1',
    order: 3,
    title: 'Safety, Toxicity Filtering, Hallucination Mitigation & Human Oversight',
    difficulty: 'Medium',
    estimatedMinutes: 11,
    objectives: [
      'Configure Amazon Bedrock Guardrails to enforce content safety, denied topics, word filters, and contextual grounding.',
      'Design mitigation strategies for toxic outputs, hallucinations, and over-reliance.',
      'Apply human oversight appropriately in high-risk generative AI workflows.',
    ],
    conceptExplanation:
      'Generative AI introduces unique responsible AI risks beyond tabular bias: models can emit toxic or hateful language, offer dangerous advice, violate brand policy topics, or hallucinate authoritative-sounding misinformation. Safety guardrails and human oversight work together to enforce boundaries independently of the underlying Foundation Model.',
    whyItMatters:
      'Amazon Bedrock Guardrails is heavily tested across both Domain 4 (safety/toxicity/hallucinations) and Domain 5 (PII filtering/prompt attack defense).',
    detailedExplanation: [
      'Amazon Bedrock Guardrails provides a configurable safety layer applied to both user prompts (inputs) and FM responses (outputs) across any model in Bedrock—and even external models via the ApplyGuardrail API.',
      'Core Guardrail Policies: (1) Content Filters block or filter hate speech, insults, sexual content, violence, misconduct, and prompt attacks at tunable sensitivity levels (None/Low/Medium/High). (2) Denied Topics block entire subject areas you define in natural language (e.g., "personalized medical diagnoses" or "competitor investment advice"). (3) Word Filters block custom profanity, banned terms, or competitor brand names. (4) Sensitive Information Filters mask or block PII (names, SSNs, credit cards) and custom regex patterns. (5) Contextual Grounding Checks score every response against the retrieved RAG source and user query, blocking hallucinations not supported by context.',
      'Veracity & Robustness: Beyond guardrails, reduce hallucinations by combining RAG citations, low temperature, clear refusal instructions ("If the answer is not in the context, state that you do not know"), and Automated Reasoning checks where formal rules apply.',
      'Human Oversight & Accountability: AI systems assist—not absolve—human accountability. High-consequence workflows (medical triage, legal filings, employee disciplinary decisions) must preserve meaningful human review, clear escalation paths, and user feedback mechanisms.',
    ],
    realWorldExample:
      'A retail bank’s customer assistant uses Bedrock Guardrails with Denied Topics ("tax advice" and "cryptocurrency speculation"), High-sensitivity Content Filters, PII masking, and a 0.85 Contextual Grounding threshold so ungrounded answers are blocked before reaching customers.',
    awsExample:
      'Amazon Bedrock Guardrails works uniformly across Amazon Nova, Claude, Llama, and custom fine-tuned models without rewriting application code.',
    comparisonTable: {
      title: 'Responsible AI Risk Mitigation Controls',
      headers: ['Risk', 'Example Failure', 'Best Mitigation'],
      rows: [
        { aspect: 'Toxic / Unsafe Output', left: 'Model repeats insults or harmful instructions', right: 'Bedrock Guardrails Content Filters & Word Filters' },
        { aspect: 'Out-of-Scope Advice', left: 'HR bot gives medical or legal counsel', right: 'Bedrock Guardrails Denied Topics' },
        { aspect: 'Factual Hallucination', left: 'Bot invents nonexistent warranty terms', right: 'RAG + Bedrock Guardrails Contextual Grounding Check' },
        { aspect: 'High-Stakes Error', left: 'Automated rejection harms a patient/applicant', right: 'Human-in-the-loop review (Amazon A2I / manual approval)' },
      ],
    },
    commonMisconceptions: [
      'Misconception: System prompt instructions alone guarantee a model will never say anything harmful. Reality: Determined users can bypass fragile system prompts; dedicated external filters like Bedrock Guardrails enforce independent policy checks.',
      'Misconception: Guardrails replace IAM permissions. Reality: Guardrails inspect prompt/response content; IAM controls who can invoke AWS APIs and resources.',
    ],
    examKeywords: ['Bedrock Guardrails', 'Content filters', 'Denied topics', 'Contextual grounding', 'Toxicity', 'Human oversight', 'Accountability'],
    howToRecognize:
      'Any scenario asking to "block offensive language, prevent off-topic advice (like investment/medical tips), mask PII in chat, or catch ungrounded hallucinations consistently across multiple FMs" points directly to Amazon Bedrock Guardrails.',
    keyTakeaway:
      'Pair Amazon Bedrock Guardrails (content filters, denied topics, grounding checks) with human oversight on consequential decisions to keep GenAI safe and accountable.',
    knowledgeCheck: {
      question:
        'An educational tutoring app powered by Amazon Bedrock must block discussions about self-harm, prevent the bot from giving legal advice, and catch answers unsupported by its textbook Knowledge Base. Which single AWS capability addresses all three needs?',
      options: [
        { id: 'a', text: 'Amazon Bedrock Guardrails' },
        { id: 'b', text: 'AWS Glue DataBrew' },
        { id: 'c', text: 'Amazon Forecast' },
        { id: 'd', text: 'Amazon EC2 Auto Scaling' },
      ],
      correctOptionId: 'a',
      explanation:
        'Amazon Bedrock Guardrails provides Content Filters (self-harm/safety), Denied Topics (legal advice), and Contextual Grounding Checks (catching unsupported answers against RAG sources).',
    },
    relatedServiceIds: ['bedrock', 'comprehend'],
  },
];
