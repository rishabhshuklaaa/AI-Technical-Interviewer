# 🚀 AI Technical Interviewer

An intelligent, full-stack platform that simulates real-world technical interviews with AI-driven evaluation, strict proctoring, and actionable feedback.

---

## 🧠 Overview

**AI Technical Interviewer** is designed to help candidates prepare for real technical interviews by providing a realistic, monitored, and feedback-rich environment.

It combines **MERN stack + FastAPI + AI models** to deliver coding + oral interviews with strict anti-cheating mechanisms and detailed performance insights.

---

## ✨ Key Features

### 🔐 Authentication & User Management

* JWT-based secure login & signup
* User profile management (edit profile)

### 🎯 Custom Interview Setup

* Select job role (e.g., Frontend, Backend, etc.)
* Choose number of questions
* Supports both:

  * 💻 Coding questions
  * 🎤 Oral (spoken) questions

### 🎙️ Voice-Based Answering

* Integrated **Whisper model** via FastAPI
* Users can answer questions by speaking

### ⚡ Real-Time Communication

* Built using **Socket.IO** for seamless interaction

### 🛡️ Smart Proctoring System

* 🚫 Prevents copy-paste during interview
* 🚫 Detects tab switching
* ⚠️ Warning system:

  * 3+ violations → interview auto-terminated

### 🤖 AI Feedback System

* Provides:

  * Answer evaluation
  * Suggested improvements
  * Ideal answer guidance

### 📊 Report Generation

* Generates detailed performance reports
* Helps users understand strengths & weaknesses

---

## 🏗️ Tech Stack

### 🌐 Frontend

* React.js (Vite)
* Tailwind CSS

### 🧩 Backend (Main)

* Node.js
* Express.js
* MongoDB

### 🤖 AI Services

* FastAPI
* Ollama (LLM integration)
* Whisper (Speech-to-Text)

### 🔌 Real-Time

* Socket.IO

---

## 📂 Project Structure

```
AI_INTERVIEWER/
│
├── ai_services/        # FastAPI + AI models (Ollama, Whisper)
├── backend/            # Node.js + Express APIs
├── frontend/           # React application
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Technical-Interviewer.git
cd AI-Technical-Interviewer
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

### 3️⃣ Setup Frontend

```bash
cd ../frontend
npm install
```

### 4️⃣ Setup AI Services

```bash
cd ../ai_services
pip install -r requirements.txt
```

---

## ▶️ Run the Project

### Start Backend

```bash
cd backend
npm start
```

### Start Frontend

```bash
cd frontend
npm run dev
```

### Start AI Services

```bash
cd ai_services
uvicorn main:app --reload
```

---

## 🔒 Environment Variables

Create `.env` files in:

* backend
* frontend (if required)

Add necessary configs like:

* MongoDB URI
* JWT Secret
* API endpoints

---

## 💡 Why This Project Stands Out

* Combines **AI + Real-time systems + Proctoring**
* Simulates real interview pressure
* Goes beyond CRUD apps into **system-level thinking**
* Integrates **voice + LLM + monitoring** in one platform

---

## 🚧 Future Improvements

* Video proctoring (webcam monitoring)
* Multi-language interview support
* Company-specific interview patterns

---

## 👨‍💻 Author

Developed by **Rishabh Shukla**

---

## ⭐ If you found this project interesting, consider giving it a star!
