import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Volunteers = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [event, setEvent] = useState('Tech Hackathon');
  const [availability, setAvailability] = useState('Morning Shift');

  // --- Fetch Data ---
  const fetchVolunteers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (user.email !== 'admin@gmail.com') {
      query = query.eq('user_email', user.email);
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }

    const { data, error } = await query;
    if (error) console.log('Error:', error);
    else setVolunteers(data || []);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // --- Submit Registration ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('volunteers').insert([{
      name, phone, event, availability, user_email: user.email 
    }]);

    setLoading(false);

    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Welcome Aboard!',
        text: 'You have successfully registered.',
        confirmButtonColor: '#198754'
      });
      setName(''); setPhone('');
      fetchVolunteers();
    }
  };

  // Helper for Event Icons
  const getEventIcon = (eventName) => {
    if (eventName.includes('Tech')) return '💻';
    if (eventName.includes('Sports')) return '🏏';
    if (eventName.includes('Milad')) return '🌙';
    if (eventName.includes('Cleanliness')) return '🧹';
    return '🤝';
  };

  // Helper for Shift Colors
  const getShiftBadge = (shift) => {
    if (shift.includes('Morning')) return 'bg-warning text-dark';
    if (shift.includes('Evening')) return 'bg-info text-dark';
    return 'bg-success text-white'; 
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* --- Header Section --- */}
      <div className="pt-5 pb-5 text-white text-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0057a8 0%, #003060 100%)', paddingBottom: '80px' }}>
        <h1 className="fw-bold display-5">🤝 Community Volunteers</h1>
        <p className="lead opacity-75">Join hands to make our campus events successful.</p>
      </div>

      {/* Container ko thora upar khincha hai (Negative Margin) */}
      <div className="container" style={{ marginTop: '-60px' }}>
        <div className="row g-4">
          
          {/* --- Left Side: Registration Form --- */}
          <div className="col-lg-4">
            <div className="card shadow-lg border-0 rounded-4 animate__animated animate__fadeInLeft">
              <div className="card-body p-4 bg-white rounded-4">
                
                <div className="text-center mb-4">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '28px' }}>
                    ❤️
                  </div>
                  <h4 className="fw-bold text-dark">Join a Team</h4>
                  <p className="text-muted small">Register yourself for an event.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Full Name</label>
                    <input className="form-control bg-light border-0 py-2" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ali Khan" />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Phone Number</label>
                    <input className="form-control bg-light border-0 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="0300-1234567" />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Choose Event</label>
                    <select className="form-select bg-light border-0 py-2" value={event} onChange={(e) => setEvent(e.target.value)}>
                      <option>Tech Hackathon</option>
                      <option>Annual Sports Day</option>
                      <option>Milad-un-Nabi</option>
                      <option>Campus Cleanliness Drive</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-secondary">Preferred Shift</label>
                    <select className="form-select bg-light border-0 py-2" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                      <option>Morning Shift (9AM - 1PM)</option>
                      <option>Evening Shift (2PM - 6PM)</option>
                      <option>Full Day</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="btn btn-lg w-100 fw-bold text-white shadow-sm" disabled={loading} style={{ backgroundColor: '#0057a8' }}>
                    {loading ? 'Registering...' : '✋ Count Me In!'}
                  </button>
                </form>

              </div>
            </div>
          </div>

          {/* --- Right Side: Volunteers List --- */}
          <div className="col-lg-8">
            
            {/* Header ko White Box mein dala taake saaf dikhay */}
            <div className="bg-white p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between mb-3 animate__animated animate__fadeInDown">
              <h5 className="fw-bold text-dark m-0 d-flex align-items-center">
                {isAdmin ? "📋 All Volunteers" : "🎫 My Event Passes"}
              </h5>
              <span className="badge bg-light text-dark border rounded-pill">{volunteers.length} Active</span>
            </div>

            <div className="row g-3">
              {volunteers.map((vol) => (
                <div className="col-md-6" key={vol.id}>
                  <div className="card h-100 border-0 shadow-sm card-hover-effect" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="card-body p-0 d-flex">
                      
                      {/* Left Strip (Updated: Light Green Background) */}
                      <div className="d-flex align-items-center justify-content-center" 
                           style={{ width: '85px', backgroundColor: '#e8f5e9', color: '#198754' }}>
                        <span className="display-6">{getEventIcon(vol.event)}</span>
                      </div>

                      {/* Right Content */}
                      <div className="p-3 w-100 position-relative">
                        {/* Status Dot */}
                        <div className="position-absolute top-0 end-0 m-2">
                           <span className="badge bg-success rounded-circle p-1 border border-white"> </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '85%' }}>{vol.event}</h6>
                        </div>
                        
                        <div className="mb-2">
                          <span className={`badge ${getShiftBadge(vol.availability)} rounded-pill`} style={{ fontSize: '0.65rem' }}>
                             {vol.availability.split(' ')[0]} Shift
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center pt-2 border-top">
                          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '25px', height: '25px' }}>
                            <small>👤</small>
                          </div>
                          <span className="text-muted fw-bold small text-truncate">{vol.name}</span>
                        </div>

                        {isAdmin && (
                          <div className="mt-1">
                            <small className="text-danger fw-bold" style={{ fontSize: '0.75rem' }}>
                              📞 {vol.phone}
                            </small>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {volunteers.length === 0 && (
                <div className="col-12 text-center py-5">
                  <div className="display-4 text-muted opacity-25">🌱</div>
                  <h5 className="text-muted mt-3">No registrations yet</h5>
                  <p className="text-muted small">Register for an event to see your pass here.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Volunteers;