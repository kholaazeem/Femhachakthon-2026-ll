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

  // --- 1. Fetch Data (Read) ---
  const fetchComplaints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Sirf user ki apni complaints dikhayenge
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

  // --- 2. Submit Complaint (Create) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('complaints').insert([{
      category,
      description,
      status: 'Submitted',
      user_email: user.email
    }]);

    setLoading(false);

    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Complaint Submitted!',
        text: 'Admin will review it soon.',
        confirmButtonColor: '#66b032'
      });
      setDescription('');
      fetchComplaints();
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#0057a8' }}>My Complaints</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>

      {/* --- Form Section --- */}
      <div className="card shadow-sm border-0 mb-5" style={{ backgroundColor: '#f0f5fa' }}>
        <div className="card-body p-4">
          <h5 className="mb-3 fw-bold" style={{ color: '#66b032' }}>Submit a New Complaint</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Issue Category</label>
                <select 
                  className="form-select" 
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
              <div className="col-md-8">
                <label className="form-label small fw-bold">Problem Description</label>
                <input 
                  type="text"
                  className="form-control" 
                  placeholder="Describe the issue in detail..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn text-white px-5 fw-bold" disabled={loading} style={{ backgroundColor: '#0057a8' }}>
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* --- History Section --- */}
      <h4 className="mb-3">Complaint History</h4>
      <div className="table-responsive">
        <table className="table table-hover shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td className="fw-bold text-primary">{item.category}</td>
                <td>{item.description}</td>
                <td>
                  <span className={`badge ${
                    item.status === 'Resolved' ? 'bg-success' : 
                    item.status === 'In Progress' ? 'bg-info text-dark' : 'bg-warning text-dark'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">No complaints submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;