import { Lesson } from '../../types';

export const DOMAIN_2_LESSONS: Lesson[] = [
  {
    id: 'd2-l1',
    domainId: 'd2',
    taskStatement: '2.1',
    order: 1,
    title: 'Generative AI vs. Predictive AI, Foundation Models & Transformers',
    difficulty: 'Easy',
    estimatedMinutes: 12,
    objectives: [
      'Contrast generative AI with traditional predictive/discriminative AI.',
      'Explain what Foundation Models (FMs) and Large Language Models (LLMs) are and why they generalize across tasks.',
      'Describe how Transformer self-attention works conceptually.',
    ],
    conceptExplanation:
      'Predictive AI analyzes input data to classify items or forecast numbers. Generative AI uses large pre-trained Foundation Models (FMs)—typically built on the Transformer architecture—to create brand-new content such as text, code, images, audio, or video.',
    whyItMatters:
      'Domain 2 accounts for 24% of the AIF-C01 exam. Understanding how FMs differ from narrow single-task ML models prevents misapplying LLMs to simple tabular forecasting or using classical classifiers where open-ended generation is needed.',
    detailedExplanation: [
      'Traditional ML models are usually narrow and task-specific: a fraud classifier only detects fraud and cannot summarize a report. Foundation Models (FMs) are massive neural networks pre-trained via self-supervised learning on huge, diverse datasets (billions or trillions of tokens/images). Because of their scale and general representations, a single FM can summarize, translate, draft emails, answer questions, or write code without training a separate model from scratch.',
      'Large Language Models (LLMs) are text-focused Foundation Models (such as Anthropic Claude, Amazon Nova, or Meta Llama). Multimodal Foundation Models process and/or generate across multiple modalities—text, images, audio, and video.',
      'The Transformer architecture (introduced in 2017) enabled modern LLMs by replacing slow sequential word-by-word reading with Self-Attention. Self-attention lets the model examine all tokens in an input simultaneously and weigh how every word relates to every other word—for instance, correctly linking "it" in a long sentence back to the right noun earlier in the paragraph.',
      'Diffusion models are a distinct generative architecture commonly used for high-resolution image and video generation: they learn to turn random Gaussian noise step-by-step into coherent visual scenes guided by text prompts.',
    ],
    realWorldExample:
      'A legal operations team previously needed one custom NLP model for clause classification and another for document translation. By adopting a single Foundation Model, they handle summarization, clause extraction, and multilingual translation from one unified API.',
    awsExample:
      'Amazon Bedrock offers serverless access to leading Foundation Models—including Amazon Nova, Anthropic Claude, Meta Llama, Mistral, Cohere, and Stability AI—without provisioning GPU clusters.',
    comparisonTable: {
      title: 'Predictive AI vs. Generative AI (Foundation Models)',
      headers: ['Dimension', 'Predictive AI', 'Generative AI (FMs)'],
      rows: [
        { aspect: 'Primary output', left: 'Labels, probabilities, numeric forecasts', right: 'New text, code, images, audio, video' },
        { aspect: 'Training scope', left: 'Narrow task-specific labeled dataset', right: 'Broad self-supervised pre-training at massive scale' },
        { aspect: 'Adaptability', left: 'Requires retraining for each new task', right: 'Adapts via prompts, RAG, or light fine-tuning' },
        { aspect: 'Determinism', left: 'Consistent score for identical input', right: 'Probabilistic sampling (controlled via temperature)' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Generative AI replaces all predictive ML. Reality: For structured tabular predictions (fraud scoring, churn probability, numerical demand forecasting), classical predictive ML is faster, cheaper, and more reliable.',
      'Misconception: Every company must train its own Foundation Model from scratch. Reality: Pre-training an FM costs millions of dollars; almost all organizations adopt pre-trained FMs via Amazon Bedrock and customize via prompts, RAG, or fine-tuning.',
    ],
    examKeywords: ['Foundation Model (FM)', 'Large Language Model (LLM)', 'Transformer', 'Self-attention', 'Diffusion model', 'Multimodal', 'Self-supervised pre-training'],
    howToRecognize:
      'When a question highlights creating original text/images/code or handling many varied language tasks without building separate models, look for Foundation Models / Generative AI. When it asks what architectural mechanism captures long-range context across words in parallel, look for Transformer self-attention.',
    keyTakeaway:
      'Foundation Models use Transformer self-attention and massive self-supervised pre-training to power flexible content generation across tasks.',
    knowledgeCheck: {
      question:
        'Which architectural innovation allows Large Language Models to process entire sequences in parallel and weigh relationships between distant words?',
      options: [
        { id: 'a', text: 'K-Means centroid clustering' },
        { id: 'b', text: 'Transformer self-attention mechanism' },
        { id: 'c', text: 'Linear regression gradient descent' },
        { id: 'd', text: 'Rule-based regular expressions' },
      ],
      correctOptionId: 'b',
      explanation:
        'Transformers rely on self-attention to evaluate relationships across all tokens in a sequence simultaneously, enabling parallel training and strong long-range context comprehension.',
    },
    relatedServiceIds: ['bedrock', 'q-business'],
  },
  {
    id: 'd2-l2',
    domainId: 'd2',
    taskStatement: '2.1',
    order: 2,
    title: 'Tokens, Tokenization, Context Windows & Embeddings',
    difficulty: 'Medium',
    estimatedMinutes: 12,
    objectives: [
      'Explain what tokens are and how tokenization converts text into numeric IDs.',
      'Understand context window limits and how input/output tokens drive cost and truncation.',
      'Describe embeddings and vector representations for semantic similarity.',
    ],
    conceptExplanation:
      'LLMs do not read raw characters or English words directly. First, a tokenizer splits text into subword units called tokens and maps them to numbers. The maximum number of tokens a model can consider at once is its context window. Separately, embedding models convert text or images into dense numeric vectors that capture semantic meaning.',
    whyItMatters:
      'Cost calculations, "why did the model forget the beginning of a 400-page PDF?", and semantic search architecture questions all hinge on tokens, context windows, and embeddings.',
    detailedExplanation: [
      'Tokenization breaks text into chunks (words, subwords, or punctuation). As a practical rule of thumb in English, 1 token is roughly 4 characters or ~0.75 words (so 1,000 tokens ≈ 750 words). Both your input prompt (including system instructions and retrieved documents) AND the model’s generated response consume tokens and determine API billing.',
      'The Context Window is the model’s working memory—the upper limit on total tokens (input + output) handled in one request (for example, 8K, 32K, 128K, or 200K+ tokens). Exceeding the context window causes errors or truncation of earlier context, and stuffing massive prompts unnecessarily increases latency and cost.',
      'Embeddings are dense arrays of floating-point numbers (vectors, e.g., 1,024 or 1,536 dimensions) produced by an embedding model (such as Amazon Titan Text Embeddings). Unlike keyword matching, embeddings place texts with similar meanings close together in geometric vector space—so "reset my password" and "forgot login credentials" have nearly identical vectors even though they share zero words.',
      'Vector databases (such as Amazon OpenSearch Serverless, Amazon Aurora PostgreSQL with pgvector, or Pinecone) store these embeddings and run fast similarity searches (cosine similarity / nearest neighbor) to retrieve the most relevant chunks for RAG.',
    ],
    realWorldExample:
      'A customer searches an internal HR portal for "parental leave policy." Keyword search misses a document titled "Maternity and Paternity Time Off." Using vector embeddings, semantic search matches the meaning instantly and returns the exact paragraph.',
    awsExample:
      'Amazon Titan Text Embeddings and Titan Multimodal Embeddings convert documents and images into vectors on Amazon Bedrock, which Bedrock Knowledge Bases automatically stores in vector databases like Amazon OpenSearch Serverless.',
    comparisonTable: {
      title: 'Keyword Search vs. Vector Embedding Semantic Search',
      headers: ['Aspect', 'Keyword Search (Lexical)', 'Vector Embeddings (Semantic)'],
      rows: [
        { aspect: 'Matching basis', left: 'Exact character/word overlap', right: 'Conceptual meaning & context proximity' },
        { aspect: 'Synonym handling', left: 'Poor without manual thesaurus rules', right: 'Strong ("car" matches "automobile")' },
        { aspect: 'Cross-modal search', left: 'Text-to-text only', right: 'Multimodal embeddings support text-to-image' },
        { aspect: 'Storage engine', left: 'Inverted word index', right: 'Vector database (cosine/dot-product distance)' },
      ],
    },
    commonMisconceptions: [
      'Misconception: 1 token always equals 1 word. Reality: Common short words may be 1 token, while long or rare words split into multiple subword tokens.',
      'Misconception: Embeddings generate conversational answers. Reality: Embedding models only output numeric vectors for search, clustering, and retrieval—an LLM generates the final text answer.',
    ],
    examKeywords: ['Token', 'Tokenization', 'Context window', 'Vector embeddings', 'Semantic search', 'Cosine similarity', 'Amazon Titan Embeddings'],
    howToRecognize:
      'When a prompt describes matching user queries by meaning/intent rather than exact keywords, select vector embeddings. When a prompt notes that a very long document exceeds single-call capacity or drives up per-token cost, look for context window limits and chunking + RAG.',
    keyTakeaway:
      'Tokens meter cost and context window capacity, while embeddings map semantic meaning into vectors for fast similarity retrieval.',
    knowledgeCheck: {
      question:
        'A support portal relies on exact keyword search, causing users searching for "unable to sign in" to miss articles titled "Account Login Troubleshooting." Which technology directly solves this issue?',
      options: [
        { id: 'a', text: 'Increase the LLM temperature parameter to 1.0' },
        { id: 'b', text: 'Convert articles and queries into vector embeddings for semantic search' },
        { id: 'c', text: 'Switch from TLS to unencrypted HTTP transport' },
        { id: 'd', text: 'Reduce the model context window size' },
      ],
      correctOptionId: 'b',
      explanation:
        'Vector embeddings encode semantic meaning so conceptually similar phrases ("unable to sign in" and "login troubleshooting") match even when exact words differ.',
    },
    relatedServiceIds: ['bedrock', 'kendra'],
  },
  {
    id: 'd2-l3',
    domainId: 'd2',
    taskStatement: '2.1',
    order: 3,
    title: 'Inference Parameters: Temperature, Top-p, Top-k & Max Tokens',
    difficulty: 'Medium',
    estimatedMinutes: 10,
    objectives: [
      'Explain how temperature, top-p (nucleus sampling), top-k, max tokens, and stop sequences control LLM output.',
      'Select optimal inference parameter settings for factual extraction vs. creative writing.',
    ],
    conceptExplanation:
      'During inference, an LLM predicts a probability distribution over possible next tokens. Inference parameters let developers tune how conservative or creative the token sampling process is, without changing the model weights.',
    whyItMatters:
      'Exam questions frequently present a scenario where an LLM gives overly random, inconsistent JSON or boring repetitive marketing copy—and ask which inference parameter to adjust.',
    detailedExplanation: [
      'Temperature (typically 0.0 to 1.0+) scales the probability distribution before sampling. At Temperature = 0 (or very low, like 0.1), the model strongly favors the highest-probability token, producing focused, factual, and repeatable responses—ideal for SQL generation, structured JSON extraction, summarization, and customer support Q&A. Higher temperatures (0.7–1.0) flatten the distribution, encouraging creative, varied prose—useful for brainstorming slogans or fiction—at the cost of higher hallucination risk.',
      'Top-p (nucleus sampling, 0.0 to 1.0) restricts sampling to the smallest set of top candidate tokens whose cumulative probability reaches p. For example, top-p = 0.9 considers only the tokens making up the top 90% of probability mass, trimming unlikely tail words while adapting dynamically to certainty.',
      'Top-k limits sampling strictly to the k most probable next tokens (e.g., top-k = 40). Lowering top-k prevents bizarre low-probability tokens.',
      'Max Tokens caps the maximum length of the generated response so answers don’t run excessively long or exceed budgets. Stop Sequences specify exact strings (like "###" or "</json>") that immediately halt generation when emitted.',
    ],
    realWorldExample:
      'An accounting team extracting invoice line items into strict JSON sets Temperature = 0.0 and uses a stop sequence at the closing brace so output stays uniform across 10,000 invoices. Meanwhile, a marketing copywriter generating 10 varied ad headlines sets Temperature = 0.8.',
    awsExample:
      'Every Amazon Bedrock Converse/InvokeModel API call exposes inferenceConfig fields for temperature, topP, maxTokens, and stopSequences—and Bedrock Prompt Management saves tuned parameter presets alongside prompt templates.',
    comparisonTable: {
      title: 'Inference Parameter Tuning Guide',
      headers: ['Parameter', 'Low Setting Effect', 'High Setting Effect'],
      rows: [
        { aspect: 'Temperature', left: 'Deterministic, factual, consistent (0.0–0.2)', right: 'Creative, diverse, less predictable (0.7–1.0)' },
        { aspect: 'Top-p (Nucleus)', left: 'Narrow high-confidence word pool (0.1–0.5)', right: 'Broader vocabulary variety (0.9–1.0)' },
        { aspect: 'Top-k', left: 'Strict fixed top-k choices (e.g., 5–10)', right: 'Wider token pool (e.g., 50–250)' },
        { aspect: 'Max Tokens', left: 'Short concise replies, lower latency', right: 'Long essays/reports, higher output cost' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Raising temperature improves factual accuracy. Reality: Raising temperature increases randomness and makes hallucinations more likely; factual tasks need low temperature.',
      'Misconception: Setting temperature and top-p both to extreme values is best practice. Reality: Adjust one primarily (usually temperature) while keeping the other at default.',
    ],
    examKeywords: ['Temperature', 'Top-p', 'Nucleus sampling', 'Top-k', 'Max tokens', 'Stop sequence', 'Deterministic'],
    howToRecognize:
      'Look for keywords like "consistent, repeatable, factual, strict format" -> Lower temperature (near 0). Look for "diverse, creative brainstorming, varied phrasing" -> Higher temperature. Look for "unexpectedly cut off or runaway long replies" -> Adjust max tokens / stop sequences.',
    keyTakeaway:
      'Use low temperature (0–0.2) for accuracy and structured tasks, higher temperature (0.7+) for creative variety, and max tokens/stop sequences to bound output length.',
    knowledgeCheck: {
      question:
        'A developer builds an Amazon Bedrock workflow that converts customer emails into structured JSON support tickets, but the model occasionally invents extra fields and varies formatting. Which inference adjustment is most appropriate?',
      options: [
        { id: 'a', text: 'Increase temperature to 0.95' },
        { id: 'b', text: 'Lower temperature close to 0' },
        { id: 'c', text: 'Increase top-k to 500' },
        { id: 'd', text: 'Remove system prompt instructions' },
      ],
      correctOptionId: 'b',
      explanation:
        'Lowering temperature near 0 concentrates probability on the highest-likelihood tokens, making formatting and structured JSON output much more deterministic and consistent.',
    },
    relatedServiceIds: ['bedrock'],
  },
  {
    id: 'd2-l4',
    domainId: 'd2',
    taskStatement: '2.2',
    order: 4,
    title: 'GenAI Capabilities, Hallucinations, Knowledge Cutoffs & Grounding',
    difficulty: 'Medium',
    estimatedMinutes: 12,
    objectives: [
      'Identify high-value GenAI business capabilities: summarization, translation, content/code generation, and synthetic data.',
      'Diagnose core FM limitations: hallucinations, knowledge cutoffs, non-determinism, and math/reasoning traps.',
      'Explain conceptually how RAG, fine-tuning, and grounding address different model limitations.',
    ],
    conceptExplanation:
      'Foundation Models excel at flexible language, reasoning, and creative synthesis, yet they suffer from structural limitations—most notably hallucinations (confident falsehoods) and static training knowledge cutoffs. Understanding what FMs do brilliantly versus where they fail is central to safe solution design.',
    whyItMatters:
      'A major portion of AIF-C01 tests your ability to identify why an LLM invented a fake policy or quoted outdated 2022 pricing—and whether prompt grounding, RAG, or fine-tuning fixes it.',
    detailedExplanation: [
      'Core GenAI business capabilities include: Summarization (condensing call transcripts, legal contracts, or long threads), Translation & Localization (adapting tone across languages), Content & Code Generation (drafting emails, SQL, unit tests, marketing assets), Multimodal Understanding (analyzing charts, receipts, or product photos), and Synthetic Data Generation (creating realistic privacy-safe test records when real data is scarce or restricted).',
      'Hallucinations happen because LLMs predict statistically plausible next tokens rather than querying a verified fact database. When asked about obscure topics or private internal policies, the model may fabricate citations, URLs, or facts confidently.',
      'Knowledge Cutoffs occur because an FM’s pre-trained weights freeze at the date training finished. Without external retrieval, a model cannot know today’s inventory levels, breaking news, or your company’s updated refund rules.',
      'Grounding anchors the model’s generation to verified source documents (typically via Retrieval-Augmented Generation, RAG) and instructs it to answer strictly from provided context—and say "I don’t know" when evidence is missing.',
      'Evaluating GenAI outputs is harder than evaluating classification accuracy because multiple valid phrasings exist. Teams combine automated metrics (ROUGE for summarization, BLEU for translation, BERTScore for semantic similarity), LLM-as-a-judge rubrics, and human review.',
    ],
    realWorldExample:
      'A travel chatbot told a customer that pets fly free on international routes because it extrapolated from general internet blog text. Grounding the bot via RAG against the airline’s official tariff PDFs—plus adding a Contextual Grounding check in Bedrock Guardrails—stopped fabricated policies.',
    awsExample:
      'Amazon Bedrock Knowledge Bases grounds responses in your Amazon S3 documents with source citations, while Amazon Bedrock Guardrails Contextual Grounding checks detect and block hallucinated claims unsupported by the retrieved source.',
    comparisonTable: {
      title: 'GenAI Limitations & Correct Mitigations',
      headers: ['Limitation', 'Root Cause', 'Primary Mitigation'],
      rows: [
        { aspect: 'Hallucinations', left: 'Probabilistic token prediction without fact check', right: 'RAG grounding + low temperature + Guardrails grounding check' },
        { aspect: 'Outdated knowledge', left: 'Static pre-training cutoff date', right: 'RAG with live/updated Knowledge Base or tool APIs' },
        { aspect: 'Missing private domain facts', left: 'Model never saw internal company docs', right: 'RAG (facts) or Continued Pre-training (deep jargon)' },
        { aspect: 'Wrong tone / output format', left: 'Generic pre-training style', right: 'Few-shot prompt examples or Fine-tuning' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Fine-tuning eliminates hallucinations and updates daily facts. Reality: Fine-tuning teaches style/task behavior, not reliable live fact lookup; RAG is far better for dynamic facts and citations.',
      'Misconception: Synthetic data is always fake junk. Reality: Carefully generated synthetic data helps augment rare edge cases and protect real user PII during model testing.',
    ],
    examKeywords: ['Hallucination', 'Knowledge cutoff', 'Grounding', 'Synthetic data', 'Summarization', 'RAG vs fine-tuning', 'Contextual grounding'],
    howToRecognize:
      'If a model invents nonexistent policies, citations, or facts -> Hallucination -> Grounding / RAG / Contextual Grounding check. If a model gives outdated answers or lacks internal company docs -> Knowledge cutoff -> RAG.',
    keyTakeaway:
      'FMs predict plausible language rather than verified truth; pair low temperature with RAG grounding and guardrail checks whenever factual accuracy matters.',
    knowledgeCheck: {
      question:
        'An internal HR assistant built on a pre-trained LLM gives confident but inaccurate answers about newly updated company parental leave rules from last month. What is the root limitation and best fix?',
      options: [
        { id: 'a', text: 'Overfitting; fix by increasing temperature' },
        { id: 'b', text: 'Knowledge cutoff & hallucination; fix by grounding responses with RAG over updated HR documents' },
        { id: 'c', text: 'Underfitting; fix by switching to unsupervised clustering' },
        { id: 'd', text: 'Tokenization error; fix by removing system prompts' },
      ],
      correctOptionId: 'b',
      explanation:
        'Pre-trained LLMs lack private, recently updated company policies (knowledge cutoff) and guess plausible answers (hallucination). RAG grounds generation in the latest HR documents.',
    },
    relatedServiceIds: ['bedrock', 'q-business'],
  },
  {
    id: 'd2-l5',
    domainId: 'd2',
    taskStatement: '2.3',
    order: 5,
    title: 'AWS GenAI Stack & Purpose-Built Silicon (Bedrock, SageMaker, Q, Trainium & Inferentia)',
    difficulty: 'Easy',
    estimatedMinutes: 11,
    objectives: [
      'Map the three layers of the AWS Generative AI stack (Applications, Managed FM Tools, Infrastructure).',
      'Distinguish Amazon Q, Amazon Bedrock, and Amazon SageMaker AI by builder control vs. operational overhead.',
      'Differentiate AWS Trainium and AWS Inferentia purpose-built AI chips.',
    ],
    conceptExplanation:
      'AWS organizes generative AI capabilities into a three-layer stack so teams can choose the exact balance of speed-to-market versus deep customization. At the infrastructure layer, AWS designs specialized silicon—AWS Trainium and AWS Inferentia—to slash cost and energy consumption for large models.',
    whyItMatters:
      'Exam questions love testing which AWS layer fits a team’s skills and constraints: "zero ML expertise, turnkey assistant" vs. "API access to multiple FMs with no server management" vs. "full control over custom training clusters."',
    detailedExplanation: [
      'Top Layer (Applications): Amazon Q Business is a turnkey generative AI assistant that connects to enterprise data sources (S3, SharePoint, Jira, Slack) with built-in permission enforcement—no model hosting or custom code required. Amazon Q Developer assists engineers inside IDEs and the AWS Console.',
      'Middle Layer (Managed FM Platform): Amazon Bedrock gives developers a single serverless API to access top Foundation Models (Amazon Nova, Claude, Llama, Mistral, Titan), build Knowledge Bases (RAG), orchestrate Agents, fine-tune privately, and enforce Guardrails—without managing servers or GPUs.',
      'Bottom / Builder Layer (Custom ML & Infrastructure): Amazon SageMaker AI (including SageMaker JumpStart) gives ML engineers full control over custom training scripts, open-weight model hosting on dedicated instances, distributed training, and MLOps pipelines.',
      'Purpose-Built AWS Silicon: AWS Trainium (Trn1/Trn2 EC2 instances) is purpose-built for high-performance, cost-effective deep learning TRAINING of large foundation models. AWS Inferentia (Inf1/Inf2 EC2 instances) is purpose-built for low-latency, low-cost deep learning INFERENCE at scale.',
    ],
    realWorldExample:
      'A non-technical legal firm deploys Amazon Q Business in two days so employees can search internal contracts. Meanwhile, their software product team uses Amazon Bedrock to embed AI summarization into their customer-facing SaaS portal, and an AI research startup trains a proprietary genomics model on EC2 Trn1 instances powered by AWS Trainium.',
    awsExample:
      'Choosing between Trainium and Inferentia is straightforward: training a 70B model across hundreds of billions of tokens uses AWS Trainium; serving millions of daily inference predictions on that model uses AWS Inferentia.',
    comparisonTable: {
      title: 'AWS GenAI Stack & AI Silicon Quick Reference',
      headers: ['Offering', 'Stack Layer', 'Ideal Scenario'],
      rows: [
        { aspect: 'Amazon Q Business / Developer', left: 'Ready-to-use Application', right: 'Turnkey enterprise Q&A or coding assistant, minimal setup' },
        { aspect: 'Amazon Bedrock', left: 'Serverless FM Platform', right: 'Build custom GenAI apps via API without managing GPUs' },
        { aspect: 'Amazon SageMaker AI', left: 'Full-Control ML Platform', right: 'Custom algorithms, open-source model hosting, deep MLOps' },
        { aspect: 'AWS Trainium / Inferentia', left: 'Custom AI Hardware', right: 'Trainium = Model Training; Inferentia = Model Inference' },
      ],
    },
    commonMisconceptions: [
      'Misconception: You need Amazon SageMaker AI just to call Claude or Llama via API. Reality: Amazon Bedrock provides serverless API access with zero infrastructure management.',
      'Misconception: AWS Inferentia is used to pre-train LLMs from scratch. Reality: Inferentia is optimized strictly for inference; Trainium is optimized for training.',
    ],
    examKeywords: ['Amazon Bedrock', 'Amazon Q', 'Amazon SageMaker AI', 'AWS Trainium', 'AWS Inferentia', 'Minimal operational overhead', 'Turnkey'],
    howToRecognize:
      'Look at operational constraints: "ready-made assistant for employees / IDE coding" -> Amazon Q; "build custom app with serverless FM APIs and minimal ops" -> Amazon Bedrock; "full control over infrastructure/training containers" -> SageMaker AI; "lower training cost" -> Trainium; "lower inference cost" -> Inferentia.',
    keyTakeaway:
      'Match operational effort to the stack layer—Amazon Q (turnkey), Amazon Bedrock (serverless builder API), SageMaker AI (full ML control)—and pair Trainium with training, Inferentia with inference.',
    knowledgeCheck: {
      question:
        'An AI startup is deploying a custom open-weights LLM on Amazon EC2 and wants to minimize the compute cost per prediction while maintaining low latency during high-volume traffic. Which AWS chip family is specifically designed for this workload?',
      options: [
        { id: 'a', text: 'AWS Trainium' },
        { id: 'b', text: 'AWS Inferentia' },
        { id: 'c', text: 'Amazon S3 Glacier' },
        { id: 'd', text: 'AWS Glue' },
      ],
      correctOptionId: 'b',
      explanation:
        'AWS Inferentia (available on EC2 Inf1/Inf2 instances) is purpose-built to deliver high-throughput, low-latency, cost-effective ML inference. AWS Trainium is designed for training.',
    },
    relatedServiceIds: ['bedrock', 'q-business', 'sagemaker-ai'],
  },
];
