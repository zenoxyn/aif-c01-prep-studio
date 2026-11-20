<div align="center">
  <h1>🎓 AIF-C01 Prep Studio</h1>
  <p><strong>Self-hosted study platform for AWS Certified AI Practitioner (AIF-C01)</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deploying-to-vercel">Deploy</a> •
    <a href="#project-structure">Project Structure</a>
  </p>
</div>

---

## 🎯 Why I Built This

I created this project **to help myself prepare for the AWS Certified AI Practitioner (AIF-C01) exam**. Instead of passively reading docs or watching videos, I wanted an interactive, hands-on study tool that:

- **Covers all 5 official exam domains** with structured lessons
- **Provides 520+ practice questions** with explanations mapped to each domain
- **Simulates the real exam experience** with timed full-length practice tests
- **Tracks my progress** with spaced repetition review, study timer, and domain mastery analytics
- **Works offline** — no internet required once installed, no API keys needed
- **Is completely free and self-hosted** — runs locally with `npm run dev`

---

## ✨ Features

| View                  | Description                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **📚 Learn**          | Structured curriculum across all 5 AIF-C01 domains with "Why This Matters" exam callouts                              |
| **🔧 Services**       | Deep-dive on 20+ AWS AI services (Bedrock, SageMaker AI, Rekognition, Comprehend, etc.) with side-by-side comparisons |
| **🎯 Practice**       | Topic/domain-focused practice sessions with instant feedback and explanations                                         |
| **📝 Exam Simulator** | Full 65-question timed simulation matching official blueprint weights (20/24/28/14/14%)                               |
| **🔁 Review**         | Spaced repetition system — prioritizes questions you got wrong or haven't reviewed                                    |
| **📊 Progress**       | Visual analytics: domain mastery, study heatmap, daily study timer, weak-topic detection                              |
| **⚙️ Settings**       | Dark/light theme, data export/import, exam weight customization, progress reset                                       |

---

## 🛠 Tech Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Framer Motion** for animations
- **Lucide React** for icons
- **LocalStorage** for persistence (no backend required)
- **ESLint + TypeScript** for code quality

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (tested on 20/22)

### Installation

```bash
# Clone & enter directory
cd AWS-AIF-C01

# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev
```

### Other Commands

```bash
npm run build      # Production build to ./dist
npm run preview    # Preview production build locally
npm run lint       # Type-check with TypeScript
npm run clean      # Remove build artifacts
```

---

## ☁️ Deploying to Vercel

This app is a fully static SPA — no server, database, or API keys required. Every push to `main` redeploys automatically once the GitHub repo is connected.

### One-time setup

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select the repo.
3. Vercel reads [`vercel.json`](./vercel.json), so the defaults are already correct:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Click **Deploy**. No environment variables are needed.

### What `vercel.json` does

| Setting             | Purpose                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `rewrites`          | Sends any unknown path to `index.html` so client-side navigation never 404s.                |
| `headers`           | Caches `dist/assets/*` for 1 year (`immutable`) — safe because filenames are content-hashed. |

### Notes

- **Hobby plan is for personal / non-commercial use only** ([Vercel ToS §4](https://vercel.com/legal/terms)). Free tier includes 100 GB fast data transfer and 1M CDN requests per month.
- `.vercel/` (CLI local state) and `dist/` are gitignored — never commit build output.

---

## 📁 Project Structure

```
src/
├── components/       # React components (views + UI)
│   ├── DashboardView.tsx
│   ├── LearnView.tsx
│   ├── ServicesView.tsx
│   ├── PracticeView.tsx
│   ├── ExamSimulatorView.tsx
│   ├── ReviewView.tsx
│   ├── ProgressView.tsx
│   ├── SettingsView.tsx
│   ├── Layout.tsx
│   └── GlobalSearchModal.tsx
├── data/             # Static curriculum & question data
│   ├── lessons/      # 5 domains × multiple lessons each
│   ├── questions/    # 520+ practice questions (5 domains × 2 parts)
│   ├── awsServices.ts
│   └── examBlueprint.ts
├── types/            # TypeScript types
├── utils/            # Storage, analytics, exam engine
└── App.tsx           # Root component + routing logic
```

---

## 📖 Exam Coverage (AIF-C01)

| Domain                                   | Weight | Topics                                                    |
| ---------------------------------------- | ------ | --------------------------------------------------------- |
| **1. Fundamentals of AI and ML**         | 20%    | AI/ML concepts, use cases, SageMaker AI basics            |
| **2. Fundamentals of Generative AI**     | 24%    | GenAI concepts, RAG, Bedrock, AWS AI chips                |
| **3. Applications of Foundation Models** | 28%    | Bedrock vs SageMaker, model selection, prompt engineering |
| **4. Guidelines for Responsible AI**     | 14%    | Fairness, explainability, Guardrails, SageMaker Clarify   |
| **5. Security, Compliance & Governance** | 14%    | IAM, KMS, VPC, Shared Responsibility, GenAI threats       |

---

## 📝 License

MIT — Free to use, modify, and share for your own exam prep.

---

> **Disclaimer**: This is an independent study tool. Not affiliated with, endorsed by, or sponsored by Amazon Web Services. All questions are original practice items — not official AWS exam questions.
