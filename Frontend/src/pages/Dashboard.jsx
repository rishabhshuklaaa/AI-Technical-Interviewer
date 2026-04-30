import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createSession, getSessions, reset, deleteSession } from '../features/sessions/sessionSlice'
import { toast } from 'react-toastify'
import SessionCard from "../components/SessionCard"

const ROLES = [
  "MERN Stack Developer", "MEAN Stack Developer", "Full Stack Python", "Full Stack Java",
  "Frontend Developer", "Backend Developer", "Data Scientist", "Data Analyst",
  "Machine Learning Engineer", "DevOps Engineer", "Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer", "Blockchain Developer", "Mobile Developer (iOS/Android)",
  "Game Developer", "UI/UX Designer", "QA Automation Engineer", "Product Manager"
];
const LEVELS = ["Junior", "Mid-Level", "Senior"];
const TYPES = [{ label: 'Oral only', value: 'oral-only' }, { label: 'Coding Mix', value: 'coding-mix' }];
const COUNTS = [5, 10, 15];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sessions, isLoading, isGenerating, isError, message } = useSelector((state) => state.sessions);
  const isProcessing = isGenerating;

  const [formData, setFormData] = useState({
    role: user?.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (isProcessing || isGenerating) return;
    dispatch(createSession(formData));
  }

  const viewSession = (session) => {
    if (session.status === 'completed') {
      navigate(`/review/${session._id}`);
    } else if (session.status === 'in-progress') {
      navigate(`/interview/${session._id}`);
    } else {
      toast.info('AI is still preparing your session...');
    }
  }

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session?')) {
      dispatch(deleteSession(sessionId));
      toast.error('Session Deleted');
    }
  }

  return (
    // ✨ Full Screen Immersive Layout
    <div className="min-h-screen w-full relative overflow-hidden font-sans text-white pt-28 pb-12 px-4 no-scrollbar">
      
      {/* 🌌 Fixed Immersive Background Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105"
        style={{ 
          // Image choice: Sophisticated Dark Nature vibe
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop')`, 
        }}
      >
        {/* Dark subtle blend overlay - very important for contrast */}
        <div className="absolute inset-0 bg-[#050509]/70 backdrop-brightness-75"></div>
      </div>

      {/* 🔮 Pulse Light effects behind content (Subtle) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12 animate-in fade-in duration-700">
        
        {/* 👋 Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-inner">
              <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-ping mr-2.5"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Candidate Hub</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-indigo-300">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-white/70 font-medium text-lg sm:text-xl">Practice smart. Crush your technicals.</p>
          </div>
          
          {/* Frosted Stat Capsules */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-3xl border border-white/10 p-5 rounded-[2.2rem] min-w-[150px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <p className="text-[10px] font-bold uppercase text-white/50 tracking-widest mb-1">Practiced</p>
              <p className="text-3xl font-black text-white">{sessions?.length || 0}<span className="text-sm font-black text-white/50 ml-1">sessions</span></p>
            </div>
            
          </div>
        </div>

        {/* 🛠️ Modern "Session Configuration" Control Center */}
        <div className="relative group">
          {/* Subtle Outer Neon Glow on Hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative bg-[#090912]/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/30">
            <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
              <div className="h-2.5 w-2.5 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/90">AI Session Configuration</h2>
            </div>
            
            <form onSubmit={onSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1.5">Target Role</label>
                <select name="role" value={formData.role} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-full p-4 text-sm font-bold text-white focus:ring-1 focus:ring-white/30 outline-none transition-all appearance-none cursor-pointer">
                  {ROLES.map((role) => <option key={role} value={role} className="bg-slate-900">{role}</option>)}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1.5">Complexity</label>
                <select name="level" value={formData.level} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-full p-4 text-sm font-bold text-white focus:ring-1 focus:ring-white/30 outline-none cursor-pointer">
                  {LEVELS.map((level) => <option key={level} value={level} className="bg-slate-900">{level}</option>)}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1.5">Length</label>
                <select name="count" value={formData.count} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-full p-4 text-sm font-bold text-white focus:ring-1 focus:ring-white/30 outline-none cursor-pointer">
                  {COUNTS.map((count) => <option key={count} value={count} className="bg-slate-900">{count} Questions</option>)}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1.5">Format</label>
                <select name="interviewType" value={formData.interviewType} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-full p-4 text-sm font-bold text-white focus:ring-1 focus:ring-white/30 outline-none cursor-pointer">
                  {TYPES.map((type) => <option key={type.value} value={type.value} className="bg-slate-900">{type.label}</option>)}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing} 
                className={`group w-full py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-white text-black hover:bg-teal-400 hover:shadow-teal-500/20'}`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                    AI is preparing...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Launch Practise <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 📊 Immersive Logs Section */}
        <div className="space-y-7 pb-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3.5 uppercase text-white/80 tracking-[0.1em]">
              <span className="h-6 w-1 bg-indigo-500 rounded-full"></span>
              Performance Logs
            </h2>
          </div>

          {isLoading && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 space-y-5">
              <div className="animate-spin h-12 w-12 border-4 border-white/5 border-t-indigo-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Syncing Session Data...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-3xl border-2 border-dashed border-white/10 rounded-[2.5rem] py-28 text-center shadow-xl">
              <div className="text-5xl mb-6 opacity-20">📂</div>
              <p className="text-white/40 font-black uppercase tracking-[0.2em] text-xs">Awaiting Initial Session</p>
              <p className="text-slate-500 text-sm mt-3">Use the Configuration panel above to launch your first AI interview practice.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {/* Note: Ensure SessionCard is also updated to use backdrop-blur/transparent theme */}
              {sessions.slice().reverse().map((session) => (
                <SessionCard key={session._id} session={session} onClick={viewSession} onDelete={handleDelete}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Dashboard