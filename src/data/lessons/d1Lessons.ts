import { Lesson } from '../../types';

export const DOMAIN_1_LESSONS: Lesson[] = [
  {
    id: 'd1-l1',
    domainId: 'd1',
    taskStatement: '1.1',
    order: 1,
    title: 'AI, Machine Learning, Deep Learning & Traditional Programming',
    difficulty: 'Easy',
    estimatedMinutes: 10,
    objectives: [
      'Distinguish Artificial Intelligence (AI), Machine Learning (ML), Deep Learning (DL), and Generative AI as nested capabilities.',
      'Contrast traditional rule-based programming with machine learning systems.',
      'Identify business scenarios where traditional software is preferable to ML.',
    ],
    conceptExplanation:
      'Artificial Intelligence is the broad field of building machines capable of tasks that typically require human intelligence. Machine Learning is a subset of AI where algorithms learn patterns from historical data instead of following explicit human-written rules. Deep Learning is a specialized subset of ML that uses multi-layered artificial neural networks to learn complex representations from large volumes of unstructured data such as images, audio, and natural language.',
    whyItMatters:
      'AIF-C01 exam questions frequently ask whether a problem requires simple rule-based code, classical ML, or deep learning. Choosing deep learning for a deterministic calculation wastes cost and complexity, while choosing hard-coded rules for unstructured image classification fails completely.',
    detailedExplanation: [
      'In traditional programming, an engineer writes explicit logic (if-then rules) and feeds in input data to compute deterministic outputs. For example, calculating sales tax or validating an email format works best with deterministic code because the rules are known and fixed.',
      'In machine learning, you provide historical input data (features) along with known outcomes (labels) during training, and the algorithm discovers the mathematical rules (a trained model) automatically. Once trained, the model performs inference on new, unseen inputs.',
      'Classical ML algorithms—such as linear regression, logistic regression, decision trees, and gradient-boosted trees (XGBoost)—excel on structured tabular datasets (spreadsheets, database tables) and require far less compute than deep learning.',
      'Deep learning relies on neural networks with many hidden layers (deep neural networks, CNNs for vision, Transformers for language). It automatically extracts features from raw unstructured data (pixels, waveforms, text) without manual feature crafting, though it demands large datasets and GPU/accelerator compute.',
    ],
    realWorldExample:
      'Consider spam filtering. Writing manual rules like "block emails containing the word FREE" breaks immediately when spammers write "F.R.E.E." An ML classifier trained on millions of labeled emails learns subtle combinations of sender reputation, phrasing, and link structure—and adapts when retrained on new spam campaigns.',
    awsExample:
      'On AWS, you can build tabular classical ML models quickly using Amazon SageMaker Autopilot or XGBoost built-in algorithms, while deep learning vision and language workloads leverage pre-trained foundation models in Amazon Bedrock or purpose-built services like Amazon Rekognition.',
    comparisonTable: {
      title: 'Traditional Programming vs. Classical ML vs. Deep Learning',
      headers: ['Dimension', 'Traditional Programming', 'Classical ML / Deep Learning'],
      rows: [
        { aspect: 'How rules are created', left: 'Explicitly coded by humans', right: 'Learned statistically from data' },
        { aspect: 'Best data types', left: 'Exact formulas & deterministic workflows', right: 'Fuzzy patterns, tabular (ML) & unstructured media (DL)' },
        { aspect: 'Explainability', left: '100% deterministic & traceable', right: 'Varies (trees are clear; deep nets are opaque)' },
        { aspect: 'Maintenance trigger', left: 'Business logic change in code', right: 'Data drift requiring model retraining' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Every automation task should use AI/ML. Reality: If exact rules exist (e.g., invoice tax calculation), traditional code is cheaper, faster, and 100% accurate.',
      'Misconception: Deep learning is always better than classical ML. Reality: For structured tabular business data, gradient-boosted trees often outperform deep neural networks at a fraction of the cost.',
    ],
    examKeywords: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Rule-based logic', 'Unstructured data'],
    howToRecognize:
      'Look for phrases like "rules change frequently and are too complex to code manually" (choose ML) versus "fixed regulatory calculation or deterministic validation" (do NOT choose ML) versus "extracting patterns from raw images, video, or audio" (Deep Learning).',
    keyTakeaway:
      'Use traditional code when rules are fixed, classical ML for structured tabular pattern prediction, and deep learning for high-dimensional unstructured data.',
    knowledgeCheck: {
      question:
        'A logistics firm wants a system to automatically calculate shipping fees using a fixed rate table based on package weight and destination zone. Which approach is most appropriate?',
      options: [
        { id: 'a', text: 'Train a deep neural network on historical invoices' },
        { id: 'b', text: 'Use traditional rule-based programming logic' },
        { id: 'c', text: 'Deploy an LLM using Amazon Bedrock' },
        { id: 'd', text: 'Use unsupervised clustering to group shipments' },
      ],
      correctOptionId: 'b',
      explanation:
        'Because the rate table uses fixed, deterministic rules, traditional programming is accurate, auditable, and far more cost-effective than ML or GenAI.',
    },
    relatedServiceIds: ['sagemaker-ai', 'bedrock'],
  },
  {
    id: 'd1-l2',
    domainId: 'd1',
    taskStatement: '1.1',
    order: 2,
    title: 'Supervised, Unsupervised & Reinforcement Learning',
    difficulty: 'Easy',
    estimatedMinutes: 12,
    objectives: [
      'Differentiate supervised learning, unsupervised learning, and reinforcement learning by how feedback and labels are provided.',
      'Map common business tasks (classification, regression, clustering, anomaly detection, robotics/optimization) to the right learning paradigm.',
      'Recognize semi-supervised and self-supervised learning at a conceptual level.',
    ],
    conceptExplanation:
      'Machine learning algorithms are grouped by how they learn from data. Supervised learning trains on labeled examples (input + known answer). Unsupervised learning discovers hidden structure in unlabeled data. Reinforcement learning trains an agent to maximize cumulative rewards through trial-and-error interaction with an environment.',
    whyItMatters:
      'Matching the dataset description in an exam scenario ("historical records with labeled fraud outcomes" vs. "no predefined categories") to the right learning paradigm immediately eliminates two or three distractors.',
    detailedExplanation: [
      'Supervised learning requires labeled training data—each record has features (X) and a target label (Y). It solves two main tasks: Classification (predicting a discrete category, like spam vs. not spam, or medical diagnosis categories) and Regression (predicting a continuous numeric value, like house price or energy demand).',
      'Unsupervised learning works with unlabeled data where no target column exists. Key tasks include Clustering (grouping customers by purchasing behavior with K-Means), Dimensionality Reduction (compressing many features while preserving variance with PCA), and Anomaly Detection (spotting unusual network traffic or equipment sensor spikes).',
      'Reinforcement learning (RL) involves an Agent taking Actions inside an Environment, receiving Rewards or Penalties, and learning a Policy that maximizes long-term cumulative reward. Classic applications include robotics control, autonomous navigation, dynamic game playing, and warehouse routing.',
      'Two bridging concepts also appear on AIF-C01: Semi-supervised learning (combining a small labeled dataset with a large unlabeled pool to reduce labeling cost) and Self-supervised learning (where models generate their own labels from raw data—for example, predicting the next word in a sentence, which is how LLMs are pre-trained).',
    ],
    realWorldExample:
      'A streaming music app uses supervised classification to label tracks by genre from tagged catalogs, unsupervised clustering to discover emerging listener micro-communities without pre-named genres, and reinforcement learning to optimize real-time bitrate adaptation during changing mobile network conditions.',
    awsExample:
      'Amazon SageMaker AI supports supervised algorithms (XGBoost, Linear Learner), unsupervised algorithms (K-Means, Random Cut Forest for anomaly detection), and Amazon SageMaker Ground Truth to efficiently label datasets when supervised training requires ground-truth tags.',
    comparisonTable: {
      title: 'The Three Core Machine Learning Paradigms',
      headers: ['Paradigm', 'Training Data Requirement', 'Primary Problem Types'],
      rows: [
        { aspect: 'Supervised Learning', left: 'Labeled data (features + target)', right: 'Classification (categories) & Regression (numbers)' },
        { aspect: 'Unsupervised Learning', left: 'Unlabeled data (features only)', right: 'Clustering, anomaly detection, dimensionality reduction' },
        { aspect: 'Reinforcement Learning', left: 'Environment + reward function', right: 'Sequential decision-making, robotics, dynamic control' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Clustering is a type of classification. Reality: Classification predicts known predefined classes (supervised); clustering discovers unknown groupings without labels (unsupervised).',
      'Misconception: Reinforcement learning is just supervised learning with rewards. Reality: RL learns sequential actions over time where delayed rewards depend on a series of decisions, not single-step labeled examples.',
    ],
    examKeywords: ['Labeled data', 'Unlabeled data', 'Classification', 'Regression', 'Clustering', 'Reward function', 'Agent and environment', 'Self-supervised'],
    howToRecognize:
      'Ask: Does the prompt mention historical outcomes/tags/labels? If yes -> Supervised. Does it say "no labels" or "discover natural groupings"? -> Unsupervised. Does it mention "trial and error, agent, actions, environment, cumulative reward"? -> Reinforcement Learning.',
    keyTakeaway:
      'Labels drive the choice: labeled targets mean supervised learning, label-free pattern discovery means unsupervised learning, and reward-driven sequential interaction means reinforcement learning.',
    knowledgeCheck: {
      question:
        'A telecommunications company has millions of unlabeled call-detail records and wants to automatically segment subscribers into distinct behavioral groups for marketing without predefined categories. Which approach should it use?',
      options: [
        { id: 'a', text: 'Supervised regression' },
        { id: 'b', text: 'Unsupervised clustering' },
        { id: 'c', text: 'Reinforcement learning' },
        { id: 'd', text: 'Binary classification' },
      ],
      correctOptionId: 'b',
      explanation:
        'Because the records are unlabeled and there are no predefined target categories, unsupervised clustering (such as K-Means) is the correct technique.',
    },
    relatedServiceIds: ['sagemaker-ai'],
  },
  {
    id: 'd1-l3',
    domainId: 'd1',
    taskStatement: '1.2',
    order: 3,
    title: 'Core ML Use Cases: Classification, Regression, Forecasting & Recommendations',
    difficulty: 'Medium',
    estimatedMinutes: 11,
    objectives: [
      'Distinguish binary classification, multi-class classification, regression, time-series forecasting, and recommendation systems.',
      'Select specialized AWS AI services versus custom ML for vision, NLP, speech, and predictive workloads.',
    ],
    conceptExplanation:
      'Predictive AI solves distinct business problems depending on output format and time dependency. Classification outputs discrete labels; regression outputs continuous numbers; forecasting predicts future sequential values over time; and recommendation systems match users to relevant items.',
    whyItMatters:
      'Exam questions often present two similar-sounding numeric tasks—such as predicting a one-time home sale price (regression) versus predicting daily electricity demand over the next 30 days (time-series forecasting)—to test precision.',
    detailedExplanation: [
      'Binary classification chooses between two mutually exclusive classes (fraudulent vs. legitimate, churn vs. retain). Multi-class classification selects one class out of three or more (routing a support ticket to Billing, Technical, or Account). Multi-label classification assigns multiple tags simultaneously (an image containing both "dog" and "park").',
      'Regression predicts a continuous numerical quantity based on input features—for example, estimating insurance claim payouts or delivery duration in minutes.',
      'Time-series forecasting is a specialized predictive task where historical observations ordered sequentially by timestamp—along with seasonality, holidays, and trends—predict future values across a horizon (e.g., hourly retail inventory demand for the next four weeks).',
      'Recommendation engines suggest personalized products, movies, or articles using collaborative filtering (users who liked X also liked Y), content-based filtering (item attributes), or hybrid session-based deep learning.',
      'Domain-specific AI domains include Computer Vision (object detection, OCR, facial analysis), Natural Language Processing (sentiment, entity extraction, translation), and Speech AI (automatic speech recognition and text-to-speech synthesis).',
    ],
    realWorldExample:
      'An e-commerce retailer uses classification to detect counterfeit product listings, regression to estimate optimal shipping box weight, forecasting to plan warehouse stock before holiday spikes, and a recommendation engine on product detail pages to boost average order value.',
    awsExample:
      'AWS provides managed services tailored to these use cases: Amazon Personalize for real-time product/content recommendations, Amazon Rekognition for computer vision, Amazon Comprehend for NLP, Amazon Transcribe/Polly for Speech AI, and SageMaker Canvas/AI for custom classification, regression, and forecasting.',
    comparisonTable: {
      title: 'Regression vs. Time-Series Forecasting vs. Classification',
      headers: ['Task', 'Output Type', 'Key Distinguishing Signal'],
      rows: [
        { aspect: 'Classification', left: 'Discrete category / label', right: 'Predicts "which bucket" (Spam, Tier A/B/C)' },
        { aspect: 'Regression', left: 'Continuous numeric value', right: 'Predicts "how much" from cross-sectional features' },
        { aspect: 'Forecasting', left: 'Future numeric sequence', right: 'Depends heavily on chronological timestamps & seasonality' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Any problem predicting a number is time-series forecasting. Reality: Predicting an apartment price from square footage and neighborhood has no sequential forecast horizon—that is regression.',
      'Misconception: You need Generative AI to build a product recommender. Reality: Dedicated recommendation models (like Amazon Personalize) are purpose-built, lower latency, and more accurate for ranking catalog items.',
    ],
    examKeywords: ['Binary classification', 'Multi-class', 'Continuous value', 'Time-series forecasting', 'Collaborative filtering', 'Computer vision', 'NLP'],
    howToRecognize:
      'Scan the scenario for output shape: categories -> classification; static continuous number -> regression; future daily/weekly trend -> forecasting; "personalized items/movies/products for each user" -> Amazon Personalize.',
    keyTakeaway:
      'Match the exact output structure and temporal dependency of the business problem to choose between classification, regression, forecasting, and recommendation systems.',
    knowledgeCheck: {
      question:
        'A hospital network wants to predict the number of emergency room admissions for each day of the upcoming month using three years of daily historical admission logs and local holiday calendars. Which ML problem type is this?',
      options: [
        { id: 'a', text: 'Unsupervised clustering' },
        { id: 'b', text: 'Time-series forecasting' },
        { id: 'c', text: 'Binary classification' },
        { id: 'd', text: 'Multi-label classification' },
      ],
      correctOptionId: 'b',
      explanation:
        'Predicting future daily counts from chronological historical records and seasonality (holidays) is a classic time-series forecasting problem.',
    },
    relatedServiceIds: ['personalize', 'sagemaker-ai', 'rekognition', 'comprehend'],
  },
  {
    id: 'd1-l4',
    domainId: 'd1',
    taskStatement: '1.3',
    order: 4,
    title: 'Data Quality, Feature Engineering, Data Splits & Data Leakage',
    difficulty: 'Medium',
    estimatedMinutes: 12,
    objectives: [
      'Contrast structured, semi-structured, and unstructured data along with labeled vs. unlabeled datasets.',
      'Explain feature engineering techniques and why train/validation/test splits are mandatory.',
      'Identify and prevent data leakage and class imbalance issues.',
    ],
    conceptExplanation:
      'A model is only as reliable as the data used to train it. Preparing ML data involves gathering structured or unstructured inputs, cleaning anomalies, transforming raw columns into informative signals (feature engineering), and strictly separating training, validation, and test splits so evaluation mirrors real-world unseen data.',
    whyItMatters:
      'Data leakage and class imbalance are classic "why did my model score 99% in testing and fail in production?" exam questions.',
    detailedExplanation: [
      'Structured data fits neatly into rows and columns (SQL tables, CSVs); semi-structured data uses flexible tags (JSON, XML); unstructured data lacks a fixed schema (PDFs, images, audio, free-form text).',
      'Feature engineering transforms raw attributes into predictive features: one-hot encoding converts categories like "City" into numeric columns; normalization/scaling brings features onto comparable numeric ranges; imputation fills missing values; binning groups continuous values into buckets.',
      'Datasets are split into three disjoint subsets: the Training Set (typically 70–80%) teaches the model parameters; the Validation Set (10–15%) tunes hyperparameters and prevents overfitting during development; and the Test Set (10–15%) is held out completely until the end to measure unbiased generalization.',
      'Data leakage happens when information from outside the training set—or future information that would not be available at prediction time—accidentally enters training features. For example, normalizing features across the entire dataset before splitting leaks test distribution statistics, or including a "loan_default_fee_charged" column when predicting whether a future applicant will default.',
      'Class imbalance occurs when one outcome is rare (e.g., 99.8% legitimate transactions vs. 0.2% fraud). Remedies include oversampling the minority class (SMOTE), undersampling the majority class, adjusting class weights, and evaluating with precision/recall/F1 instead of raw accuracy.',
    ],
    realWorldExample:
      'An online retailer built a model predicting whether an order will be returned and got 98% validation accuracy. In production it failed because one training feature was "return_shipping_label_id"—data generated only AFTER a customer already initiated a return!',
    awsExample:
      'AWS Glue DataBrew and Amazon SageMaker Data Wrangler provide visual pipelines for cleaning, imputing, and encoding features without manual scripts, while SageMaker Feature Store shares consistent engineered features across training and real-time inference.',
    comparisonTable: {
      title: 'Training vs. Validation vs. Test Datasets',
      headers: ['Subset', 'Purpose', 'Used During'],
      rows: [
        { aspect: 'Training Set (~70–80%)', left: 'Adjust model weights & parameters', right: 'Model training loop' },
        { aspect: 'Validation Set (~10–15%)', left: 'Tune hyperparameters & select best checkpoint', right: 'Model development & tuning' },
        { aspect: 'Test Set (~10–15%)', left: 'Unbiased final generalization estimate', right: 'Post-tuning evaluation only' },
      ],
    },
    commonMisconceptions: [
      'Misconception: You can tune hyperparameters on the test set to get higher accuracy. Reality: Tuning on the test set causes leakage and invalidates your generalization score—always tune on the validation set.',
      'Misconception: More features always improve accuracy. Reality: Irrelevant or correlated features add noise, increase latency, and heighten overfitting risk.',
    ],
    examKeywords: ['Feature engineering', 'One-hot encoding', 'Data leakage', 'Train/validation/test split', 'Class imbalance', 'SageMaker Data Wrangler', 'AWS Glue'],
    howToRecognize:
      'If a scenario describes suspiciously high test accuracy followed by poor real-world performance—especially when future/target-derived fields or unsplit preprocessing were used—the root cause is Data Leakage.',
    keyTakeaway:
      'Split data before preprocessing, exclude any post-outcome features to prevent leakage, and use AWS Glue or SageMaker Data Wrangler to standardize clean feature pipelines.',
    knowledgeCheck: {
      question:
        'A bank builds a model to predict loan default at application time. During evaluation, the model achieves 99.4% accuracy, but in live production accuracy drops to 54%. Investigation reveals the training dataset included a column recording collection agency contact dates. What caused this failure?',
      options: [
        { id: 'a', text: 'Underfitting due to insufficient model complexity' },
        { id: 'b', text: 'Data leakage from a post-outcome feature unavailable at inference time' },
        { id: 'c', text: 'Excessively high temperature parameter during training' },
        { id: 'd', text: 'Lack of GPU acceleration during batch inference' },
      ],
      correctOptionId: 'b',
      explanation:
        'Collection agency contact dates only exist after a loan has already defaulted. Including that column leaks the target outcome into training features, inflating offline metrics while failing at application time.',
    },
    relatedServiceIds: ['sagemaker-ai', 'glue', 's3'],
  },
  {
    id: 'd1-l5',
    domainId: 'd1',
    taskStatement: '1.3',
    order: 5,
    title: 'Overfitting, Underfitting, Bias-Variance & Model Evaluation Metrics',
    difficulty: 'Hard',
    estimatedMinutes: 14,
    objectives: [
      'Diagnose overfitting (high variance) vs. underfitting (high bias) from training and validation metrics.',
      'Compute and interpret Accuracy, Precision, Recall, F1-score, Confusion Matrix, and RMSE.',
      'Select the right metric for imbalanced or asymmetric-cost business scenarios.',
    ],
    conceptExplanation:
      'Model evaluation ensures a trained model generalizes well to new data rather than memorizing training noise (overfitting) or missing true relationships (underfitting). Choosing the right evaluation metric depends on whether errors carry equal or asymmetric business costs.',
    whyItMatters:
      'AIF-C01 tests your ability to read simple training vs. validation accuracy pairs and pick the right remedy (more data/regularization vs. richer model), and to select Precision vs. Recall vs. F1-score for real business scenarios.',
    detailedExplanation: [
      'Overfitting (High Variance) occurs when a model memorizes noise and idiosyncrasies in the training set: training accuracy is very high (e.g., 98%), while validation/test accuracy is poor (e.g., 64%). Fixes include gathering more diverse training data, applying regularization (L1/L2, dropout), early stopping, pruning decision trees, or simplifying the model.',
      'Underfitting (High Bias) occurs when a model is too simple to capture the underlying pattern: both training accuracy (e.g., 58%) and validation accuracy (e.g., 55%) are low. Fixes include adding better features, using a more expressive model architecture, reducing excessive regularization, or training longer.',
      'A Confusion Matrix breaks classification predictions into four counts: True Positives (TP), True Negatives (TN), False Positives (FP - false alarm), and False Negatives (FN - missed detection).',
      'Accuracy = (TP + TN) / Total. Never rely on accuracy alone on imbalanced datasets: if 99% of transactions are valid, predicting "valid" every time yields 99% accuracy while catching 0% of fraud!',
      'Precision = TP / (TP + FP). Measures "when the model predicts positive, how often is it right?" Optimize Precision when False Positives are expensive (e.g., flagging legitimate customer emails as spam or triggering expensive manual audits).',
      'Recall (Sensitivity) = TP / (TP + FN). Measures "of all actual positives, how many did we catch?" Optimize Recall when False Negatives are dangerous or costly (e.g., cancer screening, fraud detection, predictive safety failure).',
      'F1-Score is the harmonic mean of Precision and Recall (2 * P * R / (P + R)), useful when you need a single balanced metric on imbalanced classes. For regression, RMSE (Root Mean Squared Error) and MAE (Mean Absolute Error) measure average prediction error magnitude.',
    ],
    realWorldExample:
      'In airport baggage threat screening, missing an actual threat (False Negative) is catastrophic, so the system prioritizes high Recall even if security officers occasionally open a harmless bag (False Positive). Conversely, automated email spam filters prioritize high Precision so critical job offers or receipts are not silently buried in spam.',
    awsExample:
      'Amazon SageMaker Model Monitor tracks live production inputs and predictions against baseline statistics to alert via Amazon CloudWatch when data drift or concept drift degrades model accuracy over time.',
    comparisonTable: {
      title: 'Overfitting vs. Underfitting & Precision vs. Recall',
      headers: ['Condition / Metric', 'Diagnostic Signal', 'Business Priority / Fix'],
      rows: [
        { aspect: 'Overfitting (High Variance)', left: '98% train acc, 63% val acc', right: 'More data, regularization, early stopping, simpler model' },
        { aspect: 'Underfitting (High Bias)', left: '59% train acc, 57% val acc', right: 'Richer model, more features, less regularization' },
        { aspect: 'Optimize Precision', left: 'Minimize False Positives (FP)', right: 'Spam filtering, safe content blocking, expensive alerts' },
        { aspect: 'Optimize Recall', left: 'Minimize False Negatives (FN)', right: 'Disease screening, fraud detection, safety hazards' },
      ],
    },
    commonMisconceptions: [
      'Misconception: High accuracy guarantees a useful fraud detector. Reality: On 99.9% non-fraud data, a dummy model achieves 99.9% accuracy with zero fraud caught.',
      'Misconception: Adding more training epochs always fixes low validation accuracy. Reality: If the model is overfitting, more epochs actually worsen validation error; early stopping is needed.',
    ],
    examKeywords: ['Overfitting', 'Underfitting', 'Bias-variance tradeoff', 'Regularization', 'Precision', 'Recall', 'F1-score', 'Confusion matrix', 'Data drift'],
    howToRecognize:
      'Compare train vs. validation scores first: big gap -> Overfitting; both low -> Underfitting. Then inspect error consequence: "cannot miss positive cases" -> Recall; "avoid false alarms" -> Precision; "imbalanced classes needing balance" -> F1-score.',
    keyTakeaway:
      'Overfitting memorizes noise (close the train-val gap with data/regularization), underfitting lacks capacity (add features/complexity), Recall catches positives, and Precision prevents false alarms.',
    knowledgeCheck: {
      question:
        'A medical diagnostics team builds a classifier to flag early-stage malignant scans. Missing a true malignancy carries severe patient risk, while a flagged scan simply undergoes a quick specialist review. Which metric should the team prioritize?',
      options: [
        { id: 'a', text: 'Overall Accuracy' },
        { id: 'b', text: 'Recall' },
        { id: 'c', text: 'Specificity only' },
        { id: 'd', text: 'Root Mean Squared Error (RMSE)' },
      ],
      correctOptionId: 'b',
      explanation:
        'Missing an actual positive case is a False Negative. Minimizing False Negatives means maximizing Recall (TP / (TP + FN)).',
    },
    relatedServiceIds: ['sagemaker-ai', 'cloudwatch'],
  },
  {
    id: 'd1-l6',
    domainId: 'd1',
    taskStatement: '1.3',
    order: 6,
    title: 'The End-to-End ML Lifecycle & Inference Modes on AWS',
    difficulty: 'Medium',
    estimatedMinutes: 10,
    objectives: [
      'Trace the iterative ML lifecycle from business framing through deployment and continuous monitoring.',
      'Select between real-time, serverless, asynchronous, and batch transform inference modes.',
    ],
    conceptExplanation:
      'Building an ML model is only one phase of the ML lifecycle. Production systems move iteratively from business problem formulation and data engineering through model training, evaluation, deployment, and ongoing monitoring for drift.',
    whyItMatters:
      'Exam scenarios regularly test operational trade-offs—such as choosing Batch Transform over an always-on real-time endpoint when predictions are only needed once per night.',
    detailedExplanation: [
      'The ML lifecycle comprises: (1) Business Goal & Framing (define success metrics and confirm ML is needed), (2) Data Collection & Preparation (ingestion, labeling, feature engineering), (3) Model Training & Tuning (algorithm selection, hyperparameter optimization), (4) Evaluation & Validation (offline metrics + bias checks), (5) Deployment (serving predictions via inference), and (6) Monitoring & Retraining (detecting data drift or concept drift and feeding fresh labels back).',
      'Real-time inference hosts persistent endpoints for low-latency (milliseconds) single-request predictions such as live checkout fraud scoring.',
      'Serverless inference automatically scales compute down to zero during idle periods—ideal for intermittent, unpredictable traffic that tolerates brief cold starts.',
      'Asynchronous inference queues large payloads (up to 1 GB, e.g., long video/audio files) and processes them over minutes rather than milliseconds.',
      'Batch Transform runs offline predictions across an entire dataset stored in Amazon S3 (such as nightly customer churn scoring) and shuts down compute immediately when finished—minimizing cost.',
    ],
    realWorldExample:
      'A streaming platform scores every login attempt in 15 milliseconds using real-time inference to block credential stuffing, while generating weekly subscriber churn risk scores for 10 million accounts overnight using Batch Transform.',
    awsExample:
      'Amazon SageMaker AI unifies this lifecycle via SageMaker Pipelines (CI/CD orchestration), SageMaker Endpoints (real-time/serverless/async), SageMaker Batch Transform, and SageMaker Model Monitor.',
    comparisonTable: {
      title: 'SageMaker Inference Options Compared',
      headers: ['Inference Mode', 'Latency & Payload', 'Best Cost/Use Case Fit'],
      rows: [
        { aspect: 'Real-Time Endpoint', left: 'Milliseconds · Small payloads', right: 'Steady, low-latency interactive APIs' },
        { aspect: 'Serverless Inference', left: 'Milliseconds + cold start', right: 'Intermittent/unpredictable traffic; scales to zero' },
        { aspect: 'Asynchronous Inference', left: 'Minutes · Large payloads (up to 1 GB)', right: 'Heavy media or long processing with queue scaling' },
        { aspect: 'Batch Transform', left: 'Minutes–Hours · Massive S3 files', right: 'Scheduled offline scoring; no persistent endpoint' },
      ],
    },
    commonMisconceptions: [
      'Misconception: Once deployed, an ML model never needs updating. Reality: Real-world distributions shift (data drift) and relationships evolve (concept drift), degrading accuracy until retrained.',
      'Misconception: Real-time endpoints are always required for ML in production. Reality: Nightly/weekly reporting workloads waste money on idle endpoints when Batch Transform finishes and stops billing.',
    ],
    examKeywords: ['ML lifecycle', 'Real-time inference', 'Batch transform', 'Serverless inference', 'Asynchronous inference', 'Data drift', 'Concept drift'],
    howToRecognize:
      'Check latency and schedule clues: "sub-second / immediate checkout decision" -> Real-time; "intermittent traffic / cost-sensitive idle periods" -> Serverless; "large multi-MB files / minutes allowed" -> Async; "overnight / weekly scoring of S3 dataset" -> Batch Transform.',
    keyTakeaway:
      'Match inference architecture to latency, payload size, and traffic pattern, and monitor deployed models continuously for drift.',
    knowledgeCheck: {
      question:
        'A retail company wants to score 4 million customer profiles every Sunday night to identify churn candidates for Monday morning marketing emails, minimizing compute cost. Which SageMaker inference option fits best?',
      options: [
        { id: 'a', text: 'Provisioned multi-instance real-time endpoint' },
        { id: 'b', text: 'Amazon SageMaker Batch Transform' },
        { id: 'c', text: 'Always-on GPU inference cluster' },
        { id: 'd', text: 'Reinforcement learning policy endpoint' },
      ],
      correctOptionId: 'b',
      explanation:
        'Batch Transform processes large S3 datasets on a schedule and tears down compute automatically after completion, avoiding idle endpoint costs.',
    },
    relatedServiceIds: ['sagemaker-ai', 's3', 'cloudwatch'],
  },
];
