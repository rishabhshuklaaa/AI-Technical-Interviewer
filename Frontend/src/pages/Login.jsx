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
      <div className='flex justify-center items-center h-screen bg-[#090d16]'>
        <div className='h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin'></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-[#090d16] text-slate-100 font-sans flex items-center justify-center px-8 pt-16 overflow-hidden relative">
      
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT SIDE: Larger & Impactful Text */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div>
            <span className="text-indigo-400 font-bold text-sm tracking-widest uppercase block mb-3">
              AI Interview Coach
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight mb-4">
              Prepare Smarter. <br />
              <span className="text-indigo-400">Interview Better.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Practice real interview questions, improve your answers, and get instant AI-powered feedback.
            </p>
          </div>

          {/* Feature Bullet Points */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold text-base mt-0.5">✓</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Practice Real Interviews</h4>
                <p className="text-xs text-slate-400">Simulate technical interviews with coding and spoken questions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold text-base mt-0.5">✓</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Speak Your Answers Naturally</h4>
                <p className="text-xs text-slate-400">Answer using your voice and get AI-based evaluation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold text-base mt-0.5">✓</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Get Instant Feedback</h4>
                <p className="text-xs text-slate-400">Understand your strengths, mistakes, and areas to improve.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold text-base mt-0.5">✓</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Improve Your Interview Performance</h4>
                <p className="text-xs text-slate-400">Receive detailed reports with scores and personalized suggestions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold text-base mt-0.5">✓</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Experience a Real Interview Environment</h4>
                <p className="text-xs text-slate-400">Smart monitoring helps create a fair and realistic practice session.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Compact Auth Card */}
        <div className="lg:col-span-5 w-full max-w-sm mx-auto bg-[#111622] border border-slate-800 p-7 rounded-2xl shadow-xl">
          
          <div className='text-center mb-5'>
            <h2 className='text-xl font-semibold text-slate-100 tracking-tight'>
              Welcome Back
            </h2>
            <p className='text-slate-400 text-xs mt-1'>
              Sign in to start practicing
            </p>
          </div>

          <form onSubmit={onSubmit} className='space-y-3.5'>
            <div className='space-y-1'>
              <label className='text-xs text-slate-300 font-medium ml-0.5'>Email</label>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange}
                className='w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-600' 
                placeholder='Enter your email' 
                required 
              />
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between items-center px-0.5'>
                <label className='text-xs text-slate-300 font-medium'>Password</label>
                <Link to="#" className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors">Forgot?</Link>
              </div>
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange}
                className='w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-600' 
                placeholder='••••••••' 
                required 
              />
            </div>

            <button 
              type="submit" 
              className='w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-colors duration-200 mt-1 shadow-sm'
            >
              Sign In
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="mx-3 text-slate-500 text-[10px] uppercase tracking-wider font-medium">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              theme="filled_blue"
              size="medium"
              shape="pill"
            />
          </div>

          <div className="mt-5 text-center">
            <p className="text-slate-400 text-xs">
              Don't have an account? <Link to="/register" className="text-indigo-400 font-medium hover:underline ml-1">Register</Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Login