import React , { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import useSocket from './hooks/useSocket';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import InterviewRunner from './pages/InterviewRunner';
import SessionReview from './pages/SessionReview';
import NotFound from './pages/NotFound';

const App = () => {
  useSocket();

  // 2. Wake-up Logic implement karo
  useEffect(() => {
    const wakeUp = async () => {
      const backendUrl = "https://ai-interviewer-backend-ptp0.onrender.com/";
      const aiServiceUrl = "https://ai-technical-interviewer-services.onrender.com/";
      
      try {
        console.log("Initiating background wake-up for Render services...");
        // 'no-cors' use kar rahe hain taaki opaque response mile aur error na aaye
        await Promise.all([
          fetch(backendUrl, { mode: 'no-cors' }),
          fetch(aiServiceUrl, { mode: 'no-cors' })
        ]);
      } catch (err) {
        console.log("Ping sent, services spinning up...");
      }
    };

    wakeUp();
  }, []);
  return (
    <div className='min-h-screen bg-[#050509] w-full overflow-x-hidden'>
      <Header />
      <main className='w-full'>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<PrivateRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/interview/:sessionId' element={<InterviewRunner />} />
            <Route path="/review/:sessionId" element={<SessionReview />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>

      </main>
      <ToastContainer position='top-right' autoClose={3000}/>

    </div>
  )
}

export default App