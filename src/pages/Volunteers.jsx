import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Volunteers = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [event, setEvent] = useState('Tech Hackathon');
  const [availability, setAvailability] = useState('Morning Shift');

  // --- 1. Fetch Volunteers (Read) ---
  const fetchVolunteers = async () => {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.log('Error:', error);
    else setVolunteers(data);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // --- 2. Submit Registration (Create) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('volunteers').insert([{
      name,
      phone,
      event,
      availability,
      user_email: user.email
    }]);

    setLoading(false);

    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Registered Successfully!',
        text: 'Thank you for volunteering.',
        confirmButtonColor: '#66b032'
      });
      // Form Clear
      setName('');
      setPhone('');
      fetchVolunteers();
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#0057a8' }}>Volunteer Registration</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>

      <div className="row">
        {/* --- Section 1: Registration Form --- */}
        <div className="col-md-5 mb-4">
          <div className="card shadow-sm border-0" style={{ backgroundColor: '#f0f5fa' }}>
            <div className="card-body p-4">
              <h5 className="mb-3 fw-bold" style={{ color: '#66b032' }}>Join a Team</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Select Event</label>
                  <select className="form-select" value={event} onChange={(e) => setEvent(e.target.value)}>
                    <option>Tech Hackathon</option>
                    <option>Annual Sports Day</option>
                    <option>Milad-un-Nabi</option>
                    <option>Campus Cleanliness Drive</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold">Availability</label>
                  <select className="form-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option>Morning Shift (9AM - 1PM)</option>
                    <option>Evening Shift (2PM - 6PM)</option>
                    <option>Full Day</option>
                  </select>
                </div>
                <button type="submit" className="btn text-white w-100 fw-bold" disabled={loading} style={{ backgroundColor: '#0057a8' }}>
                  {loading ? 'Registering...' : 'Register Now'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- Section 2: Volunteers List (Admin View) --- */}
        <div className="col-md-7">
          <h4 className="mb-3">Registered Volunteers</h4>
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Event</th>
                      <th>Availability</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((vol) => (
                      <tr key={vol.id}>
                        <td className="fw-bold">{vol.name}</td>
                        <td><span className="badge bg-primary">{vol.event}</span></td>
                        <td>{vol.availability}</td>
                        <td className="text-muted small">{vol.phone}</td>
                      </tr>
                    ))}
                    {volunteers.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-3 text-muted">No volunteers yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteers;