import { AwsServiceGuide, ServiceComparison } from '../types';

export const AWS_SERVICES_GUIDE: AwsServiceGuide[] = [
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    category: 'Generative AI',
    priority: 'Core Exam Priority',
    domains: ['d2', 'd3', 'd4', 'd5'],
    whatItDoes:
      'A fully managed, serverless service offering unified API access to high-performing Foundation Models (Amazon Nova, Anthropic Claude, Meta Llama, Mistral, Cohere, Stability AI) alongside built-in Knowledge Bases (RAG), Agents, Guardrails, Prompt Management, and Model Evaluation.',
    primaryPurpose:
      'Build and scale generative AI applications rapidly without provisioning, patching, or managing GPU servers.',
    problemItSolves:
      'Eliminates the operational burden and steep cost of hosting large LLMs/diffusion models while providing enterprise privacy, model choice, RAG grounding, and safety guardrails.',
    typicalUseCases: [
      'Document summarization, drafting, and structured extraction',
      'Grounded enterprise Q&A chatbots using Knowledge Bases (RAG)',
      'Multi-step workflow automation via Bedrock Agents + AWS Lambda',
      'Private fine-tuning and continued pre-training on S3 datasets',
    ],
    inputHandled: 'Text prompts, chat histories, images/documents (multimodal FMs), S3 document corpora (Knowledge Bases).',
    outputProduced: 'Generated text, JSON, code, embeddings, images, grounded answers with citations, or Agent tool invocations.',
    whenToChoose: [
      'You want serverless API access to multiple leading FMs with minimal operational overhead.',
      'You need built-in RAG (Knowledge Bases), Agents, or unified safety Guardrails.',
      'Strict data privacy is required (prompts are never used to train base models).',
    ],
    whenNotToChoose: [
      'You need full control over custom PyTorch training loops, custom ML architectures, or tabular XGBoost (choose Amazon SageMaker AI).',
      'You want a zero-code, turnkey internal employee chatbot out of the box (choose Amazon Q Business).',
    ],
    keyDifferences:
      'Unlike Amazon SageMaker AI (where you configure instances/containers and manage endpoints), Bedrock is completely serverless for Foundation Models and bundles Knowledge Bases, Agents, and Guardrails natively.',
    examClues: ['Serverless FM API', 'Minimal operational overhead', 'Knowledge Bases', 'Guardrails', 'Agents', 'Multiple foundation models', 'Provisioned Throughput'],
    realisticScenario:
      'A software team wants to summarize legal contracts and answer employee policy questions from S3 PDFs with citations in two weeks without managing GPU infrastructure -> Amazon Bedrock + Knowledge Bases.',
    memoryAid: 'Bedrock = Serverless Foundation Model workshop (Models + Knowledge Bases + Agents + Guardrails).',
  },
  {
    id: 'sagemaker-ai',
    name: 'Amazon SageMaker AI',
    category: 'Managed ML',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd2', 'd3', 'd4', 'd5'],
    whatItDoes:
      'An end-to-end managed machine learning platform for building, training, tuning, deploying, and monitoring custom ML and deep learning models—including SageMaker Studio, Data Wrangler, Ground Truth, JumpStart, Clarify, Model Monitor, and Model Cards.',
    primaryPurpose:
      'Give data scientists and ML engineers complete control over the custom ML lifecycle from data preparation to production MLOps.',
    problemItSolves:
      'Removes manual cluster setup while still letting teams bring custom algorithms, open-source Hugging Face/JumpStart models, distributed training, and specialized inference endpoints.',
    typicalUseCases: [
      'Training custom fraud detection, churn prediction, or demand regression models on tabular data',
      'No-code tabular ML prototyping via SageMaker Canvas or AutoML via Autopilot',
      'Bias detection and SHAP explainability via SageMaker Clarify',
      'Hosting custom or open-weights models with Real-Time, Serverless, Async, or Batch Transform endpoints',
    ],
    inputHandled: 'Tabular CSV/Parquet, images, audio, text, custom training containers, and Python notebooks.',
    outputProduced: 'Trained custom model artifacts, predictions (real-time or batch), Clarify bias/SHAP reports, Model Cards.',
    whenToChoose: [
      'You are building custom predictive ML (classification, regression, clustering) on proprietary datasets.',
      'You need full control over training scripts, hyperparameters, GPU instance types, or MLOps CI/CD pipelines.',
      'You need bias/explainability audits (Clarify), data labeling (Ground Truth), or Batch Transform scoring.',
    ],
    whenNotToChoose: [
      'A pre-trained turnkey AWS AI API already solves the problem (e.g., use Textract for invoice OCR or Transcribe for speech-to-text).',
      'You simply want serverless API calls to commercial Foundation Models without managing instances (choose Amazon Bedrock).',
    ],
    keyDifferences:
      'SageMaker AI gives deep customization and infrastructure control for custom ML and self-hosted models; Bedrock provides serverless FM APIs; purpose-built AI services (Rekognition, Comprehend, Textract) need zero ML building.',
    examClues: ['Custom ML model', 'Full control', 'SageMaker Clarify', 'Model Monitor', 'Ground Truth', 'JumpStart', 'Canvas', 'Batch Transform'],
    realisticScenario:
      'A bank’s data science team must train a custom XGBoost credit-risk model on proprietary tabular history, audit it for demographic bias with SHAP reports, and monitor production drift -> Amazon SageMaker AI + Clarify + Model Monitor.',
    memoryAid: 'SageMaker AI = Full custom ML workbench (Build, Train, Clarify, Deploy, Monitor).',
  },
  {
    id: 'q-business',
    name: 'Amazon Q (Q Business & Q Developer)',
    category: 'Generative AI',
    priority: 'Core Exam Priority',
    domains: ['d2', 'd3', 'd5'],
    whatItDoes:
      'A turnkey generative AI-powered assistant suite. Amazon Q Business connects to 40+ enterprise repositories (S3, SharePoint, Salesforce, Jira, Slack) with ACL permission awareness for instant employee Q&A and task automation. Amazon Q Developer assists builders with code generation, debugging, AWS architecture advice, and security scanning.',
    primaryPurpose:
      'Deliver immediate, ready-to-use generative AI productivity for employees and developers without building an app from scratch.',
    problemItSolves:
      'Eliminates months of custom RAG engineering, connector maintenance, and identity-permission plumbing for internal workplace assistants.',
    typicalUseCases: [
      'Internal employee knowledge search honoring existing user access permissions (ACLs)',
      'Summarizing HR, IT, or sales documents across SharePoint, Confluence, and S3',
      'Developer code generation, refactoring, and AWS Console troubleshooting (Q Developer)',
    ],
    inputHandled: 'Natural language employee questions, enterprise connectors, IDE source code, AWS Console context.',
    outputProduced: 'Permission-filtered answers with source citations, summaries, generated code, or workflow actions (Q Apps).',
    whenToChoose: [
      'You want an out-of-the-box workplace assistant connected to enterprise tools with minimal engineering.',
      'Answers must strictly respect existing document permissions (user A only sees documents user A can access).',
      'Developers need AI coding and AWS troubleshooting assistance.',
    ],
    whenNotToChoose: [
      'You are building a custom customer-facing SaaS product or bespoke UX needing fine-grained prompt/model control (choose Amazon Bedrock).',
    ],
    keyDifferences:
      'Amazon Q is a finished SaaS-like assistant product; Amazon Bedrock is a developer platform/API for building your own GenAI applications.',
    examClues: ['Turnkey enterprise assistant', 'No-code / out-of-the-box', 'Respects user permissions/ACLs', '40+ connectors', 'IDE coding assistant'],
    realisticScenario:
      'An enterprise wants employees to query Confluence, Jira, and S3 policies via chat within days while ensuring interns cannot read executive folders -> Amazon Q Business.',
    memoryAid: 'Amazon Q = Quick turnkey AI coworker (Q Business for workplace docs; Q Developer for code & AWS).',
  },
  {
    id: 'rekognition',
    name: 'Amazon Rekognition',
    category: 'Vision & Document',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd3', 'd4'],
    whatItDoes:
      'A pre-trained computer vision API that detects objects, scenes, activities, celebrities, inappropriate/unsafe content, PPE, and faces in images and videos—plus Custom Labels for specialized visual inspection.',
    primaryPurpose:
      'Add automated image and video analysis without training deep computer vision models from scratch.',
    problemItSolves:
      'Replaces expensive manual image moderation, visual tagging, and custom CNN training for common vision tasks.',
    typicalUseCases: [
      'Moderating user-uploaded photos and videos for explicit or violent content',
      'Detecting faces, comparing identities, or verifying workplace safety gear (hard hats/vests)',
      'Custom defect detection on manufacturing lines (Rekognition Custom Labels)',
    ],
    inputHandled: 'Images (JPEG, PNG) and videos (MP4, MOV, AVI) from bytes or Amazon S3.',
    outputProduced: 'JSON bounding boxes, labels, confidence scores, moderation flags, and facial match metrics.',
    whenToChoose: [
      'You need visual object, scene, face, or unsafe-content detection in photos or video.',
      'You need lightweight custom visual classification (Custom Labels) with minimal ML setup.',
    ],
    whenNotToChoose: [
      'You need structured table, key-value form, and multi-page document extraction (choose Amazon Textract).',
      'You want rich open-ended natural language reasoning or creative descriptions about complex diagrams/charts (consider a multimodal FM in Amazon Bedrock).',
    ],
    keyDifferences:
      'Rekognition specializes in visual objects, faces, scenes, and moderation in images/videos; Textract specializes in extracting structured text, forms, and tables from documents.',
    examClues: ['Image/video moderation', 'Object & face detection', 'PPE detection', 'Custom Labels', 'Visual bounding boxes'],
    realisticScenario:
      'A social marketplace wants to automatically block inappropriate user profile images and verify seller identity selfies -> Amazon Rekognition.',
    memoryAid: 'Rekognition = Eyes for images & videos (Objects, Faces, Moderation, Video).',
  },
  {
    id: 'textract',
    name: 'Amazon Textract',
    category: 'Vision & Document',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd3', 'd5'],
    whatItDoes:
      'A managed intelligent document processing (IDP) service that goes far beyond basic OCR to extract printed text, handwriting, key-value form fields, checkboxes, and structured tables from scanned PDFs and images.',
    primaryPurpose:
      'Turn scanned paper forms, invoices, receipts, and IDs into clean structured JSON data automatically.',
    problemItSolves:
      'Traditional OCR dumps flat unformatted text that breaks table rows and form-field pairings; Textract preserves layout relationships.',
    typicalUseCases: [
      'Extracting line-item tables and totals from supplier invoices and receipts',
      'Digitizing handwritten medical intake forms, tax forms (W-2/1040), and loan applications',
      'Pairing with Amazon A2I for human verification of low-confidence extracted fields',
    ],
    inputHandled: 'Scanned documents, PDFs, PNG/JPEG/TIFF images (including handwriting and multi-column layouts).',
    outputProduced: 'Structured JSON with text blocks, table rows/columns, form key-value pairs, signatures, and per-field confidence scores.',
    whenToChoose: [
      'The source is scanned documents, PDFs, tax forms, receipts, or tables.',
      'You need structured key-value pairs or table cells preserved.',
    ],
    whenNotToChoose: [
      'You are analyzing photographs of physical objects, street scenes, or faces (choose Amazon Rekognition).',
      'You already have plain text and want sentiment, PII, or topic classification (choose Amazon Comprehend).',
    ],
    keyDifferences:
      'Textract extracts text/forms/tables from documents; Rekognition analyzes general scenes/faces/objects; Comprehend understands the linguistic meaning of extracted text.',
    examClues: ['Scanned forms', 'Invoices & receipts', 'Key-value pairs', 'Tables & handwriting', 'Beyond basic OCR'],
    realisticScenario:
      'An accounts-payable pipeline receives thousands of PDF vendor invoices and needs line items and tax totals extracted into JSON -> Amazon Textract.',
    memoryAid: 'Textract = Document & Form Extractor (Text + Tables + Key-Value Forms).',
  },
  {
    id: 'comprehend',
    name: 'Amazon Comprehend',
    category: 'Language & Speech',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd3', 'd4', 'd5'],
    whatItDoes:
      'A managed Natural Language Processing (NLP) service that extracts insights from text—including sentiment analysis, key phrases, named entities, language detection, topic modeling, custom classification, and PII detection/redaction (plus Comprehend Medical for healthcare text).',
    primaryPurpose:
      'Analyze and classify unstructured text at scale using purpose-built, predictable NLP models.',
    problemItSolves:
      'Saves teams from building custom NLP pipelines for high-volume sentiment scoring, ticket routing, or PII redaction.',
    typicalUseCases: [
      'Scoring customer reviews and support emails as Positive, Negative, Neutral, or Mixed',
      'Detecting and redacting PII (SSNs, addresses, bank numbers) from text streams',
      'Extracting entities (companies, dates, brands) and routing support tickets via custom classifiers',
    ],
    inputHandled: 'Plain UTF-8 text strings or document files (often paired after Textract or Transcribe).',
    outputProduced: 'Structured JSON containing sentiment scores, entity tags, PII offsets/redacted text, and classification confidence.',
    whenToChoose: [
      'You need deterministic, fast, low-cost NLP tasks: sentiment, entity extraction, language detection, or PII redaction.',
      'You do NOT need open-ended creative text generation.',
    ],
    whenNotToChoose: [
      'You need a conversational multi-turn chatbot or voice bot (choose Amazon Lex or Bedrock).',
      'You need generative summarization, rewriting, or complex reasoning across documents (choose Amazon Bedrock).',
    ],
    keyDifferences:
      'Comprehend analyzes and tags existing text (predictive NLP); Lex handles conversational dialog flows; Bedrock generates new text and complex synthesis.',
    examClues: ['Sentiment analysis', 'Entity extraction', 'PII redaction in text', 'Topic modeling', 'Custom document classification', 'Comprehend Medical'],
    realisticScenario:
      'A retail brand wants to classify 500,000 daily product reviews by sentiment, detect language, and mask customer phone numbers before archiving -> Amazon Comprehend.',
    memoryAid: 'Comprehend = Comprehends text (Sentiment, Entities, PII, Topics).',
  },
  {
    id: 'lex',
    name: 'Amazon Lex',
    category: 'Language & Speech',
    priority: 'Important Supporting',
    domains: ['d1', 'd3'],
    whatItDoes:
      'A managed service for building conversational voice and text interfaces (chatbots and IVR phone bots) using automatic speech recognition (ASR) and natural language understanding (NLU) built around Intents, Utterances, and Slots.',
    primaryPurpose:
      'Automate structured multi-turn customer conversations—like booking appointments, checking order status, or resetting passwords—with seamless Amazon Connect integration.',
    problemItSolves:
      'Handles intent recognition, slot-filling follow-up questions, and voice-to-intent routing without building dialog state machines from scratch.',
    typicalUseCases: [
      'Call-center interactive voice response (IVR) bots in Amazon Connect',
      'Self-service banking, airline booking, or appointment scheduling chatbots',
      'Hybrid bots combining Lex structured slots with Bedrock Q&A fallbacks',
    ],
    inputHandled: 'User spoken audio or chat text.',
    outputProduced: 'Recognized Intent, extracted Slots, dialog prompts, and Lambda fulfillment calls.',
    whenToChoose: [
      'You need a transactional voice/text chatbot centered on structured intents and slot collection (e.g., "Book a flight to Boston on Friday").',
    ],
    whenNotToChoose: [
      'You only want to analyze static review sentiment or entities (choose Amazon Comprehend).',
      'You only need audio transcription without conversational interaction (choose Amazon Transcribe).',
    ],
    keyDifferences:
      'Lex is a two-way conversational bot engine (Intents + Slots); Comprehend analyzes static text; Transcribe only converts audio to text.',
    examClues: ['Conversational bot', 'Intents and slots', 'Call center IVR', 'Amazon Connect', 'Voice and text chatbot'],
    realisticScenario:
      'An insurance company wants callers to state their claim number and incident date over the phone to check claim status automatically before reaching an agent -> Amazon Lex + Amazon Connect.',
    memoryAid: 'Lex = Interactive Chatbot & Voice Bot (Intents, Utterances, Slots).',
  },
  {
    id: 'transcribe',
    name: 'Amazon Transcribe',
    category: 'Language & Speech',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd3', 'd5'],
    whatItDoes:
      'An automatic speech recognition (ASR) service that converts spoken audio and video soundtracks into accurate, punctuated text transcripts—supporting speaker diarization, custom vocabularies, PII redaction, and Call Analytics.',
    primaryPurpose:
      'Turn recordings or live audio streams into searchable, analyzable text.',
    problemItSolves:
      'Unlocks audio/video archives (call centers, meetings, broadcasts) for search, compliance, subtitles, and downstream NLP/LLM summarization.',
    typicalUseCases: [
      'Transcribing customer support calls with speaker separation and PII masking',
      'Generating searchable captions for recorded lectures or webinars',
      'Converting medical dictation (Transcribe Medical) into EHR notes',
    ],
    inputHandled: 'Streaming audio or stored audio/video files (MP3, WAV, FLAC, MP4) in S3.',
    outputProduced: 'Timestamped JSON transcripts with speaker labels, word confidence scores, and optional subtitles (SRT/VTT).',
    whenToChoose: [
      'You need Speech-to-Text (audio -> text).',
    ],
    whenNotToChoose: [
      'You need Text-to-Speech (choose Amazon Polly).',
      'You need multi-turn conversational dialog handling (choose Amazon Lex).',
    ],
    keyDifferences:
      'Transcribe converts Speech -> Text; Polly converts Text -> Speech.',
    examClues: ['Speech-to-text', 'ASR', 'Call center recordings', 'Speaker diarization', 'Captions/subtitles', 'Audio to text'],
    realisticScenario:
      'A contact center records thousands of calls daily and needs text transcripts with customer/agent separation and masked credit card numbers before summarizing calls with Bedrock -> Amazon Transcribe -> Amazon Bedrock.',
    memoryAid: 'Transcribe = Scribe writes down what it hears (Speech -> Text).',
  },
  {
    id: 'polly',
    name: 'Amazon Polly',
    category: 'Language & Speech',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd2', 'd3'],
    whatItDoes:
      'A text-to-speech (TTS) service that synthesizes lifelike human speech from plain text or SSML across dozens of languages and Neural/Generative voices.',
    primaryPurpose:
      'Give applications a natural spoken voice for accessibility, audio content, and automated announcements.',
    problemItSolves:
      'Avoids hiring voice actors for dynamic or frequently updated spoken audio.',
    typicalUseCases: [
      'Reading news articles, e-learning lessons, or books aloud for accessibility',
      'Generating dynamic voice responses in IVR systems and navigation apps',
      'Controlling pronunciation, pauses, and emphasis using SSML tags',
    ],
    inputHandled: 'Plain text or Speech Synthesis Markup Language (SSML).',
    outputProduced: 'Streaming or downloadable audio files (MP3, OGG, PCM).',
    whenToChoose: [
      'You need Text-to-Speech (text -> lifelike spoken audio).',
    ],
    whenNotToChoose: [
      'You need Speech-to-Text transcription (choose Amazon Transcribe).',
    ],
    keyDifferences:
      'Polly speaks text aloud (Text -> Speech); Transcribe listens and writes transcripts (Speech -> Text).',
    examClues: ['Text-to-speech', 'TTS', 'Lifelike voice', 'SSML', 'Audio narration', 'Accessibility read-aloud'],
    realisticScenario:
      'An online news publisher wants every article to feature an instant "Listen to this article" audio player in natural neural voices -> Amazon Polly.',
    memoryAid: 'Polly = "Polly wants a cracker" -> Parrot SPEAKS aloud (Text -> Speech).',
  },
  {
    id: 'translate',
    name: 'Amazon Translate',
    category: 'Language & Speech',
    priority: 'Important Supporting',
    domains: ['d1', 'd2', 'd3'],
    whatItDoes:
      'A fast, scalable neural machine translation service translating text and documents across 75+ languages—supporting custom terminology glossaries and automatic source language detection.',
    primaryPurpose:
      'Localize websites, support chats, product catalogs, and user-generated content quickly at low cost.',
    problemItSolves:
      'Enables real-time multilingual communication without manual translation delays or heavy LLM token costs for straightforward translation.',
    typicalUseCases: [
      'Real-time translation of global customer support chat messages',
      'Batch translation of e-commerce product descriptions while preserving brand terms via Custom Terminology',
    ],
    inputHandled: 'Plain text, HTML, or batch documents in S3.',
    outputProduced: 'Translated text in target language(s).',
    whenToChoose: [
      'High-volume, low-cost, dedicated language translation (especially with Custom Terminology brand protection).',
    ],
    whenNotToChoose: [
      'You need transcreation with complex stylistic rewriting or multi-step summarization alongside translation (Amazon Bedrock FM may fit better).',
    ],
    keyDifferences:
      'Amazon Translate is purpose-built for fast neural translation; Amazon Comprehend detects languages/sentiment; Amazon Bedrock handles broader creative rewriting.',
    examClues: ['Neural machine translation', '75+ languages', 'Custom terminology', 'Multilingual localization'],
    realisticScenario:
      'An international help desk lets Spanish-speaking customers chat seamlessly with English-speaking agents in real time -> Amazon Translate.',
    memoryAid: 'Translate = Language-to-language converter.',
  },
  {
    id: 'personalize',
    name: 'Amazon Personalize',
    category: 'Personalization & Search',
    priority: 'Important Supporting',
    domains: ['d1', 'd3'],
    whatItDoes:
      'A managed machine learning service for building real-time personalized item recommendations, user segmentation, and re-ranked search results based on user interaction history and item metadata.',
    primaryPurpose:
      'Deliver Amazon.com-style individualized recommendations without building complex collaborative filtering or deep ranking pipelines.',
    problemItSolves:
      'Solves cold-start items, real-time clickstream adaptation, and dynamic ranking at scale.',
    typicalUseCases: [
      '"Customers who viewed this also bought" e-commerce product carousels',
      'Personalized video/article feeds and targeted promotional email rankings',
    ],
    inputHandled: 'User-item interaction events (clicks, purchases, views), item metadata, user profiles.',
    outputProduced: 'Ranked list of recommended item IDs or personalized user segments.',
    whenToChoose: [
      'You need real-time product, media, or content recommendations tailored to individual user behavior.',
    ],
    whenNotToChoose: [
      'You are predicting numeric sales totals over future months (choose time-series forecasting / SageMaker).',
    ],
    keyDifferences:
      'Personalize ranks items for specific users; Kendra/OpenSearch finds relevant knowledge documents for a search query.',
    examClues: ['Recommendations', 'User-item interactions', 'Clickstream', 'Cold-start items', 'Personalized ranking'],
    realisticScenario:
      'An online bookstore wants its homepage to dynamically recommend titles to each visitor based on recent browsing clicks -> Amazon Personalize.',
    memoryAid: 'Personalize = Personalized "Recommended for You" carousels.',
  },
  {
    id: 'kendra',
    name: 'Amazon Kendra',
    category: 'Personalization & Search',
    priority: 'Important Supporting',
    domains: ['d3'],
    whatItDoes:
      'An intelligent enterprise search service powered by natural language understanding that indexes unstructured documents across connectors and can serve as a managed retriever for RAG pipelines.',
    primaryPurpose:
      'Provide high-precision enterprise semantic search with document ACLs and connectors out of the box.',
    problemItSolves:
      'Replaces brittle keyword enterprise search engines with NLU-powered passage retrieval.',
    typicalUseCases: [
      'Enterprise search portal across SharePoint, S3, and Confluence',
      'Enterprise RAG retriever integrated with Amazon Bedrock Knowledge Bases',
    ],
    inputHandled: 'Natural language search queries and enterprise document repositories.',
    outputProduced: 'Ranked document excerpts, FAQ matches, and suggested answers.',
    whenToChoose: [
      'You need managed enterprise search across diverse connectors with built-in document access controls.',
    ],
    whenNotToChoose: [
      'You simply need a lightweight custom vector index for S3 chunks inside Bedrock (OpenSearch Serverless is the default vector store).',
    ],
    keyDifferences:
      'Kendra is a full managed intelligent search service with connectors; OpenSearch Serverless is a vector/search database.',
    examClues: ['Intelligent enterprise search', 'Built-in connectors', 'Document ACLs', 'Managed RAG retriever'],
    realisticScenario:
      'A global manufacturer wants employees to search engineering manuals across multiple SharePoint sites using natural questions -> Amazon Kendra.',
    memoryAid: 'Kendra = Knowledge Enterprise Search Engine.',
  },
  {
    id: 'forecast',
    name: 'Amazon Forecast (Historical Context & SageMaker Canvas)',
    category: 'Managed ML',
    priority: 'Supplementary',
    domains: ['d1'],
    whatItDoes:
      'Time-series forecasting technology using statistical and deep learning algorithms to predict future demand, inventory, staffing, and financial metrics. Note: For new workloads, AWS emphasizes Amazon SageMaker Canvas / SageMaker AI time-series capabilities (DeepAR+, Chronos) as Amazon Forecast transitioned away from new customer onboarding.',
    primaryPurpose:
      'Predict future sequential numeric values from historical timestamps and related factors like holidays or promotions.',
    problemItSolves:
      'Outperforms simple spreadsheet moving averages on complex seasonal or multi-item demand series.',
    typicalUseCases: [
      'Retail inventory and SKU demand forecasting',
      'Cloud capacity, energy load, and call-center staffing predictions',
    ],
    inputHandled: 'Historical timestamped target series plus related metadata (price, holidays).',
    outputProduced: 'Probabilistic future forecasts (P10, P50, P90 quantiles).',
    whenToChoose: [
      'Exam scenarios testing time-series forecasting use cases (prefer SageMaker Canvas / SageMaker AI built-in DeepAR when newer managed options appear alongside legacy Forecast mentions).',
    ],
    whenNotToChoose: [
      'Predicting static non-sequential values (use regression) or categories (use classification).',
    ],
    keyDifferences:
      'Time-series forecasting explicitly models chronological sequences, trend, and seasonality.',
    examClues: ['Time-series forecasting', 'Future demand', 'Seasonality', 'Quantile predictions (P10/P50/P90)'],
    realisticScenario:
      'A grocery chain forecasts regional SKU demand for the next 14 days incorporating historical sales and holiday calendars -> Time-series forecasting in SageMaker AI / Canvas (or Amazon Forecast in legacy guides).',
    memoryAid: 'Forecasting = Future numbers on a timeline.',
  },
  {
    id: 'glue',
    name: 'AWS Glue (and Glue DataBrew)',
    category: 'Data, Security & Governance',
    priority: 'Important Supporting',
    domains: ['d1', 'd5'],
    whatItDoes:
      'A serverless data integration (ETL) service—with AWS Glue DataBrew offering visual no-code data preparation—to discover, clean, normalize, deduplicate, and transform datasets stored in Amazon S3 before ML training or RAG indexing.',
    primaryPurpose:
      'Automate scalable data preparation and schema cataloging for analytics and AI/ML pipelines.',
    problemItSolves:
      'Eliminates brittle manual scripts when cleaning messy CSV/JSON/Parquet data lakes at scale.',
    typicalUseCases: [
      'Cleaning missing values, standardizing formats, and PII masking in DataBrew before SageMaker training',
      'Serverless Spark ETL pipelines transforming raw logs into ML-ready Parquet tables',
    ],
    inputHandled: 'Raw structured/semi-structured data in S3, RDS, DynamoDB, or Redshift.',
    outputProduced: 'Clean, transformed datasets in S3 and metadata tables in the Glue Data Catalog.',
    whenToChoose: [
      'You need serverless ETL or visual no-code data cleaning before feeding data into ML or analytics.',
    ],
    whenNotToChoose: [
      'You are performing model training or live inference (choose SageMaker AI or Bedrock).',
    ],
    keyDifferences:
      'Glue prepares and transforms data at lake scale; SageMaker Data Wrangler specializes in interactive ML feature engineering inside SageMaker Studio.',
    examClues: ['Serverless ETL', 'Data preparation', 'DataBrew no-code cleaning', 'Data Catalog', 'Transform raw S3 data'],
    realisticScenario:
      'Data engineers need to clean, deduplicate, and convert 5 TB of raw JSON logs in S3 into clean Parquet files before training an ML model -> AWS Glue.',
    memoryAid: 'Glue = Glues and cleans raw data pipelines before ML.',
  },
  {
    id: 's3',
    name: 'Amazon S3',
    category: 'Data, Security & Governance',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd3', 'd5'],
    whatItDoes:
      'Highly durable object storage forming the foundational data lake for AI/ML training datasets, RAG source documents, model artifacts, batch inference inputs/outputs, and Bedrock invocation audit logs.',
    primaryPurpose:
      'Store virtually unlimited structured and unstructured AI data securely with fine-grained access control and KMS encryption.',
    problemItSolves:
      'Acts as the universal decoupled storage layer shared by Bedrock Knowledge Bases, SageMaker training, Textract, Macie, and Glue.',
    typicalUseCases: [
      'Storing Knowledge Base PDFs/docs for Amazon Bedrock RAG sync',
      'Hosting SageMaker training/validation datasets and Batch Transform inputs',
      'Archiving CloudTrail and Bedrock Model Invocation logs with lifecycle retention',
    ],
    inputHandled: 'Any file type (CSV, Parquet, JSONL, PDF, MP3, MP4, images, model weights).',
    outputProduced: 'Encrypted object storage accessed via IAM, bucket policies, and S3 endpoints.',
    whenToChoose: [
      'Almost every AWS AI data storage, RAG document repository, or batch input/output pipeline.',
    ],
    whenNotToChoose: [
      'You need a real-time vector similarity database (use OpenSearch Serverless or Aurora pgvector; S3 stores the source docs).',
    ],
    keyDifferences:
      'S3 stores source files, datasets, and artifacts; vector databases store and query mathematical embeddings.',
    examClues: ['Data lake', 'Training dataset storage', 'RAG source documents', 'Batch input/output', 'Lifecycle retention'],
    realisticScenario:
      'Storing company PDF handbooks encrypted with KMS so Amazon Bedrock Knowledge Bases can ingest and vectorize them -> Amazon S3.',
    memoryAid: 'S3 = Universal AWS AI Storage Locker.',
  },
  {
    id: 'iam',
    name: 'AWS IAM',
    category: 'Data, Security & Governance',
    priority: 'Core Exam Priority',
    domains: ['d5'],
    whatItDoes:
      'Identity and Access Management controls authentication and authorization across all AWS services—defining users, groups, execution roles, and least-privilege JSON policies.',
    primaryPurpose:
      'Ensure only authorized humans and services can invoke specific models, read training buckets, or administer AI pipelines.',
    problemItSolves:
      'Prevents over-privileged access, accidental data exposure, and unauthorized model invocation costs.',
    typicalUseCases: [
      'Restricting an application role to invoke only `anthropic.claude-3-haiku` in Bedrock',
      'Granting SageMaker execution roles read-only access to a specific S3 training prefix',
    ],
    inputHandled: 'IAM policies, roles, condition keys (`aws:SourceVpce`), and service principals.',
    outputProduced: 'Allow/Deny authorization decisions on every AWS API call.',
    whenToChoose: [
      'Every question involving API permissions, least privilege, or role-based access to AI resources.',
    ],
    whenNotToChoose: [
      'You want to filter offensive words or hallucinations inside prompt text (choose Bedrock Guardrails).',
    ],
    keyDifferences:
      'IAM controls WHO can call AWS APIs and access resources; Guardrails inspects WHAT is said inside prompts and responses.',
    examClues: ['Least privilege', 'Access control', 'Execution role', 'Restrict model access', 'Policy conditions'],
    realisticScenario:
      'Ensuring a junior developer sandbox can test lightweight models in Bedrock without invoking expensive Provisioned Throughput or deleting production S3 data -> AWS IAM.',
    memoryAid: 'IAM = Gatekeeper of WHO can touch which AWS AI resource.',
  },
  {
    id: 'kms',
    name: 'AWS KMS',
    category: 'Data, Security & Governance',
    priority: 'Core Exam Priority',
    domains: ['d5'],
    whatItDoes:
      'Key Management Service creates and manages cryptographic keys used to encrypt AI data at rest across S3, SageMaker EBS volumes, Bedrock Knowledge Bases, and custom fine-tuned models.',
    primaryPurpose:
      'Protect sensitive training data, embeddings, and model artifacts at rest with auditable key policies and rotation.',
    problemItSolves:
      'Satisfies strict regulatory mandates requiring Customer Managed Keys (CMKs) and key-level access auditing.',
    typicalUseCases: [
      'Encrypting fine-tuned custom Bedrock models and Knowledge Base indices with CMKs',
      'Encrypting SageMaker training volumes and S3 medical datasets',
    ],
    inputHandled: 'Encryption keys, key policies, and automatic rotation schedules.',
    outputProduced: 'Envelope encryption for stored AI data and CloudTrail key usage logs.',
    whenToChoose: [
      'Requirements call for encryption at rest, Customer Managed Keys, or key rotation.',
    ],
    whenNotToChoose: [
      'Protecting data moving over the network (that is TLS encryption in transit) or discovering PII in S3 (Macie).',
    ],
    keyDifferences:
      'KMS handles encryption keys at rest; TLS handles encryption in transit; IAM governs identity permissions.',
    examClues: ['Encryption at rest', 'Customer Managed Key (CMK)', 'Key rotation', 'Cryptographic control'],
    realisticScenario:
      'A healthcare firm must ensure all fine-tuned FM weights and S3 RAG vectors are encrypted using keys their security team can rotate and revoke independently -> AWS KMS CMK.',
    memoryAid: 'KMS = Keys for Encryption at Rest.',
  },
  {
    id: 'cloudwatch',
    name: 'Amazon CloudWatch & AWS CloudTrail',
    category: 'Data, Security & Governance',
    priority: 'Core Exam Priority',
    domains: ['d1', 'd5'],
    whatItDoes:
      'Amazon CloudWatch monitors operational metrics, logs, latency, token usage, and alarms (plus Model Monitor drift alerts). AWS CloudTrail records a complete API audit log of who performed every AWS action and when.',
    primaryPurpose:
      'Provide operational observability (CloudWatch) and security/compliance API auditing (CloudTrail) for production AI.',
    problemItSolves:
      'Detects latency spikes, throttling, cost surges, model drift, and unauthorized API activity.',
    typicalUseCases: [
      'Alerting when Bedrock invocation latency or 4xx/5xx errors spike (CloudWatch)',
      'Auditing who invoked an FM or modified an IAM/Guardrail policy (CloudTrail)',
      'Storing Bedrock Model Invocation Logs in CloudWatch Logs or S3 for governance',
    ],
    inputHandled: 'Metrics, logs, alarms (CloudWatch) and AWS API event histories (CloudTrail).',
    outputProduced: 'Dashboards, SNS alerts, auto-scaling triggers, and immutable audit trails.',
    whenToChoose: [
      'CloudWatch for performance, token usage, latency, drift alarms; CloudTrail for user/API audit trails.',
    ],
    whenNotToChoose: [
      'Downloading third-party SOC/ISO compliance certificates (choose AWS Artifact).',
    ],
    keyDifferences:
      'CloudWatch = Health & performance monitoring ("how is the system performing?"); CloudTrail = Governance audit log ("who did what API call?").',
    examClues: ['Latency & error alarms', 'Token metrics', 'Model Monitor alerts', 'API audit trail', 'Who accessed what'],
    realisticScenario:
      'An operations team receives a PagerDuty alert when SageMaker endpoint latency exceeds 300ms (CloudWatch), while security reviews who updated the Bedrock Guardrail last Tuesday (CloudTrail).',
    memoryAid: 'CloudWatch watches health/metrics; CloudTrail leaves a footprint trail of API calls.',
  },
];

export const SERVICE_COMPARISONS: ServiceComparison[] = [
  {
    id: 'bedrock-vs-sagemaker',
    title: 'Amazon Bedrock vs. Amazon SageMaker AI',
    leftName: 'Amazon Bedrock',
    rightName: 'Amazon SageMaker AI',
    summary:
      'Choose Bedrock for serverless Foundation Model APIs and rapid GenAI assembly; choose SageMaker AI for custom predictive ML models, full training control, or self-hosted open models.',
    domains: ['d2', 'd3'],
    criteria: [
      { dimension: 'Operational model', leftValue: 'Serverless API — zero server or GPU management', rightValue: 'Managed ML platform — choose instances, containers & endpoints' },
      { dimension: 'Primary AI focus', leftValue: 'Generative AI (FMs, RAG Knowledge Bases, Agents, Guardrails)', rightValue: 'Full ML lifecycle (tabular, vision, custom DL, JumpStart FMs)' },
      { dimension: 'Customization depth', leftValue: 'Prompts, RAG, managed fine-tuning & continued pre-training', rightValue: 'Arbitrary Python/PyTorch code, custom architectures, distributed training' },
      { dimension: 'Governance & Bias tools', leftValue: 'Bedrock Guardrails & Model Evaluation', rightValue: 'SageMaker Clarify (bias/SHAP), Model Monitor, Model Cards' },
    ],
    examRuleOfThumb:
      'If the scenario emphasizes "minimal operational overhead, serverless access to Claude/Nova/Llama, Knowledge Bases, or Agents" -> Bedrock. If it emphasizes "custom ML algorithm, tabular fraud model, full control over training/tuning, or Clarify bias checks" -> SageMaker AI.',
  },
  {
    id: 'rekognition-vs-textract',
    title: 'Amazon Rekognition vs. Amazon Textract',
    leftName: 'Amazon Rekognition',
    rightName: 'Amazon Textract',
    summary:
      'Both inspect visual files, but Rekognition understands real-world scenes, objects, faces, and video, whereas Textract specializes in structured documents, forms, and tables.',
    domains: ['d1', 'd3'],
    criteria: [
      { dimension: 'Primary input type', leftValue: 'Photographs, camera feeds, and video files', rightValue: 'Scanned documents, PDFs, invoices, tax/ID forms' },
      { dimension: 'Core capability', leftValue: 'Object detection, face matching, PPE, content moderation', rightValue: 'Text extraction, handwriting, tables, key-value form pairs' },
      { dimension: 'Video support', leftValue: 'Yes — analyzes streaming & stored video', rightValue: 'No — document/page images & PDFs only' },
      { dimension: 'Custom training', leftValue: 'Rekognition Custom Labels for visual objects/defects', rightValue: 'Custom Queries & Adapters for specialized document fields' },
    ],
    examRuleOfThumb:
      'Objects, faces, PPE, or inappropriate video moderation -> Rekognition. Invoices, receipts, tables, checkboxes, or scanned PDFs -> Textract.',
  },
  {
    id: 'comprehend-vs-lex',
    title: 'Amazon Comprehend vs. Amazon Lex',
    leftName: 'Amazon Comprehend',
    rightName: 'Amazon Lex',
    summary:
      'Comprehend is a passive text analytics engine (sentiment, entities, PII); Lex is an active conversational chatbot and voice-bot builder.',
    domains: ['d1', 'd3'],
    criteria: [
      { dimension: 'Interaction pattern', leftValue: 'One-way analysis of existing text/documents', rightValue: 'Two-way multi-turn dialog with users' },
      { dimension: 'Core building blocks', leftValue: 'Sentiment, Entities, Key Phrases, PII, Custom Classifiers', rightValue: 'Intents, Utterances, Slots, Fulfillment Lambdas' },
      { dimension: 'Voice ASR built-in', leftValue: 'No (text input only)', rightValue: 'Yes (built-in speech recognition + Amazon Connect)' },
    ],
    examRuleOfThumb:
      'Analyze reviews, detect entities, or redact PII in text -> Comprehend. Build a customer service voice/chat bot that asks follow-up questions -> Lex.',
  },
  {
    id: 'transcribe-vs-polly',
    title: 'Amazon Transcribe vs. Amazon Polly',
    leftName: 'Amazon Transcribe',
    rightName: 'Amazon Polly',
    summary:
      'Opposite directions on the speech pipeline: Transcribe turns Speech into Text (ASR), while Polly turns Text into Speech (TTS).',
    domains: ['d1', 'd2', 'd3'],
    criteria: [
      { dimension: 'Direction', leftValue: 'Audio/Speech -> Written Text', rightValue: 'Written Text/SSML -> Spoken Audio' },
      { dimension: 'Key features', leftValue: 'Speaker diarization, custom vocabulary, PII redaction', rightValue: 'Neural/generative voices, SSML pacing & pronunciation' },
      { dimension: 'Typical pairing', leftValue: 'Feed call recordings into Comprehend or Bedrock', rightValue: 'Read Bedrock/Lex text replies aloud to callers' },
    ],
    examRuleOfThumb:
      'Remember: a Scribe writes down speech (Transcribe = Speech -> Text); Polly the parrot talks (Polly = Text -> Speech).',
  },
  {
    id: 'rag-vs-finetuning',
    title: 'RAG vs. Fine-Tuning vs. Continued Pre-Training',
    leftName: 'RAG (Retrieval-Augmented Generation)',
    rightName: 'Fine-Tuning / Continued Pre-Training',
    summary:
      'RAG injects fresh external facts at query time without changing weights; fine-tuning modifies model weights to adapt style, structure, or niche language.',
    domains: ['d2', 'd3'],
    criteria: [
      { dimension: 'Best problem solved', leftValue: 'Proprietary, fast-changing facts & verifiable citations', rightValue: 'Consistent tone/format (FT) or deep domain jargon (CPT)' },
      { dimension: 'Data update speed', leftValue: 'Minutes — re-index documents in vector DB', rightValue: 'Hours/days — requires running a new training job' },
      { dimension: 'Hallucination control', leftValue: 'High — grounded in retrieved chunks with citations', rightValue: 'Lower — weights still extrapolate without live retrieval' },
      { dimension: 'Bedrock hosting', leftValue: 'Works with serverless On-Demand FMs', rightValue: 'Custom Bedrock models require Provisioned Throughput' },
    ],
    examRuleOfThumb:
      'Dynamic knowledge, citations, and avoiding retraining -> RAG. Labeled style/format consistency -> Instruction Fine-Tuning. Massive unlabeled industry text -> Continued Pre-Training.',
  },
  {
    id: 'classification-vs-regression',
    title: 'Classification vs. Regression',
    leftName: 'Classification',
    rightName: 'Regression',
    summary:
      'Both are supervised ML techniques trained on labeled data, differing strictly in whether the target output is a discrete category or a continuous number.',
    domains: ['d1'],
    criteria: [
      { dimension: 'Output format', leftValue: 'Discrete label/class (Fraud/Valid, Low/Med/High)', rightValue: 'Continuous numeric quantity ($425,000, 18.4 mins)' },
      { dimension: 'Common metrics', leftValue: 'Accuracy, Precision, Recall, F1-score, AUC-ROC', rightValue: 'RMSE, MAE, R-squared' },
      { dimension: 'Example scenario', leftValue: 'Will this customer churn next month? (Yes/No)', rightValue: 'How much will this customer spend next quarter? ($)' },
    ],
    examRuleOfThumb:
      'Category/bucket -> Classification. Continuous dollar/count/score -> Regression. Sequential future timeline -> Forecasting.',
  },
  {
    id: 'supervised-vs-unsupervised',
    title: 'Supervised vs. Unsupervised Learning',
    leftName: 'Supervised Learning',
    rightName: 'Unsupervised Learning',
    summary:
      'Supervised learning relies on historical labeled answers to predict targets; unsupervised learning uncovers hidden structure in unlabeled records.',
    domains: ['d1'],
    criteria: [
      { dimension: 'Dataset requirement', leftValue: 'Features + historical ground-truth labels', rightValue: 'Features only (no target labels)' },
      { dimension: 'Primary tasks', leftValue: 'Classification & Regression', rightValue: 'Clustering (K-Means), Anomaly Detection, PCA' },
      { dimension: 'Labeling effort', leftValue: 'Often requires manual/Ground Truth annotation', rightValue: 'Zero label annotation needed upfront' },
    ],
    examRuleOfThumb:
      'Historical labeled outcomes -> Supervised. Unlabeled discovery / grouping / anomaly spotting -> Unsupervised.',
  },
  {
    id: 'embeddings-vs-keyword',
    title: 'Vector Embeddings vs. Traditional Keyword Search',
    leftName: 'Vector Embeddings (Semantic Search)',
    rightName: 'Keyword Search (Lexical)',
    summary:
      'Embeddings capture conceptual meaning in multi-dimensional space, while keyword search matches exact token overlap.',
    domains: ['d2', 'd3'],
    criteria: [
      { dimension: 'How queries match', leftValue: 'Cosine similarity across semantic vectors', rightValue: 'Exact word/stem matching (BM25/TF-IDF)' },
      { dimension: 'Strength', leftValue: 'Handles synonyms, intent & paraphrasing effortlessly', rightValue: 'Exact part numbers, SKUs, error codes & names' },
      { dimension: 'Best practice', leftValue: 'Combine both via Hybrid Search in OpenSearch/Kendra', rightValue: 'Pair with embeddings when exact codes also matter' },
    ],
    examRuleOfThumb:
      'Conceptual meaning / paraphrased queries -> Embeddings. Exact SKUs/codes + natural language -> Hybrid Search.',
  },
  {
    id: 'guardrails-vs-iam',
    title: 'Amazon Bedrock Guardrails vs. AWS IAM',
    leftName: 'Amazon Bedrock Guardrails',
    rightName: 'AWS IAM',
    summary:
      'Guardrails governs the CONTENT inside prompts and model replies; IAM governs IDENTITY permissions for who can call AWS APIs.',
    domains: ['d4', 'd5'],
    criteria: [
      { dimension: 'What it inspects', leftValue: 'Text/multimodal prompt inputs and FM outputs', rightValue: 'API caller identity, resource ARN, network conditions' },
      { dimension: 'Threats stopped', leftValue: 'Toxicity, denied topics, PII leaks, hallucinations, prompt injection', rightValue: 'Unauthorized model calls, S3 bucket tampering, privilege escalation' },
      { dimension: 'Used together?', leftValue: 'Yes — complementary layers of defense-in-depth', rightValue: 'Yes — IAM controls who can modify/bypass Guardrails too' },
    ],
    examRuleOfThumb:
      'Block toxic content, banned topics, PII in chat, or ungrounded answers -> Guardrails. Restrict which user/role can invoke Claude or read S3 -> IAM.',
  },
  {
    id: 'training-vs-inference',
    title: 'Model Training vs. Model Inference (& AWS Silicon)',
    leftName: 'Model Training',
    rightName: 'Model Inference',
    summary:
      'Training learns weights iteratively over massive datasets (compute-heavy offline); inference runs forward passes to serve predictions (latency/cost-per-call sensitive).',
    domains: ['d1', 'd2', 'd3'],
    criteria: [
      { dimension: 'Goal', leftValue: 'Optimize weights by minimizing loss on training data', rightValue: 'Apply frozen trained weights to generate new predictions' },
      { dimension: 'AWS Purpose-Built Chip', leftValue: 'AWS Trainium (EC2 Trn1 / Trn2)', rightValue: 'AWS Inferentia (EC2 Inf1 / Inf2)' },
      { dimension: 'Serving pattern', leftValue: 'Jobs run periodically or on new data', rightValue: 'Real-time, Serverless, Async, or Batch Transform' },
    ],
    examRuleOfThumb:
      'Training -> AWS Trainium. Inference -> AWS Inferentia.',
  },
];
