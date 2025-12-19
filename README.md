# 🤖 AI Live Chat Agent

A mini full-stack web app that simulates a customer support chat widget powered by an AI agent.

The app lets users chat with an AI support agent, persists conversations, and answers questions using domain knowledge of a fictional e-commerce store.

---

## ✨ Features

* 💬 Live chat UI (user vs AI messages)
* 🧠 AI agent powered by LLM (Groq + Llama3)
* 🗂️ Conversation & message persistence (PostgreSQL)
* 🔁 Session-based chat history
* ⚙️ Robust backend with validation & error handling
* 🎨 Simple, clean frontend UX
* 🔐 No secrets committed

---

## 🧱 Tech Stack

**Backend**

* Node.js + TypeScript
* Express
* Prisma ORM
* PostgreSQL (hosted on Render)
* Zod for validation

**Frontend**

* SvelteKit
* TypeScript

**LLM**

* Groq API (Llama3-8B)

---

## 📁 Project Structure

```
ai-chat/
├── backend/
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/   # LLM integration
│   │   ├── db/         # Prisma client
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── prisma.config.ts
│   └── .env
│
├── frontend/
│   └── src/routes/+page.svelte
│
└── README.md
```

---

## 🚀 How to Run Locally

### ✅ Prerequisites

* Node.js ≥ 18
* npm
* A PostgreSQL DB (Render used here)
* Groq API key

---

### 1️⃣ Clone Repo

```bash
git clone https://github.com/tangentveil/ai-chat-groq.git
cd ai-chat-groq
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
GROQ_API_KEY=your_groq_api_key
```

> Use the **External Database URL** from Render and ensure `?sslmode=require` is present.

---

### 3️⃣ Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

(Optional) Open Prisma Studio:

```bash
npx prisma studio
```

---

### 4️⃣ Start Backend

```bash
npm run dev
```

Backend runs on:
👉 [http://localhost:4000](http://localhost:4000)

---

### 5️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:
👉 [http://localhost:5173](http://localhost:5173)

---

### 6️⃣ Open App

Visit:

```
http://localhost:5173
```

Start chatting with the AI agent!

---

## 🔌 API

### `POST /chat/message`

**Request**

```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid"
}
```

**Response**

```json
{
  "reply": "We offer a 7-day return window...",
  "sessionId": "uuid"
}
```

---

## 🗄️ Database Schema

```prisma
model Conversation {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  messages  Message[]
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  sender         Sender
  text           String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
}

enum Sender {
  user
  ai
}
```

---

## 🧠 LLM Integration

**Provider:** Groq
**Model:** `openai/gpt-oss-20b`

Chosen because:

* Free tier
* Very fast inference
* OpenAI-compatible chat API

**Prompting Strategy:**

* System prompt defines agent as helpful e-commerce support bot
* Hardcoded FAQ knowledge:

  * Shipping policy
  * Returns & refunds
  * Support hours
* Last ~10 messages included as context

**Guardrails:**

* Token cap (`max_tokens: 300`)
* Low temperature for concise replies
* Graceful fallback on API errors

---

## 🏗️ Architecture Overview

**Backend layers:**

* `routes/` → HTTP handling & validation
* `services/` → LLM logic
* `db/` → Prisma client
* Clear separation of concerns

**Flow:**

1. Frontend sends message
2. Backend validates input
3. Conversation fetched/created
4. Message persisted
5. LLM called with history + prompt
6. AI reply stored & returned

**Extensibility:**

* Easy to plug new channels (WhatsApp, IG, etc.) by reusing services
* LLM logic isolated in one service
* DB schema supports multi-session chats

---

## 🛡️ Robustness

* Input validation with Zod
* Empty/long messages blocked
* LLM failures handled gracefully
* No backend crashes on bad input
* Secrets via env vars only

---

## 🎨 UX Notes

* Auto-scroll chat
* Clear user vs AI styling
* Disabled send during request
* “Agent is typing…” indicator
* Session persisted in `localStorage`

---

## 🧪 Known Limitations

* No authentication
* No admin tools / dashboard
* No streaming responses
* Minimal styling

---

## 🧾 Trade-offs

* Used Groq instead of OpenAI due to free access
* Hardcoded FAQ for speed instead of vector DB
* Remote Postgres used even for local dev for simplicity
* Simple Express server instead of full framework

---

## 🙌 Author

Built by **Anirudha Rajodiya**.