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
from groq import Groq  # Make sure to run: pip install groq
import whisper
from pydub import AudioSegment

load_dotenv()

# Configuration
AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "phi3")
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "llama-3.1-8b-instant")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "local")  # Default to local

app = FastAPI(title="AI Interviewer Microservice", version="1.0")

# CORS Setup
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")

origins = [
    frontend_url,
    backend_url,
    "http://localhost:5173",
    "http://localhost:5000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client if in production
groq_client = None
if ENVIRONMENT == "production":
    if not GROQ_API_KEY:
        print("WARNING: Production environment detected but GROQ_API_KEY is missing!")
    else:
        groq_client = Groq(api_key=GROQ_API_KEY)

# Load Whisper Model
WHISPER_MODEL = None
try:
    print(f"Loading Whisper Model (tiny)...")
    WHISPER_MODEL = whisper.load_model("tiny")
    print("Whisper Model Loaded Successfully")
except Exception as e:
    print(f"Error while loading Whisper Model: {e}")

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

# Helper function to generate AI response based on environment
async def get_ai_response(system_prompt: str, user_prompt: str, json_mode: bool = False):
    """
    Switch between Ollama (Local) and Groq (Production)
    """
    if ENVIRONMENT == "production" and groq_client:
        # PRODUCTION: Use Groq Cloud API
        response_format = {"type": "json_object"} if json_mode else None
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=GROQ_MODEL_NAME,
            response_format=response_format,
            temperature=0.1 if json_mode else 0.6
        )
        return chat_completion.choices[0].message.content
    else:
        # LOCAL: Use Ollama
        format_type = "json" if json_mode else ""
        response = ollama.generate(
            model=OLLAMA_MODEL_NAME,
            prompt=user_prompt,
            system=system_prompt,
            format=format_type,
            options={"temperature": 0.1 if json_mode else 0.6, "num_ctx": 2048},
            keep_alive=-1
        )
        return response['response']

@app.get("/")
async def root():
    model = GROQ_MODEL_NAME if ENVIRONMENT == "production" else OLLAMA_MODEL_NAME
    return {"message": "Hello from AI Interviewer Microservice!", "environment": ENVIRONMENT, "model": model}

@app.post("/generate-questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionResquest):
    try:
        if request.interview_type == "coding-mix":
            coding_count = int(request.count * 0.2)
            oral_count = int(request.count) - coding_count
            instruction = (
                f"The first {coding_count} questions MUST be coding challenges requiring function implementation. "
                f"The remaining {oral_count} questions MUST be conceptual oral questions."
            )
        else:
            instruction = "All questions MUST be conceptual oral questions. No coding challenges."

        system_prompt = (
            "You are a professional technical interviewer. "
            "Task: Generate interview questions. No conversational text or numbering. "
            f"Crucial: {instruction} "
            "Output exactly one question per line."
        )

        user_prompt = f"Generate exactly {request.count} unique interview questions for a {request.level} level {request.role}."
        
        response_text = await get_ai_response(system_prompt, user_prompt)
        
        raw_text = response_text.strip()
        questions = [q.strip() for q in raw_text.split('\n') if q.strip()]
        
        model_name = GROQ_MODEL_NAME if ENVIRONMENT == "production" else OLLAMA_MODEL_NAME
        return QuestionResponse(questions=questions[:request.count], model_used=model_name)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        audio_in_memory = io.BytesIO(audio_bytes)
        audio_segment = AudioSegment.from_file(audio_in_memory)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            temp_audio_path = tmp.name
            audio_segment.export(temp_audio_path, format="mp3")
        
        if not WHISPER_MODEL:
            raise HTTPException(status_code=503, detail="Whisper Model is not loaded")
        
        result = WHISPER_MODEL.transcribe(temp_audio_path)
        os.remove(temp_audio_path)
        return {"transcription": result["text"].strip()}

    except Exception as e:
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    try:
        if request.question_type == "oral":
            assessment_instruction = (
                "Conceptual oral question. Focus purely on candidate's verbal explanation. "
                "Ignore any code blocks. "
                "CRITICAL: If input is nonsense or irrelevant, score 0."
            )
        else:
            assessment_instruction = (
                "Coding challenge. Evaluate logic and efficiency. "
                "CRITICAL: If code is empty or random characters, score 0."
            )
        
        system_prompt = (
            "You are a strict technical interviewer. Respond ONLY with a JSON object. "
            "Required keys: 'technicalScore' (0-100), 'confidenceScore' (0-100), 'aiFeedback', 'idealAnswer'. "
            "RULE: aiFeedback < 30 words, idealAnswer < 60 words. "
            f"Context: {assessment_instruction}"
        )
        
        user_prompt = (
            f"Role: {request.role}\n"
            f"Question: {request.question}\n"
            f"Level: {request.level}\n"
            f"Verbal Answer: {request.user_answer or 'No verbal answer provided'}\n"
            f"Code Answer: {request.user_code or 'No code provided'}\n"
        )

        response_text = await get_ai_response(system_prompt, user_prompt, json_mode=True)
        response_text = response_text.strip()

        try:
            evaluation_data = json.loads(response_text)
            # Ensure idealAnswer is a string
            if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'], str):
                evaluation_data['idealAnswer'] = json.dumps(evaluation_data['idealAnswer'])
            return EvaluationResponse(**evaluation_data)
        except json.JSONDecodeError:
            # Fallback for parsing errors
            fixed_text = re.sub(r'[\r\n\t]', ' ', response_text)
            evaluation_data = json.loads(fixed_text)
            return EvaluationResponse(**evaluation_data)

    except Exception as e:
        print(f"Evaluation Error: {e}")
        return EvaluationResponse(
            technicalScore=0, 
            confidenceScore=0, 
            aiFeedback="Evaluation failed due to a processing error.", 
            idealAnswer="N/A"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=AI_SERVICE_PORT)