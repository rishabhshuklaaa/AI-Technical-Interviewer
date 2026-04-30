import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout, reset } from "../features/auth/authSlice"

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  }

  const isActive = (path) => location.pathname === path;

  return (
    // 'fixed top-0 left-0 w-full' ensures it sticks to the very top edges
    <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-300">
      {/* ✨ Glassmorphic Header with Backdrop Blur and Border */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* 🚀 Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-gradient-to-br from-indigo-500 to-teal-400 p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-white">
              AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">INTERVIEWER</span>
            </span>
          </Link>

          {/* 💻 Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
              <Link to="/" className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive('/') ? 'text-teal-400' : 'text-white/60 hover:text-white'}`}>Dashboard</Link>
              <Link to="/profile" className={`p-2 rounded-xl transition-all duration-300 ${isActive('/profile') ? 'bg-teal-500/20 text-teal-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}title="Profile Settings">
              <svg 
                    className={`w-5 h-5 ${isActive('/profile') ? 'animate-[spin_4s_linear_infinite]' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24">
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
          </Link>
                <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{user.name.split(' ')[0]}</span>
                </div>

                <button 
                  onClick={onLogout} 
                  className="bg-red-700 text-black text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-full hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/login" className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive('/login') ? 'text-teal-400' : 'text-white/60 hover:text-white'}`}>Login</Link>
                <Link to="/register" className="bg-white text-black text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-full hover:bg-white/90 transition-all active:scale-95 shadow-xl">Register</Link>
              </div>
            )}
          </nav>

          {/* 📱 Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 📱 Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-2xl border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-8 space-y-6">
              {user ? (
                <>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-widest text-white">{user.name}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                  </div>
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className={`block text-lg font-black uppercase tracking-[0.2em] ${isActive('/') ? 'text-teal-400' : 'text-white/60'}`}>Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className={`block text-lg font-black uppercase tracking-[0.2em] ${isActive('/profile') ? 'text-teal-400' : 'text-white/60'}`}>Profile</Link>
                  <button onClick={onLogout} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Logout</button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`block py-4 border border-white/10 rounded-xl font-black uppercase tracking-[0.2em] ${isActive('/login') ? 'text-teal-400' : 'text-white/60'}`}>Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block py-4 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em]">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header