import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getSessionById } from '../features/sessions/sessionSlice';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, PointElement, LineElement);

const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const diff = new Date(end) - new Date(start);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
};

const sanitizeQuestionText = (text) => text.replace(/^\d+[\s\.\)]+/, '').trim();

const formatIdealAnswer = (text) => {
    try {
        if (!text) return "Pending evaluation.";
        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }
        if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
            const parsed = JSON.parse(cleanText);
            if (parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer) {
                return parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer;
            }
            const explanation = parsed.explanation || parsed.understanding || "";
            const code = parsed.code || parsed.codeExample || parsed.example || "";
            if (explanation || code) return `${explanation}\n\n${code}`.trim();
        }
        return text;
    } catch (e) { return text; }
};

function SessionReview() {
    const { sessionId } = useParams();
    const dispatch = useDispatch();
    const { activeSession, isLoading } = useSelector(state => state.sessions);

    useEffect(() => {
        dispatch(getSessionById(sessionId));
    }, [dispatch, sessionId]);

    if (isLoading) return (
        <div className="h-screen w-full bg-[#050509] flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Decoding Performance Data...</p>
        </div>
    );

    if (!activeSession || activeSession.status !== 'completed') {
        return (
            <div className="min-h-screen bg-[#050509] flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl">
                    <div className="text-4xl mb-6">⏳</div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Report Encrypting</h2>
                    <p className="text-white/40 mt-3 mb-8 font-medium text-sm">Our AI is still compiling your technical metrics. Please check back in a moment.</p>
                    <Link to="/" className="inline-block bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-teal-400 transition-all">Back to Command Center</Link>
                </div>
            </div>
        );
    }

    const { overallScore, metrics, role, level, questions, startTime, endTime } = activeSession;
    const finalMetrics = metrics || {};

    const barData = {
        labels: questions.map((_, i) => `Q${i + 1}`),
        datasets: [{
            label: 'Score',
            data: questions.map(q => q.technicalScore || 0),
            backgroundColor: questions.map(q => (q.technicalScore || 0) > 70 ? '#2dd4bf' : '#6366f1'),
            borderRadius: 20,
            barThickness: 12,
        }],
    };

    return (
        <div className="min-h-screen bg-[#050509] text-white font-sans pt-28 pb-20 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">

                {/* --- 🛰️ Header Section --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                            <span className="text-[9px] font-black uppercase text-teal-400 tracking-[0.2em]">Deployment Reviewed</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none uppercase">
                            {role} <span className="text-white/20 font-light block sm:inline">[{level}]</span>
                        </h1>
                    </div>
                    <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-teal-400 transition-colors">Close Report ×</Link>
                </div>

                {/* --- 📊 Metrics Grid (Bento Style) --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Overall Score', value: `${overallScore}%`, color: 'teal' },
                        { label: 'Tech Proficiency', value: `${finalMetrics.avgTechnical}%`, color: 'indigo' },
                        { label: 'Confidence Index', value: `${finalMetrics.avgConfidence}%`, color: 'slate' },
                        { label: 'Deployment Time', value: formatDuration(startTime, endTime), color: 'slate' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-xl group hover:border-white/20 transition-all">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-3xl sm:text-5xl font-black mt-3 tracking-tighter ${stat.color === 'teal' ? 'text-teal-400' : 'text-white'}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* --- 📉 Progress Chart --- */}
                <div className="bg-[#090912]/50 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[3rem] shadow-2xl">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Performance Waveform</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-teal-400"></div><span className="text-[9px] font-bold text-white/40 uppercase">Optimal</span></div>
                            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-indigo-500"></div><span className="text-[9px] font-bold text-white/40 uppercase">Standard</span></div>
                        </div>
                    </div>
                    <div className="h-64">
                        <Bar
                            data={barData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10 } } },
                                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10 } } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* --- 🤖 Answer Intelligence --- */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <span className="h-10 w-1 bg-teal-400 rounded-full"></span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Deep Analytics</h3>
                    </div>
                    
                    <div className="space-y-8">
                        {questions.map((q, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden hover:bg-white/[0.07] transition-all">
                                <div className="p-8 sm:p-12 space-y-10">

                                    {/* Header */}
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                        <div className="space-y-2 max-w-3xl">
                                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Question 0{index + 1}</span>
                                            <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                                                {sanitizeQuestionText(q.questionText)}
                                            </h4>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="px-5 py-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center min-w-[90px]">
                                                <p className="text-[8px] font-black text-teal-400/50 uppercase tracking-widest">Efficiency</p>
                                                <p className="text-lg font-black text-teal-400">{q.technicalScore}%</p>
                                            </div>
                                            <div className="px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center min-w-[90px]">
                                                <p className="text-[8px] font-black text-indigo-400/50 uppercase tracking-widest">Confidence</p>
                                                <p className="text-lg font-black text-indigo-400">{q.confidenceScore}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submissions */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">User Output</label>
                                        <div className="bg-[#020205]/60 rounded-[2rem] border border-white/5 overflow-hidden">
                                            {q.userSubmittedCode && q.userSubmittedCode !== "undefined" && (
                                                <div className="p-6 border-b border-white/5">
                                                    <pre className="text-xs font-mono text-teal-300/80 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                                        {q.userSubmittedCode}
                                                    </pre>
                                                </div>
                                            )}
                                            {q.userAnswerText && (
                                                <div className="p-6 text-sm text-white/50 italic leading-relaxed">
                                                    "{q.userAnswerText}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Review Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-2">AI Critique</label>
                                            <div className="bg-indigo-500/5 p-8 rounded-[2rem] text-sm text-indigo-200/70 border-l-4 border-indigo-500 leading-relaxed italic">
                                                {q.aiFeedback}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] ml-2">Recommended Pattern</label>
                                            <pre className="bg-[#050509] text-teal-100/40 p-8 rounded-[2rem] text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-white/5">
                                                {formatIdealAnswer(q.idealAnswer)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionReview;