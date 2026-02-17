import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading Profile...</div>;
  if (!user) return <div className="text-center mt-5">Please Login to view Profile</div>;

  // Metadata se values nikalna (Image, Name, Phone)
  const { full_name, avatar_url, phone } = user.user_metadata || {};

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
          
          {/* Avatar / Photo Section */}
          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-white border border-3 border-success overflow-hidden" 
               style={{ width: '120px', height: '120px' }}>
            
            {avatar_url ? (
              // Agar Image hai to ye dikhao
              <img 
                src={avatar_url} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              // Agar Image nahi hai to Placeholder dikhao
              <span className="display-4 text-secondary">👤</span>
            )}

          </div>

          {/* Name & Badge */}
          <h3 className="fw-bold text-dark text-capitalize">
            {full_name || "Student Name"}
          </h3>
          <span className="badge bg-success px-3 py-2 mb-3">Verified Student</span>

          <hr />

          {/* Details Section */}
          <div className="text-start mt-4 small">
            <p className="mb-2"><strong>📧 Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>📞 Phone:</strong> {phone || "N/A"}</p>
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
            style={{ height: '35px', opacity: '0.6' }} 
          />
          <div className="small text-muted mt-1" style={{ fontSize: '10px' }}>SMIT-{user.id.slice(0, 8).toUpperCase()}</div>
        </div>

      </div>
    </div>
  );
};

export default Profile;