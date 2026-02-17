import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Complaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [category, setCategory] = useState('Internet');
  const [description, setDescription] = useState('');

  // --- Fetch Data ---
  const fetchComplaints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_email', user.email) 
      .order('created_at', { ascending: false });

    if (error) console.log('Error:', error);
    else setComplaints(data);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- Submit Complaint ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('complaints').insert([{
      category,
      description,
      status: 'Submitted', // Default Status
      user_email: user.email
    }]);

    setLoading(false);

    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Ticket Created!',
        text: 'Admin will review your issue shortly.',
        confirmButtonColor: '#66b032'
      });
      setDescription('');
      fetchComplaints();
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-success';
      case 'In Progress': return 'bg-primary';
      default: return 'bg-warning text-dark';
    }
  };

  // Helper for Category Icons
  const getCategoryIcon = (cat) => {
    if (cat.includes('Internet')) return '📶';
    if (cat.includes('Electricity')) return '⚡';
    if (cat.includes('Water')) return '💧';
    if (cat.includes('Furniture')) return '🪑';
    return '📝';
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* --- Header Section --- */}
      <div className="py-5 text-white text-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0057a8 0%, #003060 100%)' }}>
        <h1 className="fw-bold display-5">🛠️ Support & Complaints</h1>
        <p className="lead opacity-75">Facing an issue? Submit a ticket and track its status.</p>
      </div>

      <div className="container mt-n5" style={{ marginTop: '-40px' }}>
        
        {/* --- Submission Form Card --- */}
        <div className="card shadow-lg border-0 rounded-4 mb-5 animate__animated animate__fadeInUp">
          <div className="card-body p-4 p-md-5 bg-white rounded-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow" style={{ width: '55px', height: '55px', fontSize: '24px' }}>
                !
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">Submit New Ticket</h4>
                <small className="text-muted">Describe your issue clearly for faster resolution.</small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-secondary">Issue Category</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">📂</span>
                    <select 
                      className="form-select form-select-lg bg-light border-0" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Internet / Wi-Fi</option>
                      <option>Electricity / Lights</option>
                      <option>Water / Washroom</option>
                      <option>Furniture / Maintenance</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-bold small text-secondary">Problem Details</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">✍️</span>
                    <input 
                      type="text"
                      className="form-control form-control-lg bg-light border-0" 
                      placeholder="e.g. AC in Lab 3 is not cooling..." 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="col-12 text-end mt-4">
                  <button type="submit" className="btn btn-lg fw-bold text-white px-5 shadow-sm" disabled={loading} style={{ backgroundColor: '#0057a8' }}>
                    {loading ? 'Submitting...' : ' Submit Ticket'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* --- History Header --- */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="fw-bold text-dark m-0">🕒 Your Ticket History</h4>
          <span className="badge bg-secondary rounded-pill">{complaints.length} Tickets</span>
        </div>

        {/* --- Complaints Grid (Cards instead of Table) --- */}
        <div className="row g-4">
          {complaints.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div 
                className="card h-100 border-0 shadow-sm" 
                style={{ 
                  borderRadius: '15px', 
                  borderLeft: `5px solid ${item.status === 'Resolved' ? '#198754' : item.status === 'In Progress' ? '#0d6efd' : '#ffc107'}` 
                }}
              >
                <div className="card-body p-4">
                  {/* Header: Date & Status */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted small bg-light px-2 py-1 rounded">
                      📅 {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="fs-2 me-3">{getCategoryIcon(item.category)}</div>
                    <h5 className="fw-bold text-dark mb-0">{item.category}</h5>
                  </div>

                  {/* Description */}
                  <p className="text-secondary small mb-0 bg-light p-3 rounded-3 border-start">
                    "{item.description}"
                  </p>
                </div>
                
                {/* Footer (Optional: if you add Admin Remarks later) */}
                {item.status === 'Resolved' && (
                  <div className="card-footer bg-transparent border-0 pt-0 pb-3">
                     <small className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Issue Resolved</small>
                  </div>
                )}
              </div>
            </div>
          ))}

          {complaints.length === 0 && (
            <div className="col-12 text-center py-5">
              <div className="display-1 text-muted opacity-25">✅</div>
              <h4 className="text-muted mt-3">No complaints yet</h4>
              <p className="text-muted small">Everything seems to be working perfectly!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Complaints;