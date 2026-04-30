import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom' 
import { toast } from 'react-toastify'
import { updateProfile, reset } from '../features/auth/authSlice'

const ROLES = [
  "MERN Stack Developer", "MEAN Stack Developer", "Full Stack Python", "Full Stack Java",
  "Frontend Developer", "Backend Developer", "Data Scientist", "Data Analyst",
  "Machine Learning Engineer", "DevOps Engineer", "Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer", "Blockchain Developer", "Mobile Developer (iOS/Android)",
  "Game Developer", "UI/UX Designer", "QA Automation Engineer", "Product Manager"
];

const inputBase = 'w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium transition-all focus:ring-1 focus:ring-teal-500/50 focus:bg-white/10 outline-none placeholder:text-white/20 text-sm';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 2. Navigate initialize kiya

  const { user, isSuccess, isError, message, isProfileLoading } = useSelector((state) => state.auth);

  const fixedAvatar = "https://plus.unsplash.com/premium_photo-1734348383114-69bd3d9f8b79?q=80&w=996&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferredRole: user?.preferredRole || '',
  })

  useEffect(() => {
    if (isError) {
      toast.error(message)
      dispatch(reset())
    }

    if (isSuccess) {
      toast.success('Profile Updated Successfully')
      dispatch(reset())
      navigate('/') 
    }
  }, [isError, isSuccess, message, dispatch, navigate])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        preferredRole: user?.preferredRole || '',
      });
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name === user.name && formData.preferredRole === user.preferredRole) {
      
      navigate('/') 
      return
    }
    dispatch(updateProfile(formData))
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans text-white pt-32 pb-20 px-4 no-scrollbar">
      
      {/* 🔮 Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px]"></div>
      </div>

      <div className='w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700'>
        <div className='bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl'>
          
          <header className='flex flex-col sm:flex-row items-center gap-6 mb-12 border-b border-white/5 pb-10'>
            <div className='relative group'>
              <div className='absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500'></div>
              <img 
                src={fixedAvatar} 
                alt="Profile Avatar" 
                className='relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-800 rounded-3xl border border-white/10 p-1 shadow-2xl object-cover'
              />
            </div>
            <div className='text-center sm:text-left'>
              <h1 className='text-3xl sm:text-4xl font-black text-white tracking-tighter leading-tight'>
                Account <span className='text-teal-400'>Space</span>
              </h1>
              <p className='text-white/40 mt-1 text-sm font-medium tracking-wide'>
                Professional details & preferences
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className='space-y-7'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <FormField label="Full Name">
                <input
                  type="text"
                  className={inputBase}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Practice Name'
                />
              </FormField>

              <FormField label="Email (Fixed)" muted>
                <input
                  type="email"
                  className='w-full bg-white/5 border border-white/5 text-white/20 rounded-2xl p-4 text-sm font-medium cursor-not-allowed'
                  disabled
                  value={formData.email}
                />
              </FormField>
            </div>

            <FormField label="Target Professional Role">
              <div className='relative'>
                <select 
                  name="preferredRole" 
                  value={formData.preferredRole} 
                  onChange={handleChange} 
                  className={`${inputBase} appearance-none cursor-pointer`}
                >
                  <option value="" disabled className='bg-slate-900'>Select a role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role} className='bg-slate-900'>{role}</option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </FormField>

            <div className='pt-6'>
              <button
                type='submit'
                disabled={isProfileLoading}
                className={`w-full py-4.5 font-black text-[11px] uppercase tracking-[0.2em] rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl ${
                  isProfileLoading 
                  ? 'bg-slate-800 text-slate-500 cursor-wait' 
                  : 'bg-white text-black hover:bg-teal-400 hover:text-black hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]'
                }`}
              >
                {isProfileLoading ? <Loader /> : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile

// Helper components same as before...
function FormField({ label, children, muted }) {
  return (
    <div className={`space-y-2 ${muted ? 'opacity-50' : ''}`}>
      <label className='ml-3 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]'>{label}</label>
      {children}
    </div>
  )
}

function SelectArrow() {
  return (
    <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20'>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function Loader() {
  return (
    <>
      <span className='w-4 h-4 border-2 border-slate-500 border-t-transparent animate-spin rounded-full' />
      <span>Updating Identity...</span>
    </>
  )
}