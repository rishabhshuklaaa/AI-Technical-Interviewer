import uvicorn
import os
import io
import json
import tempfile
import re
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

# AI Model Libraries
import ollama
from groq import Groq
import whisper
from pydub import AudioSegment

load_dotenv()

# Configuration
AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "phi3")
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "llama-3.1-8b-instant")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "local")

app = FastAPI(title="AI Interviewer Microservice", version="1.0")

# CORS Setup
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
origins = [frontend_url, backend_url, "http://localhost:5173", "http://localhost:5000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global clients
groq_client = None
WHISPER_MODEL = None

if ENVIRONMENT == "production" and GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)

# Schemas
class QuestionResquest(BaseModel):
    role: str = "MERN Stack Developer"
    level: str = "Junior"
    count: int = 5
    interview_type: str = "coding-mix"

class QuestionResponse(BaseModel):
    questions: list[str]
    model_used: str

class EvaluationRequest(BaseModel):
    question: str
    question_type: str
    role: str
    level: str
    user_answer: Optional[str] = None
    user_code: Optional[str] = None

class EvaluationResponse(BaseModel):
    technicalScore: int
    confidenceScore: int
    aiFeedback: str
    idealAnswer: str

# --- HELPER: AI Response Switch ---
async def get_ai_response(system_prompt: str, user_prompt: str, json_mode: bool = False):
    if ENVIRONMENT == "production" and groq_client:
        response_format = {"type": "json_object"} if json_mode else None
        completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            model=GROQ_MODEL_NAME,
            response_format=response_format,
            temperature=0.1 if json_mode else 0.6
        )
        return completion.choices[0].message.content
    else:
        format_type = "json" if json_mode else ""
        response = ollama.generate(
            model=OLLAMA_MODEL_NAME, prompt=user_prompt, system=system_prompt,
            format=format_type, options={"temperature": 0.1 if json_mode else 0.6}
        )
        return response['response']

@app.get("/")
async def root():
    model = GROQ_MODEL_NAME if ENVIRONMENT == "production" else OLLAMA_MODEL_NAME
    return {"message": "Hello from AI Interviewer!", "env": ENVIRONMENT, "model": model}

@app.post("/generate-questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionResquest):
    try:
        if request.interview_type == "coding-mix":
            coding_count = int(request.count * 0.2)
            oral_oral = int(request.count) - int(coding_count)
            instruction = (
                f"The first {coding_count} questions MUST be coding challenge requiring function implementation. "
                f"The remaining {oral_oral} questions MUST be conceptual oral questions."
            )
        else:
            instruction = "All questions MUST be conceptual oral questions. Do Not generate any coding or implementation challenges."

        system_prompt = (
            "You are a professional technical interviewer. "
            "Task: Generate interview questions. No conversational text or numbering. "
            f"Crucial: {instruction} "
            "Output exactly one question per line. "
        )
        user_prompt = f"Generate exactly {request.count} unique interview questions for a {request.level} level {request.role}."
        
        response_text = await get_ai_response(system_prompt, user_prompt)
        questions = [q.strip() for q in response_text.strip().split('\n') if q.strip()]
        return QuestionResponse(questions=questions[:request.count], model_used=ENVIRONMENT)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        if ENVIRONMENT == "production" and groq_client:
            transcription = groq_client.audio.transcriptions.create(
                file=("input.mp3", audio_bytes), model="whisper-large-v3"
            )
            return {"transcription": transcription.text.strip()}
        else:
            global WHISPER_MODEL
            if not WHISPER_MODEL: WHISPER_MODEL = whisper.load_model("tiny")
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
                AudioSegment.from_file(io.BytesIO(audio_bytes)).export(tmp.name, format="mp3")
                result = WHISPER_MODEL.transcribe(tmp.name)
                os.remove(tmp.name)
                return {"transcription": result["text"].strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    try:
        if request.question_type == "oral":
            assessment_instruction = (
                "This is a conceptual oral question. Focus purely on candidate's verbal explanation. "
                "Ignore any code blocks. "
                "CRITICAL: If the transcript is empty, nonsense (e.g. 'blah blah'), score 0."
            )
        else:
            assessment_instruction = (
                "This is a coding challenge question. Evaluate the code logic and efficiency. "
                "CRITICAL: If the code is 'undefined', empty, or random characters, score 0."
            )

        system_prompt = (
            "You are a strict technical interviewer. Do NOT hallucinate positive reviews for bad input. "
            "RULE 1: If the answer is gibberish or irrelevant, return 'technicalScore':0 and 'confidenceScore':0. "
            "RULE 2: For 'idealAnswer', provide a clean Markdown string. "
            "LENGTH RULE: 'aiFeedback' must be under 30 words. 'idealAnswer' must be under 60 words. "
            f"Context: {assessment_instruction} "
            "Respond ONLY with a JSON object with keys: 'technicalScore', 'confidenceScore', 'aiFeedback', 'idealAnswer'."
        )
        
        user_prompt = (
            f"Role: {request.role}\nQuestion: {request.question}\nLevel: {request.level}\n"
            f"Verbal Answer: {request.user_answer or 'No verbal answer provided'}\n"
            f"Code Answer: {request.user_code or 'No code provided'}\n"
        )

        response_text = await get_ai_response(system_prompt, user_prompt, json_mode=True)
        
        try:
            data = json.loads(response_text.strip())
        except:
            fixed = re.sub(r'[\r\n\t]', ' ', response_text)
            data = json.loads(fixed)

        if 'idealAnswer' in data and not isinstance(data['idealAnswer'], str):
            data['idealAnswer'] = json.dumps(data['idealAnswer'])
            
        return EvaluationResponse(**data)
    except Exception as e:
        return EvaluationResponse(technicalScore=0, confidenceScore=0, aiFeedback="Evaluation error", idealAnswer="N/A")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000)) 
    uvicorn.run("main:app", host="0.0.0.0", port=port)