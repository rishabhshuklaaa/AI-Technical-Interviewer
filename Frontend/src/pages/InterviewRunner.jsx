import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, submitAnswer, endSession } from '../features/sessions/sessionSlice';
import MonacoEditor from '@monaco-editor/react';
import { toast } from 'react-toastify';

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' }, { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' }, { label: 'C++', value: 'cpp' },
  { label: 'SQL', value: 'sql' }, { label: 'TypeScript', value: 'typescript' }
];

const ROLE_LANGUAGE_MAP = {
  "MERN Stack Developer": "javascript", "Backend Developer": "javascript",
  "Data Scientist": "python", "Machine Learning Engineer": "python"
};

function InterviewRunner() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeSession, isLoading, message } = useSelector(state => state.sessions);
  const [warningCount, setWarningCount] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [submittedLocal, setSubmittedLocal] = useState({});
  const [drafts, setDrafts] = useState(() => {
    const saved = localStorage.getItem(`drafts_${sessionId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isSwitchingRef = useRef(false);

  useEffect(() => {
    if (activeSession?.role) {
      setSelectedLanguage(ROLE_LANGUAGE_MAP[activeSession.role] || "javascript");
    }
  }, [activeSession?.role]);

  useEffect(() => {
    localStorage.setItem(`drafts_${sessionId}`, JSON.stringify(drafts));
  }, [drafts, sessionId]);

  useEffect(() => {
    dispatch(getSessionById(sessionId));
  }, [dispatch, sessionId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isSwitchingRef.current) return;
        isSwitchingRef.current = true;
        setWarningCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            autoSubmitDueToBreach();
          } else {
            toast.error(`⚠️ Security Breach ${newCount}/3`, { position: "top-center", theme: "dark" });
          }
          return newCount;
        });
      } else {
        isSwitchingRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionId]);

  const currentQuestion = activeSession?.questions?.[currentQuestionIndex];
  const isQuestionLocked = currentQuestion?.isSubmitted === true || submittedLocal[currentQuestionIndex] === true;
  const isProcessing = isQuestionLocked && !currentQuestion?.isEvaluated;
  const currentDraft = drafts[currentQuestionIndex] || {};
  const isLastQuestion = activeSession?.questions ? currentQuestionIndex === activeSession.questions.length - 1 : false;

  const handleNavigation = (index) => {
    if (activeSession?.questions && index >= 0 && index < activeSession.questions.length) {
      if (isRecording) stopRecording();
      setCurrentQuestionIndex(index);
      setRecordingTime(0);
    }
  };

  const handleFinishInterview = () => {
    if (!window.confirm("Complete this interview session?")) return;
    dispatch(endSession(sessionId)).unwrap().then(() => {
      localStorage.removeItem(`drafts_${sessionId}`);
      navigate(`/review/${sessionId}`);
    }).catch(() => toast.error("Processing result..."));
  };

  const updateDraftCode = (newCode) => {
    if (isQuestionLocked) return;
    setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], code: newCode } }));
  };

  const startRecording = async () => {
    if (isQuestionLocked) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], audioBlob: blob }}));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) { toast.error("Mic denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (isQuestionLocked) return;
    if (isRecording) stopRecording();
    const draft = drafts[currentQuestionIndex];
    if (!draft?.code && !draft?.audioBlob) return toast.warning("Answer empty.");
    setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: true }));
    const formData = new FormData();
    formData.append('questionIndex', currentQuestionIndex);
    if (draft.code) formData.append('code', draft.code);
    if (draft.audioBlob) formData.append('audioFile', draft.audioBlob, 'answer.webm');
    dispatch(submitAnswer({ sessionId, formData })).unwrap().catch(() => {
      setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: false }));
    });
  };

  const autoSubmitDueToBreach = () => {
    dispatch(endSession(sessionId)).unwrap().then(() => { navigate('/'); });
  };

  if (!activeSession) return <div className="h-screen flex items-center justify-center bg-[#050509] text-white">Loading Engine...</div>;

  return (
    <div className="h-screen bg-[#050509] text-white font-sans flex flex-col overflow-hidden">
      
      {/* 🚀 FIXED HEADER */}
      <header className="h-16 border-b border-white/10 bg-[#090912] flex items-center justify-between px-6 shrink-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-teal-400 rounded-lg flex items-center justify-center font-black text-black">AI</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Session: {activeSession.role}</p>
        </div>

        <div className="flex items-center gap-2">
          {activeSession.questions.map((q, i) => (
            <div key={i} onClick={() => handleNavigation(i)} className={`h-1.5 w-6 rounded-full cursor-pointer transition-all ${i === currentQuestionIndex ? 'bg-teal-400' : q.isEvaluated ? 'bg-indigo-500' : (q.isSubmitted || submittedLocal[i]) ? 'bg-amber-400' : 'bg-white/10'}`} />
          ))}
        </div>

        <button 
          onClick={handleFinishInterview} 
          className="bg-rose-500/20 text-rose-500 border border-rose-500/40 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
        >
          Exit Interview
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Question Area */}
        <section className="w-1/3 border-r border-white/10 bg-[#050509] p-8 overflow-y-auto no-scrollbar">
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Module 0{currentQuestionIndex + 1}</p>
          <h2 className="text-xl font-bold leading-relaxed text-white/90 mb-8">{currentQuestion?.questionText}</h2>
          
          {currentQuestion?.isEvaluated && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-sm text-indigo-300 mb-8">
               <span className="block font-black text-[9px] uppercase mb-1 opacity-50 tracking-widest">AI Feedback</span>
               {currentQuestion.aiFeedback}
            </div>
          )}

          <div className="flex flex-col items-center py-6 border-t border-white/5">
            {!isRecording && !currentDraft.audioBlob ? (
              <button onClick={startRecording} disabled={isQuestionLocked} className="h-16 w-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-xl hover:bg-teal-400 hover:text-black transition-all disabled:opacity-10">🎤</button>
            ) : isRecording ? (
              <button onClick={stopRecording} className="h-16 w-16 bg-rose-500 rounded-full flex items-center justify-center animate-pulse">⏹</button>
            ) : (
              <div className="text-center">
                <p className="text-xs font-black text-teal-400 uppercase tracking-widest mb-2">Voice Captured</p>
                {!isQuestionLocked && <button onClick={() => setDrafts(p => ({...p, [currentQuestionIndex]: {...p[currentQuestionIndex], audioBlob: null}}))} className="text-[10px] text-white/30 uppercase font-black hover:text-rose-500">Reset</button>}
              </div>
            )}
          </div>
        </section>

        {/* Right: Code Lab */}
        <section className="flex-1 flex flex-col bg-[#020205]">
          <div className="h-10 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">IDE / Environment</span>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} disabled={isQuestionLocked} className="bg-transparent text-teal-400 text-[10px] font-black uppercase outline-none">
               {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-slate-900">{l.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <MonacoEditor height="100%" language={selectedLanguage} theme="vs-dark" value={currentDraft.code || ''} onChange={updateDraftCode} options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isQuestionLocked }} />
          </div>
        </section>
      </main>

      {/* 🚀 FIXED FOOTER */}
      <footer className="h-20 border-t border-white/10 bg-[#090912] flex items-center justify-between px-10 shrink-0 z-[100]">
        <button onClick={() => handleNavigation(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="text-[10px] font-black uppercase text-white/30 hover:text-white disabled:opacity-5">Previous</button>

        <div className="flex flex-col items-center">
          {isProcessing && <p className="text-[9px] text-teal-400 font-black animate-pulse mb-1 uppercase tracking-widest">Evaluating...</p>}
          
          {/* Final Logic: If last question is locked, show Complete Button */}
          {isLastQuestion && isQuestionLocked ? (
            <button 
              onClick={handleFinishInterview} 
              className="px-10 py-3 bg-teal-400 text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-full hover:bg-white shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
            >
              Finish Interview
            </button>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              disabled={isQuestionLocked}
              className={`px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.2em] transition-all ${isQuestionLocked ? 'bg-white/10 text-white/20' : 'bg-white text-black hover:bg-teal-400'}`}
            >
              {currentQuestion?.isEvaluated ? "Success" : isQuestionLocked ? "Locked" : "Submit Answer"}
            </button>
          )}
        </div>

        <button onClick={() => handleNavigation(currentQuestionIndex + 1)} disabled={isLastQuestion} className="text-[10px] font-black uppercase text-white/30 hover:text-white disabled:opacity-5">Next</button>
      </footer>
    </div>
  );
}

export default InterviewRunner;