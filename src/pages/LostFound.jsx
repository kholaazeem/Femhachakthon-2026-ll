import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const LostFound = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All'); // Filter ke liye state

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Lost'); // Default 'Lost'
  const [contact, setContact] = useState('');

  // --- 1. Data Fetch Karna (Read) ---
  const fetchItems = async () => {
    let query = supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false });

    // Agar filter All nahi hai to filter lagao
    if (filter !== 'All') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;
    if (error) console.log('Error:', error);
    else setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, [filter]); // Jab filter change ho to dobara fetch karo

  // --- 2. Data Submit Karna (Create) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Current User ka email lena
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('lost_found_items').insert([{
      title,
      description,
      type,
      contact,
      status: 'Pending',
      user_email: user.email
    }]);

    setLoading(false);

    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Item Posted!',
        confirmButtonColor: '#66b032' // Saylani Green
      });
      // Form Clear
      setTitle('');
      setDescription('');
      setContact('');
      fetchItems(); // List Update
    }
  };

  // --- 3. Status Update (Mark as Recovered) ---
  const markAsFound = async (id) => {
    const { error } = await supabase
      .from('lost_found_items')
      .update({ status: 'Recovered' })
      .eq('id', id);

    if (!error) {
      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        showConfirmButton: false,
        timer: 1000
      });
      fetchItems();
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#0057a8' }}>Lost & Found Items</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>

      {/* --- Form Section --- */}
      <div className="card shadow-sm border-0 mb-5" style={{ backgroundColor: '#f0f5fa' }}>
        <div className="card-body p-4">
          <h5 className="mb-3 fw-bold" style={{ color: '#66b032' }}>Post a New Item</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <input 
                  className="form-control" 
                  placeholder="Item Name (e.g. Black Wallet)" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="col-md-3">
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Lost">Lost (Gumshuda)</option>
                  <option value="Found">Found (Mila hai)</option>
                </select>
              </div>
              <div className="col-md-3">
                <input 
                  className="form-control" 
                  placeholder="Contact No." 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  required 
                />
              </div>
              <div className="col-12">
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Description (Location, Time, details...)" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                ></textarea>
              </div>
              <div className="col-12">
                <button type="submit" className="btn text-white w-100 fw-bold" disabled={loading} style={{ backgroundColor: '#0057a8' }}>
                  {loading ? 'Posting...' : 'Submit Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="btn-group mb-4">
        <button className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('All')}>All</button>
        <button className={`btn ${filter === 'Lost' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setFilter('Lost')}>Lost Items</button>
        <button className={`btn ${filter === 'Found' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setFilter('Found')}>Found Items</button>
      </div>

      {/* --- Items List --- */}
      <div className="row">
        {items.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className={`card h-100 shadow-sm border-0 ${item.status === 'Recovered' ? 'opacity-50' : ''}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span className={`badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>{item.type}</span>
                  <small className="text-muted">{new Date(item.created_at).toLocaleDateString()}</small>
                </div>
                
                <h5 className="card-title fw-bold text-dark">{item.title}</h5>
                <p className="card-text text-secondary small">{item.description}</p>
                <p className="card-text fw-bold text-dark mb-1">
                  <i className="bi bi-telephone me-2"></i>{item.contact}
                </p>
                
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`badge ${item.status === 'Pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {item.status}
                  </span>
                  
                  {/* Mark as Found Button (Only if Pending) */}
                  {item.status === 'Pending' && (
                    <button 
                      className="btn btn-sm btn-outline-success" 
                      onClick={() => markAsFound(item.id)}
                    >
                      Mark as Recovered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted">No items found.</p>}
      </div>
    </div>
  );
};

export default LostFound;