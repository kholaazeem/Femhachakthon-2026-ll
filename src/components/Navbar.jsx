import React, { useState, useEffect } from 'react'; // 1. useState, useEffect import kiya
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false); // 2. Admin State

  // 3. Admin Check Logic
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Yahan apna Admin Email likhein
      if (user?.email === 'admin@gmail.com') { 
        setIsAdmin(true);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-lg sticky-top" 
         style={{ background: 'linear-gradient(90deg, #0057a8 0%, #004080 100%)' }}>
      
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to="/">
          <span style={{ color: '#66b032' }} className="me-2">⚡</span> 
          Saylani IT Hub
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-lg-3">
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/') ? 'active fw-bold text-white border-bottom border-2 border-success' : 'text-white-50'}`} 
                to="/"
              >
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/lost-found') ? 'active fw-bold text-white border-bottom border-2 border-success' : 'text-white-50'}`} 
                to="/lost-found"
              >
                Lost & Found
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/complaints') ? 'active fw-bold text-white border-bottom border-2 border-success' : 'text-white-50'}`} 
                to="/complaints"
              >
                Complaints
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/volunteers') ? 'active fw-bold text-white border-bottom border-2 border-success' : 'text-white-50'}`} 
                to="/volunteers"
              >
                Volunteers
              </Link>
            </li>

            {/* 4. Sirf Admin ko ye Link nazar aayega */}
            {isAdmin && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/admin') ? 'active fw-bold text-warning border-bottom border-2 border-warning' : 'text-warning'}`} 
                  to="/admin"
                >
                  Admin Panel
                </Link>
              </li>
            )}

            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <button 
                className="btn text-white fw-bold px-4 rounded-pill shadow-sm" 
                style={{ backgroundColor: '#66b032', transition: '0.3s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#559428'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#66b032'}
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;