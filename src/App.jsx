import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './config/supabaseClient'; 

// Components
import Navbar from './components/Navbar'; 
import AnnouncementBanner from './components/AnnouncementBanner'; // 1. Import kiya

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
  
  useEffect(() => {
    // 1. Check Session
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

  return (
    <>
      {/* Agar user login hai, toh Navbar aur Announcement dikhao */}
      {session && <Navbar />}
      
      {/* 2. Ye component khud check karega ke notice hai ya nahi */}
      {session && <AnnouncementBanner />}

      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />

        {/* --- MAIN ROUTE --- */}
        {/* Login ? Dashboard : Landing Page */}
        <Route 
          path="/" 
          element={session ? <Dashboard session={session} /> : <Landing />} 
        />
        
        {/* --- PROTECTED ROUTES --- */}
        {/* Agar session nahi hai to wapis Landing Page (/) par bhejo */}
        <Route path="/lost-found" element={session ? <LostFound /> : <Navigate to="/" />} />
        <Route path="/complaints" element={session ? <Complaints /> : <Navigate to="/" />} />
        <Route path="/volunteers" element={session ? <Volunteers /> : <Navigate to="/" />} />
        <Route path="/admin" element={session ? <Admin /> : <Navigate to="/" />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/" />} />

        <Route path="*" element={<Navigate to={session ? "/" : "/"} />} />
      </Routes>
    </>
  );
}

export default App;