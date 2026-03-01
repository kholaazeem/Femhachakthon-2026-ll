import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Edit2, Clock, Phone, User as UserIcon, Trash2, FileText, CheckCircle, Hourglass, Leaf, Printer, XCircle } from 'lucide-react';

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
        // Insert Logic (Status defaults to Pending)
        const { error } = await supabase.from('volunteers').insert([{
          name, phone, roll_no: rollNo, event, duration,
          user_email: user.email,
          image_url: uploadedImageUrl,
          status: 'Pending' // Admin approval required
        }]);
        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Registration Submitted!', text: 'Please wait for Admin approval to get your ID Card.', confirmButtonColor: '#198754' });
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

  // --- Edit, Delete & Approve Handlers ---
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

  const handleApprove = async (id) => {
    const { error } = await supabase.from('volunteers').update({ status: 'Approved' }).eq('id', id);
    if (!error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Approved successfully', showConfirmButton: false, timer: 2000 });
      fetchVolunteers();
    }
  };

  // --- Generate & Print Two-Sided ID Card ---
  const downloadIDCard = (vol) => {
    if (vol.status !== 'Approved') {
      Swal.fire('Not Approved Yet', 'You can only print the ID card after Admin approval.', 'info');
      return;
    }

    const printWindow = window.open('', '_blank');
    const photoUrl = vol.image_url || 'https://via.placeholder.com/150?text=No+Photo';
    
    // Fallback variables so card generation does not crash on old records
    const volRollNo = vol.roll_no || 'SMIT-0000';

    // Parse event title for huge text replication (first word huge black, rest huge green)
    const eventWords = (vol.event || '').split(' ');
    const firstPart = eventWords[0];
    const restPart = eventWords.slice(1).join(' ');

    // HTML Design for New ID Card with Dual Logos, Small Photo, Specific Event Title, Name, Roll No, and Faint Background Pattern
    const htmlContent = `
      <html>
        <head>
          <title>Volunteer ID - ${vol.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              display: flex; 
              flex-wrap: wrap;
              justify-content: center; 
              align-items: center; 
              gap: 40px;
              padding: 40px;
              background: #f0f2f5; 
              margin: 0; 
              -webkit-print-color-adjust: exact; /* for print colors */
            }
            .card { 
              width: 320px; 
              height: 480px; 
              background: white; 
              border-radius: 12px; 
              box-shadow: 0 4px 15px rgba(0,0,0,0.15); 
              overflow: hidden; 
              position: relative; 
              border: 1px solid #dcdcdc;
            }
            /* FRONT DESIGN */
            .front { text-align: center; }
            .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #eee; }
            .logo-placeholder-left { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #198754; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; color: #198754; }
            .logo-placeholder-right { font-weight: bold; font-size: 16px; color: #198754; font-family: 'Times New Roman', serif; }
            .photo-container { margin-top: -65px; display: flex; justify-content: center; position: relative; z-index: 10; }
            .photo { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #eee; }
            
            /* Background Pattern overlay */
            .geometric-pattern-overlay {
              position: absolute;
              top: 70px; /* start after header */
              left: 0;
              width: 100%;
              height: calc(100% - 130px); /* stop before bottom organisation name text */
              opacity: 0.1;
              pointer-events: none;
              background-image: 
                linear-gradient(135deg, transparent 96%, #888 96%, #888 100%, transparent 100%),
                linear-gradient(225deg, transparent 96%, #888 96%, #888 100%, transparent 100%),
                linear-gradient(135deg, transparent 48%, #888 48%, #888 52%, transparent 52%, transparent 100%),
                linear-gradient(225deg, transparent 48%, #888 48%, #888 52%, transparent 52%, transparent 100%);
              background-size: 20px 20px;
            }
            .triangle-network {
              position: absolute;
              top: 90px;
              left: 0;
              width: 100%;
              height: 250px;
              opacity: 0.15;
              pointer-events: none;
              background-image: radial-gradient(circle, #ddd 1px, transparent 1px);
              background-size: 10px 10px;
            }
            .blue-triangle {
              position: absolute;
              width: 0;
              height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-bottom: 15px solid #0057a8;
              opacity: 0.2;
            }
            .grey-triangle {
              position: absolute;
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 12px solid #aaa;
              opacity: 0.15;
            }
            
            /* HUGE TEXT Stack replication */
            .huge-text-container { margin-top: 25px; font-weight: bold; text-transform: uppercase; line-height: 1.1; margin-bottom: 25px;}
            .event-huge-black { font-size: 44px; color: #1a1a1a; }
            .event-huge-green { font-size: 38px; color: #198754; }

            /* Role Banner designation */
            .designation-banner { background: #198754; color: white; display: inline-block; padding: 10px 20px; border-radius: 4px; font-weight: bold; font-size: 22px; margin-bottom: 25px; letter-spacing: 2px; }

            /* Student Info (Name & Roll No) section */
            .student-info { text-align: left; padding: 0 25px; margin-top: 15px; font-size: 16px; color: #333; line-height: 1.6; }
            .info-item { display: flex; justify-content: flex-start; margin-bottom: 8px; }
            .info-label { font-weight: bold; color: black; width: 90px; }

            /* Bottom organisation name text */
            .footer { position: absolute; bottom: 0; width: 100%; text-align: center; padding: 15px 10px; font-size: 14px; color: #1a1a1a; letter-spacing: 1px; border-top: 1px solid #eee; }
            .prominent-org { font-weight: bold; display: block; margin-top: 5px; font-size: 16px;}
            
            @media print { 
              body { background: white; gap: 20px; padding: 0; } 
              .card { box-shadow: none; border: 1px solid #000; page-break-inside: avoid; } 
            }
          </style>
        </head>
        <body>
          
          <div class="card front">
            <div class="header">
              <div class="logo-placeholder-left">CRESCENT LOGO</div>
              <div class="logo-placeholder-right">SAYLANI</div>
            </div>

            <div class="geometric-pattern-overlay"></div>
            <div class="triangle-network"></div>
            <div class="blue-triangle" style="top: 100px; left: 50px;"></div>
            <div class="grey-triangle" style="top: 150px; left: 20px;"></div>
            <div class="grey-triangle" style="top: 120px; right: 40px;"></div>
            <div class="blue-triangle" style="bottom: 180px; right: 60px;"></div>
            <div class="grey-triangle" style="bottom: 200px; left: 80px;"></div>

            <div class="photo-container">
              <img src="${photoUrl}" class="photo" alt="Volunteer" crossorigin="anonymous" />
            </div>

            <div class="huge-text-container">
              <span class="event-huge-black">${firstPart}</span><br>
              <span class="event-huge-green">${restPart}</span>
            </div>

            <div class="designation-banner">
              VOLUNTEER
            </div>

            <div class="student-info">
              <div class="info-item"><span class="info-label">NAME:</span> <span>${vol.name}</span></div>
              <div class="info-item"><span class="info-label">ROLL NO:</span> <span>${volRollNo}</span></div>
            </div>

            <div class="footer">
              IF FOUND PLEASE RETURN TO <br>
              <span class="prominent-org">SAYLANI Welfare Trust</span>
            </div>
          </div>

          <script>
            setTimeout(() => { window.print(); window.close(); }, 800);
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
        <h1 className="fw-bold display-5 d-flex justify-content-center align-items-center gap-3">
          <Users size={48} /> Community Volunteers
        </h1>
        <p className="lead opacity-75">Join hands to make our campus events successful.</p>
      </div>

      <div className="container" style={{ marginTop: '-60px' }}>
        <div className="row g-4">
          
          {/* --- Form Section --- */}
          <div className="col-lg-4">
            <div className="card shadow-lg border-0 rounded-4 animate__animated animate__fadeInLeft">
              <div className="card-body p-4 bg-white rounded-4">
                
                <div className="text-center mb-4">
                  <div className={`text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow mb-3 ${editId ? 'bg-primary' : 'bg-success'}`} style={{ width: '60px', height: '60px' }}>
                    {editId ? <Edit2 size={28} /> : <Heart size={28} />}
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
                    <button type="submit" className={`btn btn-lg fw-bold text-white shadow-sm d-flex justify-content-center align-items-center gap-2 ${editId ? 'w-50 btn-primary' : 'w-100'}`} disabled={loading} style={{ backgroundColor: editId ? '' : '#0057a8' }}>
                      {loading ? 'Wait...' : (editId ? <><Edit2 size={18}/> Update</> : 'Submit Form')}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

          {/* --- Volunteers List Section --- */}
          <div className="col-lg-8">
            <div className="bg-white p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                {isAdmin ? <FileText size={20} className="text-primary"/> : <FileText size={20} className="text-success"/>}
                {isAdmin ? "All Applications" : "My Event Passes"}
              </h5>
              <span className="badge bg-light text-dark border rounded-pill">{volunteers.length} Active</span>
            </div>

            <div className="row g-3">
              {volunteers.map((vol) => (
                <div className="col-md-6" key={vol.id}>
                  <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="card-body p-0 d-flex flex-column h-100">
                      
                      <div className="d-flex p-3 border-bottom position-relative">
                        
                        {/* Profile Image */}
                        <div className="me-3">
                          {vol.image_url ? (
                            <img src={vol.image_url} alt="Profile" className="rounded-circle shadow-sm" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                          ) : (
                            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                               <UserIcon size={28} className="text-secondary" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="w-100">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="fw-bold text-dark mb-0 text-capitalize">{vol.name}</h6>
                            {/* Status Badge */}
                            {vol.status === 'Approved' ? (
                              <CheckCircle size={18} className="text-success" />
                            ) : (
                              <Hourglass size={18} className="text-warning" />
                            )}
                          </div>
                          <small className="text-muted d-block mb-1">Roll: <span className="fw-bold">{vol.roll_no || 'N/A'}</span></small>
                          <span className="badge bg-primary bg-opacity-10 text-primary border" style={{ fontSize: '0.65rem' }}>{vol.event}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-light d-flex justify-content-between align-items-center flex-grow-1">
                        <div>
                          <span className={`badge ${getDurationBadge(vol.duration)} rounded-pill d-flex align-items-center gap-1`}>
                            <Clock size={12} /> {vol.duration || 'Not specified'}
                          </span>
                        </div>
                        {isAdmin && <small className="text-danger fw-bold d-flex align-items-center gap-1"><Phone size={12}/> {vol.phone}</small>}
                      </div>

                      {/* Action Buttons */}
                      <div className="p-2 border-top bg-white d-flex flex-column gap-2">
                        
                        {/* Admin Controls */}
                        {isAdmin && vol.status !== 'Approved' && (
                          <button onClick={() => handleApprove(vol.id)} className="btn btn-sm btn-success fw-bold d-flex justify-content-center align-items-center gap-1 w-100">
                            <CheckCircle size={16} /> Approve Volunteer
                          </button>
                        )}

                        {/* User/Admin Controls */}
                        {(isAdmin || vol.user_email === currentUserEmail) && (
                          <div className="d-flex gap-2 w-100">
                            {/* Print Button changes based on status */}
                            {vol.status === 'Approved' ? (
                              <button onClick={() => downloadIDCard(vol)} className="btn btn-sm btn-dark flex-grow-1 fw-bold d-flex justify-content-center align-items-center gap-1">
                                <Printer size={16} /> Print ID
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-warning opacity-75 flex-grow-1 fw-bold text-dark d-flex justify-content-center align-items-center gap-1" disabled style={{ cursor: 'not-allowed' }}>
                                <Hourglass size={16} /> Pending Approval
                              </button>
                            )}
                            
                            {!isAdmin && (
                              <>
                                <button onClick={() => handleEdit(vol)} className="btn btn-sm btn-outline-primary px-3 fw-bold d-flex justify-content-center align-items-center"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(vol.id)} className="btn btn-sm btn-outline-danger px-3 fw-bold d-flex justify-content-center align-items-center"><Trash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {volunteers.length === 0 && (
                <div className="col-12 text-center py-5">
                  <div className="text-muted opacity-25 mb-3"><Leaf size={60} /></div>
                  <h5 className="text-muted">No applications yet</h5>
                  <p className="text-muted small">Submit the form to get your volunteer pass.</p>
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