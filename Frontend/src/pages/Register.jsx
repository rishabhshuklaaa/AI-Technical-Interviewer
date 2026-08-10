import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { register, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  })

  const { name, email, password, password2 } = formData
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) {
      toast.error(message)
      dispatch(reset())
    }
    if (isSuccess) {
      toast.success('User Registered Successfully')
      navigate('/')
      dispatch(reset())
    }
    if (user && !isSuccess) {
      navigate('/')
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
    if (password !== password2) {
      toast.error('Passwords do not match')
    } else {
      const userData = { name, email, password }
      dispatch(register(userData))
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

      {/* Main Container Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT SIDE: Matching Clean Text Section */}
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

        {/* RIGHT SIDE: Compact Register Card */}
        <div className="lg:col-span-5 w-full max-w-sm mx-auto bg-[#111622] border border-slate-800 p-7 rounded-2xl shadow-xl">
          
          <div className='text-center mb-5'>
            <h2 className='text-xl font-semibold text-slate-100 tracking-tight'>
              Create Account
            </h2>
            <p className='text-slate-400 text-xs mt-1'>
              Start your interview practice today
            </p>
          </div>

          <form onSubmit={onSubmit} className='space-y-3'>
            <div className='space-y-1'>
              <label className='text-xs text-slate-300 font-medium ml-0.5'>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={name} 
                onChange={onChange}
                className='w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-600' 
                placeholder='Enter your full name' 
                required 
              />
            </div>

            <div className='space-y-1'>
              <label className='text-xs text-slate-300 font-medium ml-0.5'>Email</label>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange}
                className='w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-600' 
                placeholder='user@example.com' 
                required 
              />
            </div>

            <div className='grid grid-cols-2 gap-2.5'>
              <div className='space-y-1'>
                <label className='text-xs text-slate-300 font-medium ml-0.5'>Password</label>
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
              <div className='space-y-1'>
                <label className='text-xs text-slate-300 font-medium ml-0.5'>Confirm</label>
                <input 
                  type="password" 
                  name="password2" 
                  value={password2} 
                  onChange={onChange}
                  className='w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-600' 
                  placeholder='••••••••' 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className='w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-colors duration-200 mt-2 shadow-sm'
            >
              Get Started
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-slate-400 text-xs">
              Already have an account? {' '}
              <Link to="/login" className="text-indigo-400 font-medium hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Register