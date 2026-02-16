import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  if (!user) return <div className="text-center mt-5">Loading Profile...</div>;

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg border-0" style={{ width: '400px', borderRadius: '15px' }}>
        
        {/* Card Header (Blue Design) */}
        <div className="card-header text-center text-white py-4" 
             style={{ background: 'linear-gradient(90deg, #0057a8 0%, #004080 100%)', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
          <h4 className="fw-bold mb-0">⚡ Saylani IT Hub</h4>
          <small>Student Identity Card</small>
        </div>

        {/* Card Body */}
        <div className="card-body text-center p-4">
          {/* Avatar / Photo Placeholder */}
          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light border border-3 border-success" 
               style={{ width: '100px', height: '100px' }}>
            <span className="display-4">👤</span>
          </div>

          <h3 className="fw-bold text-dark">{user.email.split('@')[0]}</h3>
          <span className="badge bg-success px-3 py-2 mb-3">Verified Student</span>

          <hr />

          <div className="text-start mt-4">
            <p className="mb-2"><strong>📧 Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>🎓 Batch:</strong> 2026</p>
            <p className="mb-2"><strong>🏫 Campus:</strong> Bahadurabad</p>
            <p className="mb-0"><strong>📅 Valid Till:</strong> Dec 2026</p>
          </div>
        </div>

        {/* Card Footer (Barcode Look) */}
        <div className="card-footer bg-light text-center py-3" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/EAN13.svg/1200px-EAN13.svg.png" 
            alt="Barcode" 
            style={{ height: '40px', opacity: '0.7' }} 
          />
        </div>

      </div>
    </div>
  );
};

export default Profile;