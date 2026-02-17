import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const LostFound = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Lost');
  const [contact, setContact] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // --- Fetch Data ---
  const fetchItems = async () => {
    let query = supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'All') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;
    if (error) console.log('Error fetching data:', error);
    else setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, [filter]);

  // --- Upload Image ---
  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) return null;
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- Submit Post ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let uploadedImageUrl = '';
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
        if (!uploadedImageUrl) throw new Error("Image upload failed");
      }

      const { error } = await supabase.from('lost_found_items').insert([{
        title, description, type, contact,
        status: 'Pending',
        user_email: user.email,
        image_url: uploadedImageUrl 
      }]);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Post Live!',
        text: 'Your item has been listed.',
        confirmButtonColor: '#66b032'
      });

      setTitle(''); setDescription(''); setContact(''); setImageFile(null);
      fetchItems();

    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Mark Recovered ---
  const markAsFound = async (id) => {
    const result = await Swal.fire({
      title: 'Is this item resolved?',
      text: "This will mark the item as recovered.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Resolved!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('lost_found_items').update({ status: 'Recovered' }).eq('id', id);
      if (!error) {
        Swal.fire('Resolved!', 'Item marked as recovered.', 'success');
        fetchItems();
      }
    }
  };

  return (
    // Background Color Changed for Better Contrast
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* --- Page Header --- */}
      <div className="text-center py-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #0057a8 0%, #003060 100%)' }}>
        <h1 className="fw-bold display-5">🔍 Community Lost & Found</h1>
        <p className="lead opacity-75">Help us connect lost items with their owners.</p>
      </div>

      <div className="container mt-n5" style={{ marginTop: '-40px' }}>
        
        {/* --- Post Item Card (Clean White on Grey BG) --- */}
        <div className="card shadow-lg border-0 rounded-4 mb-5 animate__animated animate__fadeInUp">
          <div className="card-body p-4 p-md-5 bg-white rounded-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow" style={{ width: '55px', height: '55px', fontSize: '24px' }}>
                <i className="bi bi-plus-lg">+</i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">Report an Item</h4>
                <small className="text-muted">Lost something? Found something? Post it here.</small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-secondary">Item Name</label>
                  <input className="form-control form-control-lg bg-light border-0" placeholder="e.g. Black Wallet" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label fw-bold small text-secondary">Type</label>
                  <select className="form-select form-select-lg bg-light border-0" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Lost">🔴 Lost</option>
                    <option value="Found">🟢 Found</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-bold small text-secondary">Contact</label>
                  <input className="form-control form-control-lg bg-light border-0" placeholder="0300-xxxxxxx" value={contact} onChange={(e) => setContact(e.target.value)} required />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold small text-secondary">Description & Location</label>
                  <textarea className="form-control bg-light border-0" rows="2" placeholder="Where did you see it? Any specific marks?" value={description} onChange={(e) => setDescription(e.target.value)} required ></textarea>
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-bold small text-secondary">Image</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>

                <div className="col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn btn-lg w-100 fw-bold text-white shadow" disabled={loading} style={{ backgroundColor: '#0057a8', transition: '0.3s' }}>
                    {loading ? 'Posting...' : ' Post Now'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* --- Filters & Search Bar --- */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
          
          {/* Filter Pills */}
          <div className="bg-white p-2 rounded-pill shadow-sm d-inline-flex border">
            {['All', 'Lost', 'Found'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn rounded-pill px-4 fw-bold border-0 ${filter === f ? 'text-white shadow-sm' : 'text-muted'}`}
                style={{ backgroundColor: filter === f ? (f === 'Lost' ? '#dc3545' : f === 'Found' ? '#198754' : '#0057a8') : 'transparent' }}
              >
                {f}
              </button>
            ))}
          </div>
          
          {/* Search Input */}
          <div className="input-group shadow-sm w-md-50 rounded-pill overflow-hidden border-0" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-0 ps-3 text-muted">🔍</span>
            <input 
              type="text" 
              className="form-control border-0 ps-2" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- Items Grid --- */}
        <div className="row g-4">
          {items
            .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item) => (
            <div className="col-md-4 col-sm-6" key={item.id}>
              <div 
                className="card h-100 border-0 shadow card-hover-effect"
                style={{ 
                  borderRadius: '15px', 
                  transition: 'all 0.3s ease',
                  // Agar Recovered hai to Green Tint, warna White
                  backgroundColor: item.status === 'Recovered' ? '#f0fff4' : '#ffffff',
                  // Agar Recovered hai to Green Border
                  border: item.status === 'Recovered' ? '2px solid #198754' : 'none',
                  // Opacity nahi kam kar rahe, taake text dikhay
                  opacity: 1 
                }}
              >
                {/* Image Section */}
                <div className="position-relative">
                  <div style={{ height: '220px', backgroundColor: '#e9ecef', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-secondary display-4 opacity-25">📦</div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className={`badge px-3 py-2 rounded-pill shadow ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Resolved Stamp (Without blocking text) */}
                  {item.status === 'Recovered' && (
                     <div className="position-absolute bottom-0 start-0 w-100 p-2 text-center" style={{ backgroundColor: 'rgba(25, 135, 84, 0.9)', color: 'white' }}>
                        <span className="fw-bold ls-2">✅ RESOLVED</span>
                     </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-dark text-capitalize mb-0 text-truncate" style={{ maxWidth: '70%' }}>{item.title}</h5>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(item.created_at).toLocaleDateString()}</small>
                  </div>
                  
                  <p className="text-secondary small mb-3 flex-grow-1">{item.description}</p>
                  
                  <div className="p-3 rounded-3 mb-3 d-flex align-items-center" style={{ backgroundColor: item.status === 'Recovered' ? '#d1e7dd' : '#f8f9fa' }}>
                    <span className="me-2 fs-5">📞</span> 
                    <span className="fw-bold text-dark">{item.contact}</span>
                  </div>

                  {item.status === 'Pending' ? (
                    <button 
                      className="btn w-100 btn-outline-success fw-bold rounded-pill"
                      onClick={() => markAsFound(item.id)}
                    >
                      ✨ Mark as Recovered
                    </button>
                  ) : (
                    <button className="btn w-100 btn-success fw-bold rounded-pill disabled border-0" style={{ opacity: 1 }}>
                      Case Closed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="col-12 text-center py-5">
              <div className="display-1 text-muted opacity-25">📭</div>
              <h4 className="text-muted mt-3">No items found</h4>
              <p className="text-muted small">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LostFound;