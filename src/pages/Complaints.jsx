import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Complaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [campus, setCampus] = useState('Bahadurabad (Head Office)');
  const [category, setCategory] = useState('Internet / Wi-Fi');
  const [description, setDescription] = useState('');
  
  // Edit State
  const [editId, setEditId] = useState(null);

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

  // --- Submit or Update Complaint ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editId) {
        // Update Existing Ticket
        const { error } = await supabase.from('complaints').update({
          campus, category, description
        }).eq('id', editId);
        
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Your ticket has been updated.', confirmButtonColor: '#66b032' });
      } else {
        // Create New Ticket
        const { error } = await supabase.from('complaints').insert([{
          campus,
          category,
          description,
          status: 'Submitted',
          user_email: user.email
        }]);
        
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Ticket Created!', text: 'Admin will review your issue shortly.', confirmButtonColor: '#66b032' });
      }

      // Reset Form
      setCampus('Bahadurabad (Head Office)');
      setCategory('Internet / Wi-Fi');
      setDescription('');
      setEditId(null);
      fetchComplaints();

    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Action ---
  const handleEdit = (item) => {
    setEditId(item.id);
    setCampus(item.campus || 'Bahadurabad (Head Office)');
    setCategory(item.category);
    setDescription(item.description);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to form
  };

  const cancelEdit = () => {
    setEditId(null);
    setCampus('Bahadurabad (Head Office)');
    setCategory('Internet / Wi-Fi');
    setDescription('');
  };

  // --- Delete Action ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Ticket?',
      text: "Are you sure you want to remove this complaint?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('complaints').delete().eq('id', id);
      if (!error) {
        Swal.fire('Deleted!', 'Your ticket has been removed.', 'success');
        fetchComplaints();
      }
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
    if (!cat) return '📝';
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
              <div className={`text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow ${editId ? 'bg-primary' : 'bg-danger'}`} style={{ width: '55px', height: '55px', fontSize: '24px' }}>
                <i className={`bi ${editId ? 'bi-pencil' : 'bi-exclamation-lg'}`}>{editId ? '✏️' : '!'}</i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">{editId ? 'Edit Your Ticket' : 'Submit New Ticket'}</h4>
                <small className="text-muted">{editId ? 'Update your complaint details below.' : 'Describe your issue clearly for faster resolution.'}</small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                
                {/* Campus Dropdown */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-secondary">Campus Location</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">🏫</span>
                    <select 
                      className="form-select form-select-lg bg-light border-0" 
                      value={campus} 
                      onChange={(e) => setCampus(e.target.value)}
                    >
                      <option>Bahadurabad (Head Office)</option>
                      <option>Gulshan Campus</option>
                      <option>Nipa Campus</option>
                      <option>Johar Campus</option>
                      <option>Malir Campus</option>
                      <option>Numaish Campus</option>
                      <option>Saddar Campus</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="col-md-6">
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

                <div className="col-12">
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

                <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                  {editId && (
                    <button type="button" className="btn btn-lg btn-light fw-bold text-muted shadow-sm px-4" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className={`btn btn-lg fw-bold text-white px-5 shadow-sm ${editId ? 'btn-primary' : ''}`} disabled={loading} style={{ backgroundColor: editId ? '' : '#0057a8' }}>
                    {loading ? 'Processing...' : (editId ? 'Update Ticket' : '🚀 Submit Ticket')}
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

        {/* --- Complaints Grid --- */}
        <div className="row g-4">
          {complaints.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div 
                className="card h-100 border-0 shadow-sm d-flex flex-column" 
                style={{ 
                  borderRadius: '15px', 
                  borderLeft: `5px solid ${item.status === 'Resolved' ? '#198754' : item.status === 'In Progress' ? '#0d6efd' : '#ffc107'}` 
                }}
              >
                <div className="card-body p-4 flex-grow-1">
                  
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
                  <div className="d-flex align-items-center mb-2">
                    <div className="fs-2 me-3">{getCategoryIcon(item.category)}</div>
                    <h5 className="fw-bold text-dark mb-0">{item.category}</h5>
                  </div>
                  
                  {/* Campus Badge */}
                  <div className="mb-3">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                      🏫 {item.campus || 'Not specified'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-secondary small mb-0 bg-light p-3 rounded-3 border-start">
                    "{item.description}"
                  </p>
                </div>
                
                {/* Actions Footer */}
                <div className="card-footer bg-transparent border-top p-3">
                  {item.status === 'Resolved' ? (
                    <div className="d-flex justify-content-between align-items-center">
                       <small className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Issue Resolved</small>
                       <button onClick={() => handleDelete(item.id)} className="btn btn-sm text-danger opacity-75 hover-opacity-100 p-0">🗑️ Delete</button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <button onClick={() => handleEdit(item)} className="btn btn-sm btn-light text-primary border w-50 fw-bold rounded-pill">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-light text-danger border w-50 fw-bold rounded-pill">
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
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