import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, googleLogin, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset())
    }
    if (isSuccess || user) {
      navigate('/');
      dispatch(reset())
    }
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const userData = { email, password }
    dispatch(login(userData))
  }

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      dispatch(googleLogin(credentialResponse.credential))
    } else {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-[#020617]'>
        <div className='h-12 w-12 rounded-full border-t-4 border-indigo-500 animate-spin'></div>
      </div>
    )
  }

  return (
    // Fixed: pt-28 ensures it starts below the fixed header. min-h-screen for safe scaling.
    <div className="min-h-screen w-full flex items-center justify-center no-scrollbar relative overflow-hidden font-sans px-4 pt-16 pb-10">
      
      {/* 🌌 Background Layer - Stays Fixed */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop')`, 
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
      </div>

      {/* 🎭 Compact Glass Card */}
      <div className='w-full max-w-[420px] relative z-10'>
        <div className='bg-slate-900/60 backdrop-blur-[35px] border border-white/10 p-7 sm:p-9 rounded-[2.5rem] shadow-2xl'>
          
          {/* Header Area */}
          <div className='text-center mb-6'>
            <div className='flex justify-center mb-3'>
              <div className='h-8 w-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5'>
                 <div className='h-1 w-1 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]'></div>
              </div>
            </div>
            <h1 className='text-3xl font-bold text-white tracking-tight leading-none'>
              Welcome back
            </h1>
            <p className='text-white/40 text-[10px] mt-2 uppercase tracking-[0.2em] font-black'>
              Sign in to Practise
            </p>
          </div>

          {/* Form Area */}
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black uppercase text-white/30 ml-2 tracking-widest'>Email</label>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange}
                className='w-full p-3.5 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-white/10' 
                placeholder='Enter email' 
                required 
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex justify-between items-center px-2'>
                <label className='text-[10px] font-black uppercase text-white/30 tracking-widest'>Password</label>
                <Link to="#" className="text-[9px] text-white/30 hover:text-white uppercase font-bold tracking-tighter transition-colors">Forgot?</Link>
              </div>
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange}
                className='w-full p-3.5 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-white/10' 
                placeholder='••••' 
                required 
              />
            </div>

            <button 
              type="submit" 
              className='w-full py-4 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-teal-400 hover:text-white transition-all duration-300 active:scale-[0.98] mt-2 shadow-lg'
            >
              Authorize
            </button>
          </form>

          {/* Social Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="mx-3 text-white/10 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Secure Login</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Google Auth - Optimized Height */}
          <div className="w-full flex justify-center transform scale-95 origin-center">
            <div className='w-full opacity-90 hover:opacity-100 transition-opacity'>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google login failed')}
                  theme="filled_blue"
                  size="large"
                  width="380" // Specific width for compactness
                  shape="pill"
                />
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-7 text-center">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              New here? <Link to="/register" className="text-white border-b border-white/20 hover:text-teal-400 hover:border-teal-400 transition-all ml-1">Register Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login