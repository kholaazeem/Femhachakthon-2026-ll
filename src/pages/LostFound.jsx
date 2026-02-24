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
  
  // Current User State
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Lost');
  const [contact, setContact] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Edit State
  const [editId, setEditId] = useState(null);

  // --- Get Current User ---
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserEmail(user.email);
    };
    getUser();
  }, []);

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

  // --- Submit or Update Post ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
        if (!uploadedImageUrl) throw new Error("Image upload failed");
      }

      if (editId) {
        // Update Existing Post
        const updateData = { title, description, type, contact };
        if (uploadedImageUrl) updateData.image_url = uploadedImageUrl;

        const { error } = await supabase.from('lost_found_items').update(updateData).eq('id', editId);
        if (error) throw error;

        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Your post has been updated.', confirmButtonColor: '#66b032' });
      } else {
        // Create New Post
        const { error } = await supabase.from('lost_found_items').insert([{
          title, description, type, contact,
          status: 'Pending',
          user_email: user.email,
          image_url: uploadedImageUrl 
        }]);
        if (error) throw error;

        Swal.fire({ icon: 'success', title: 'Post Live!', text: 'Your item has been listed.', confirmButtonColor: '#66b032' });
      }

      // Reset Form
      setTitle(''); setDescription(''); setContact(''); setImageFile(null); setEditId(null);
      fetchItems();

    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Action ---
  const handleEdit = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    setContact(item.contact);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const cancelEdit = () => {
    setEditId(null);
    setTitle(''); setDescription(''); setContact(''); setImageFile(null);
  };

  // --- Delete Action ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Post?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
      if (!error) {
        Swal.fire('Deleted!', 'Your post has been removed.', 'success');
        fetchItems();
      }
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
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* --- Page Header --- */}
      <div className="text-center py-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #0057a8 0%, #003060 100%)' }}>
        <h1 className="fw-bold display-5">🔍 Community Lost & Found</h1>
        <p className="lead opacity-75">Help us connect lost items with their owners.</p>
      </div>

      <div className="container mt-n5" style={{ marginTop: '-40px' }}>
        
        {/* --- Post Item Card --- */}
        <div className="card shadow-lg border-0 rounded-4 mb-5 animate__animated animate__fadeInUp">
          <div className="card-body p-4 p-md-5 bg-white rounded-4">
            <div className="d-flex align-items-center mb-4">
              <div className={`text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow ${editId ? 'bg-primary' : 'bg-success'}`} style={{ width: '55px', height: '55px', fontSize: '24px' }}>
                <i className={`bi ${editId ? 'bi-pencil' : 'bi-plus-lg'}`}>{editId ? '✏️' : '+'}</i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">{editId ? 'Edit Your Post' : 'Report an Item'}</h4>
                <small className="text-muted">{editId ? 'Update your item details below.' : 'Lost something? Found something? Post it here.'}</small>
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
                  <label className="form-label fw-bold small text-secondary">Image {editId && '(Optional: Leave blank to keep existing)'}</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>

                <div className="col-md-4 d-flex align-items-end gap-2">
                  {editId && (
                    <button type="button" className="btn btn-lg btn-light fw-bold text-muted shadow-sm w-50" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className={`btn btn-lg fw-bold text-white shadow ${editId ? 'w-50' : 'w-100'}`} disabled={loading} style={{ backgroundColor: editId ? '#0d6efd' : '#0057a8', transition: '0.3s' }}>
                    {loading ? 'Processing...' : (editId ? 'Update' : '🚀 Post Now')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* --- Filters & Search Bar --- */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
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
            .map((item) => {
            
            // Check if current user is the owner of this post
            const isOwner = item.user_email === currentUserEmail;

            return (
            <div className="col-md-4 col-sm-6" key={item.id}>
              <div 
                className="card h-100 border-0 shadow card-hover-effect"
                style={{ 
                  borderRadius: '15px', 
                  transition: 'all 0.3s ease',
                  backgroundColor: item.status === 'Recovered' ? '#f0fff4' : '#ffffff',
                  border: item.status === 'Recovered' ? '2px solid #198754' : 'none',
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

                  {/* Resolved Stamp */}
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

                  {/* ACTION BUTTONS LOGIC */}
                  {isOwner ? (
                    // IF OWNER
                    <>
                      {item.status === 'Pending' ? (
                        <button className="btn w-100 btn-outline-success fw-bold rounded-pill mb-2" onClick={() => markAsFound(item.id)}>
                          ✨ Mark as Recovered
                        </button>
                      ) : (
                        <button className="btn w-100 btn-success fw-bold rounded-pill disabled border-0 mb-2" style={{ opacity: 1 }}>
                          Case Closed
                        </button>
                      )}
                      <div className="d-flex gap-2">
                        <button onClick={() => handleEdit(item)} className="btn btn-sm btn-light text-primary border w-50 rounded-pill fw-bold">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-light text-danger border w-50 rounded-pill fw-bold">
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    // IF NOT OWNER
                    <button className={`btn w-100 fw-bold rounded-pill disabled border-0 ${item.status === 'Recovered' ? 'btn-success text-white' : 'btn-light text-dark'}`} style={{ opacity: 1 }}>
                      {item.status === 'Recovered' ? '✅ Case Closed' : '⏳ Pending Recovery'}
                    </button>
                  )}
                  
                </div>
              </div>
            </div>
          )})}
          
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