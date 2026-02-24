import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Volunteers = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [event, setEvent] = useState('Tech Hackathon');
  const [duration, setDuration] = useState('2 Hours');
  const [imageFile, setImageFile] = useState(null);
  
  // Edit State
  const [editId, setEditId] = useState(null);

  // --- Fetch Data ---
  const fetchVolunteers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setCurrentUserEmail(user.email);

    let query = supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    // Admin Logic
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

  // --- Upload Image ---
  const uploadImage = async (file) => {
    const fileName = `vol-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) return null;
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- Submit Registration ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      if (editId) {
        // Edit Logic
        const updateData = { name, phone, roll_no: rollNo, event, duration };
        if (uploadedImageUrl) updateData.image_url = uploadedImageUrl;

        const { error } = await supabase.from('volunteers').update(updateData).eq('id', editId);
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Registration details updated.', confirmButtonColor: '#198754' });
      } else {
        // Insert Logic
        const { error } = await supabase.from('volunteers').insert([{
          name, phone, roll_no: rollNo, event, duration,
          user_email: user.email,
          image_url: uploadedImageUrl
        }]);
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Welcome Aboard!', text: 'You have successfully registered.', confirmButtonColor: '#198754' });
      }

      // Reset Form
      cancelEdit();
      fetchVolunteers();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Edit & Delete Handlers ---
  const handleEdit = (vol) => {
    setEditId(vol.id);
    setName(vol.name);
    setPhone(vol.phone);
    setRollNo(vol.roll_no || '');
    setEvent(vol.event);
    setDuration(vol.duration || '2 Hours');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setName(''); setPhone(''); setRollNo('');
    setEvent('Tech Hackathon'); setDuration('2 Hours'); setImageFile(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Delete Registration?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      const { error } = await supabase.from('volunteers').delete().eq('id', id);
      if (!error) {
        Swal.fire('Deleted!', 'Your registration has been removed.', 'success');
        fetchVolunteers();
      }
    }
  };

  // --- Generate & Print ID Card ---
  const downloadIDCard = (vol) => {
    const printWindow = window.open('', '_blank');
    const photoUrl = vol.image_url || 'https://via.placeholder.com/100?text=No+Photo';
    
    // Fallback variables so card generation does not crash on old records
    const volRollNo = vol.roll_no || 'N/A';
    const volDuration = vol.duration || 'Not specified';
    const volPhone = vol.phone || 'N/A';

    // HTML Design for ID Card
    const htmlContent = `
      <html>
        <head>
          <title>Volunteer ID - ${vol.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #e0e0e0; margin: 0; }
            .card { width: 320px; background: white; border-radius: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); overflow: hidden; text-align: center; border: 2px solid #0057a8; position: relative; }
            .header { background: linear-gradient(135deg, #0057a8 0%, #003060 100%); color: white; padding: 20px 10px; font-weight: bold; font-size: 20px; letter-spacing: 1px; }
            .photo-container { margin-top: -40px; }
            .photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #eee; }
            .name { font-size: 22px; font-weight: bold; color: #333; margin: 10px 0 5px; text-transform: capitalize; }
            .role { background: #e8f5e9; color: #198754; display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 15px; }
            .info-box { text-align: left; padding: 0 25px 25px; font-size: 14px; color: #555; line-height: 1.8; }
            .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 5px 0; }
            .footer { background: #f8f9fa; padding: 15px; font-size: 12px; color: #777; border-top: 1px solid #eee; }
            @media print { body { background: white; } .card { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">SAYLANI IT HUB</div>
            <div class="photo-container">
              <img src="${photoUrl}" class="photo" alt="Volunteer Photo" crossorigin="anonymous" />
            </div>
            <div class="name">${vol.name}</div>
            <div class="role">Volunteer - ${vol.event}</div>
            <div class="info-box">
              <div class="info-row"><b>Roll No:</b> <span>${volRollNo}</span></div>
              <div class="info-row"><b>Duration:</b> <span>${volDuration}</span></div>
              <div class="info-row"><b>Phone:</b> <span>${volPhone}</span></div>
            </div>
            <div class="footer">Official Volunteer Identity Card</div>
          </div>
          <script>
            // Wait for image to load before printing to ensure it shows in PDF
            setTimeout(() => { window.print(); window.close(); }, 800);
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper for Duration Colors - SAFE METHOD (Prevents crash if 'dur' is null or undefined)
  const getDurationBadge = (dur) => {
    if (!dur) return 'bg-secondary text-white'; 
    if (dur.includes('1')) return 'bg-info text-dark';
    if (dur.includes('2')) return 'bg-primary text-white';
    return 'bg-success text-white'; 
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* Header Section */}
      <div className="pt-5 pb-5 text-white text-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0057a8 0%, #003060 100%)', paddingBottom: '80px' }}>
        <h1 className="fw-bold display-5">🤝 Community Volunteers</h1>
        <p className="lead opacity-75">Join hands to make our campus events successful.</p>
      </div>

      <div className="container" style={{ marginTop: '-60px' }}>
        <div className="row g-4">
          
          {/* --- Form Section --- */}
          <div className="col-lg-4">
            <div className="card shadow-lg border-0 rounded-4 animate__animated animate__fadeInLeft">
              <div className="card-body p-4 bg-white rounded-4">
                
                <div className="text-center mb-4">
                  <div className={`text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow mb-3 ${editId ? 'bg-primary' : 'bg-success'}`} style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                    {editId ? '✏️' : '❤️'}
                  </div>
                  <h4 className="fw-bold text-dark">{editId ? 'Edit Registration' : 'Join a Team'}</h4>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Full Name</label>
                    <input className="form-control bg-light border-0 py-2" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ali Khan" />
                  </div>
                  
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold small text-secondary">Roll Number</label>
                      <input className="form-control bg-light border-0 py-2" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required placeholder="SMIT-XXXX" />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold small text-secondary">Phone Number</label>
                      <input className="form-control bg-light border-0 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="03XXXXXXXXX" />
                    </div>
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
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Time Duration</label>
                    <select className="form-select bg-light border-0 py-2" value={duration} onChange={(e) => setDuration(e.target.value)}>
                      <option>1 Hour</option>
                      <option>2 Hours</option>
                      <option>3 Hours</option>
                      <option>4+ Hours (Full Event)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold small text-secondary">Profile Picture {editId && '(Optional)'}</label>
                    <input type="file" className="form-control bg-light border-0" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!editId} />
                  </div>
                  
                  <div className="d-flex gap-2">
                    {editId && (
                      <button type="button" className="btn btn-lg btn-light w-50 fw-bold text-muted border shadow-sm" onClick={cancelEdit}>Cancel</button>
                    )}
                    <button type="submit" className={`btn btn-lg fw-bold text-white shadow-sm ${editId ? 'w-50 btn-primary' : 'w-100'}`} disabled={loading} style={{ backgroundColor: editId ? '' : '#0057a8' }}>
                      {loading ? 'Wait...' : (editId ? 'Update' : 'Register')}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

          {/* --- Volunteers List Section --- */}
          <div className="col-lg-8">
            <div className="bg-white p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark m-0">{isAdmin ? "📋 All Volunteers" : "🎫 My Event Passes"}</h5>
              <span className="badge bg-light text-dark border rounded-pill">{volunteers.length} Active</span>
            </div>

            <div className="row g-3">
              {volunteers.map((vol) => (
                <div className="col-md-6" key={vol.id}>
                  <div className="card h-100 border-0 shadow-sm card-hover-effect" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="card-body p-0 d-flex flex-column h-100">
                      
                      <div className="d-flex p-3 border-bottom position-relative">
                        {/* Status Dot */}
                        <div className="position-absolute top-0 end-0 m-2"><span className="badge bg-success rounded-circle p-1"> </span></div>
                        
                        {/* Profile Image */}
                        <div className="me-3">
                          {vol.image_url ? (
                            <img src={vol.image_url} alt="Profile" className="rounded-circle shadow-sm" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                          ) : (
                            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>👤</div>
                          )}
                        </div>

                        {/* Details */}
                        <div>
                          <h6 className="fw-bold text-dark mb-0 text-capitalize">{vol.name}</h6>
                          <small className="text-muted d-block mb-1">Roll: <span className="fw-bold">{vol.roll_no || 'N/A'}</span></small>
                          <span className="badge bg-primary bg-opacity-10 text-primary border" style={{ fontSize: '0.65rem' }}>{vol.event}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-light d-flex justify-content-between align-items-center flex-grow-1">
                        <div>
                          <span className={`badge ${getDurationBadge(vol.duration)} rounded-pill`}>
                            ⏱️ {vol.duration || 'Not specified'}
                          </span>
                        </div>
                        {isAdmin && <small className="text-danger fw-bold">📞 {vol.phone}</small>}
                      </div>

                      {/* Action Buttons */}
                      {(isAdmin || vol.user_email === currentUserEmail) && (
                        <div className="p-2 border-top d-flex justify-content-between bg-white gap-2">
                           <button onClick={() => downloadIDCard(vol)} className="btn btn-sm btn-success flex-grow-1 fw-bold">
                             🪪 Print ID
                           </button>
                           {!isAdmin && (
                             <>
                               <button onClick={() => handleEdit(vol)} className="btn btn-sm btn-outline-primary px-3 fw-bold">Edit</button>
                               <button onClick={() => handleDelete(vol.id)} className="btn btn-sm btn-outline-danger px-3 fw-bold">Delete</button>
                             </>
                           )}
                        </div>
                      )}

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