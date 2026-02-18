import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // 1. useLocation add kiya
import { supabase } from './config/supabaseClient'; 

// Components
import Navbar from './components/Navbar'; 
import AnnouncementBanner from './components/AnnouncementBanner';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard'; 
import LostFound from './pages/LostFound'; 
import Complaints from './pages/Complaints'; 
import Volunteers from './pages/Volunteers'; 
import Admin from './pages/Admin'; 
import Landing from './pages/Landing'; 
import Profile from './pages/Profile'; 

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Current location pata karne ke liye (Taake Landing page par double Navbar na aaye)
  const location = useLocation(); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  // Helper: Check agar hum Landing page par hain
  const isLandingPage = location.pathname === '/';

  return (
    <>
      {/* Navbar aur Banner sirf tab dikhao jab:
         1. User Login ho (session)
         2. AUR hum Landing Page par NA hon (!isLandingPage)
         (Kyunke Landing page ka apna Header hai)
      */}
      {session && !isLandingPage && <Navbar />}
      {session && !isLandingPage && <AnnouncementBanner />}

      <Routes>
        
        {/* --- CHANGE 1: Root Route Hamesha Landing Page Hoga --- */}
        <Route path="/" element={<Landing />} />

        {/* --- CHANGE 2: Dashboard ka alag route bana diya --- */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/auth" />} 
        />

        {/* --- CHANGE 3: Auth Logic --- */}
        {/* Agar login nahi hai to Auth dikhao, agar hai to Dashboard bhejo */}
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />

        {/* --- Protected Routes --- */}
        {/* Ab agar user login nahi hai to '/auth' par bhejo, '/' par nahi */}
        <Route path="/lost-found" element={session ? <LostFound /> : <Navigate to="/auth" />} />
        <Route path="/complaints" element={session ? <Complaints /> : <Navigate to="/auth" />} />
        <Route path="/volunteers" element={session ? <Volunteers /> : <Navigate to="/auth" />} />
        <Route path="/admin" element={session ? <Admin /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />

        {/* Catch All: Koi ghalat link dale to Landing par bhej do */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  );
}

export default App;