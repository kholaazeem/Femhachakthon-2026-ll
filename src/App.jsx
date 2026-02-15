import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './config/supabaseClient'; 
import Auth from './pages/Auth';
import LostFound from './pages/LostFound'; 
import Complaints from './pages/Complaints'; 
import Volunteers from './pages/Volunteers'; 
import Navbar from './components/Navbar'; // Navbar Import kiya

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <>
      {/* Agar user login hai, toh Navbar dikhao */}
      {session && <Navbar />}

      <Routes>
        {/* Auth Route */}
        <Route 
          path="/auth" 
          element={!session ? <Auth /> : <Navigate to="/" />} 
        />

        {/* Dashboard Route */}
        <Route 
          path="/" 
          element={session ? (
            <div className="container mt-4">
              <h1 className="fw-bold text-center mb-2" style={{ color: '#0057a8' }}>Saylani Mass IT Hub</h1>
              <p className="text-center text-muted mb-5">Welcome, {session.user.email}</p>
              
              <div className="row g-4 justify-content-center">
                
                {/* Card 1: Lost & Found */}
                <div className="col-md-4">
                  <div 
                    className="card p-4 shadow-sm border-0 h-100 text-center" 
                    style={{ cursor: 'pointer', transition: '0.3s', backgroundColor: '#f8f9fa' }}
                    onClick={() => navigate('/lost-found')}
                  >
                    <div className="display-4 mb-2">🔍</div>
                    <h5 className="fw-bold" style={{ color: '#66b032' }}>Lost & Found</h5>
                    <p className="text-muted small">Report lost items or find recovered ones.</p>
                  </div>
                </div>

                {/* Card 2: Complaints */}
                <div className="col-md-4">
                  <div 
                    className="card p-4 shadow-sm border-0 h-100 text-center"
                    style={{ cursor: 'pointer', transition: '0.3s', backgroundColor: '#f8f9fa' }} 
                    onClick={() => navigate('/complaints')}
                  >
                    <div className="display-4 mb-2">📝</div>
                    <h5 className="fw-bold" style={{ color: '#0057a8' }}>Complaints</h5>
                    <p className="text-muted small">Submit maintenance or facility issues.</p>
                  </div>
                </div>

                {/* Card 3: Volunteer Registration */}
                <div className="col-md-4">
                  <div 
                    className="card p-4 shadow-sm border-0 h-100 text-center"
                    style={{ cursor: 'pointer', transition: '0.3s', backgroundColor: '#f8f9fa' }} 
                    onClick={() => navigate('/volunteers')}
                  >
                    <div className="display-4 mb-2">🤝</div>
                    <h5 className="fw-bold" style={{ color: '#66b032' }}>Volunteer</h5>
                    <p className="text-muted small">Register for upcoming campus events.</p>
                  </div>
                </div>

              </div>
              {/* Logout button removed because it is now in Navbar */}
            </div>
          ) : <Navigate to="/auth" />} 
        />
        
        {/* Module Routes */}
        <Route 
          path="/lost-found" 
          element={session ? <LostFound /> : <Navigate to="/auth" />} 
        />

        <Route 
          path="/complaints" 
          element={session ? <Complaints /> : <Navigate to="/auth" />} 
        />

        <Route 
          path="/volunteers" 
          element={session ? <Volunteers /> : <Navigate to="/auth" />} 
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={session ? "/" : "/auth"} />} />
      </Routes>
    </>
  );
}

export default App;