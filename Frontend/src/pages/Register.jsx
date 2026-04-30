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
      <div className='flex justify-center items-center h-screen bg-[#020617]'>
        <div className='h-12 w-12 rounded-full border-t-4 border-indigo-500 animate-spin'></div>
      </div>
    )
  }

  return (
    // 'no-scrollbar' class added here to hide scroller
    <div className="h-screen w-full flex items-center justify-center relative overflow-y-auto no-scrollbar font-sans pt-20 pb-10 px-4">
      
      {/* 🌌 Fixed Background Layer - Same as Login */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop')`, 
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
      </div>

      {/* 🎭 Compact Glass Card - Color Synced to Login */}
      <div className='w-full max-w-[480px] relative z-10'>
        <div className='bg-slate-900/60 backdrop-blur-[35px] border border-white/10 p-7 sm:p-9 rounded-[2.5rem] shadow-2xl'>
          
          <div className='text-center mb-5'>
            <div className='flex justify-center mb-3'>
               <div className='h-8 w-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5'>
                 <div className='h-1 w-1 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]'></div>
               </div>
            </div>
            <h1 className='text-3xl font-bold text-white tracking-tight leading-none'>
              Get Started
            </h1>
            <p className='text-white/40 text-[10px] mt-2 font-black uppercase tracking-[0.2em]'>
              Join the elite tech community
            </p>
          </div>

          <form onSubmit={onSubmit} className='space-y-3.5'>
            <div className='space-y-1'>
              <label className='text-[10px] font-black text-white/30 ml-2 uppercase tracking-widest'>Full Name</label>
              <input 
                type="text" name="name" value={name} onChange={onChange}
                className='w-full p-3.5 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-white/10' 
                placeholder='Rishabh Shukla' required 
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] font-black text-white/30 ml-2 uppercase tracking-widest'>Email</label>
              <input 
                type="email" name="email" value={email} onChange={onChange}
                className='w-full p-3.5 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-white/10' 
                placeholder='user@gmail.com' required 
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <label className='text-[10px] font-black text-white/30 ml-2 uppercase tracking-widest'>Password</label>
                <input 
                  type="password" name="password" value={password} onChange={onChange}
                  className='w-full p-3.5 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-white/10' 
                  placeholder='••••' required 
                />
              </div>
              <div className='space-y-1'>
                <label className='text-[10px] font-black text-white/30 ml-2 uppercase tracking-widest'>Confirm</label>
                <input 
                  type="password" name="password2" value={password2} onChange={onChange}
                  className='w-full p-3.5 bg-white/5 border border-white/10 text-white text-sm rounded-2xl focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-white/10' 
                  placeholder='••••' required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className='w-full py-4 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-teal-400 hover:text-white transition-all active:scale-[0.98] mt-4 shadow-xl'
            >
              Establish Identity
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              Existing user? {' '}
              <Link to="/login" className="text-white border-b border-white/20 hover:text-teal-400 hover:border-teal-400 transition-all ml-1">
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