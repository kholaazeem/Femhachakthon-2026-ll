import React, { useState, useEffect  } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import { ShieldCheck, Users, Search, Ticket, Mail, Trash2, X, CheckCircle, Megaphone, Building, Clock, Phone, MapPin } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('volunteers'); 
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [volunteers, setVolunteers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [items, setItems] = useState([]);
  const [notices, setNotices] = useState([]); 
  const [messages, setMessages] = useState([]);

  // Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  // --- Auth Check & Fetch ---
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email !== 'admin@gmail.com') { 
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'This area is restricted to Administrators only.',
          confirmButtonColor: '#d33'
        });
        navigate('/');
      } else {
        fetchData();
      }
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [v, c, i, n, m] = await Promise.all([
      supabase.from('volunteers').select('*').order('created_at', { ascending: false }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('lost_found_items').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    ]);

    setVolunteers(v.data || []);
    setComplaints(c.data || []);
    setItems(i.data || []);
    setNotices(n.data || []);
    setMessages(m.data || []);
    setLoading(false);
  };

  // --- Actions ---
  const postNotice = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('announcements').insert([{ 
      title: noticeTitle, 
      message: noticeMsg 
    }]);

    if (!error) {
      Swal.fire('Success', 'Announcement Posted!', 'success');
      setNoticeTitle('');
      setNoticeMsg('');
      fetchData();
    } else {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const deleteItem = async (table, id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await supabase.from(table).delete().eq('id', id);
      Swal.fire('Deleted!', 'Record has been deleted.', 'success');
      fetchData();
    }
  };

  const updateStatus = async (id, newStatus) => {
    await supabase.from('complaints').update({ status: newStatus }).eq('id', id);
    fetchData();
    const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    toast.fire({ icon: 'success', title: `Status updated to ${newStatus}` });
  };

  // --- New Action: Approve Volunteer ---
  const approveVolunteer = async (id) => {
    await supabase.from('volunteers').update({ status: 'Approved' }).eq('id', id);
    fetchData();
    const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    toast.fire({ icon: 'success', title: `Volunteer Approved!` });
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* --- Admin Header --- */}
      <div className="bg-dark text-white py-4 shadow-sm mb-5" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #333 100%)' }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <ShieldCheck size={40} className="text-primary" />
            <div>
              <h2 className="fw-bold mb-0">Admin Dashboard</h2>
              <small className="text-white-50">Saylani Mass IT Hub Control Panel</small>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/')}>Logout / Home</button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        
        {/* --- Stats Overview Cards --- */}
        <div className="row g-3 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center justify-content-between bg-white rounded-4">
              <div>
                <h3 className="fw-bold text-dark mb-0">{volunteers.length}</h3>
                <small className="text-muted">Volunteers</small>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <Users size={28} />
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center justify-content-between bg-white rounded-4">
              <div>
                <h3 className="fw-bold text-dark mb-0">{items.length}</h3>
                <small className="text-muted">Lost Items</small>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <Search size={28} />
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center justify-content-between bg-white rounded-4">
              <div>
                <h3 className="fw-bold text-dark mb-0">{complaints.length}</h3>
                <small className="text-muted">Tickets</small>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                <Ticket size={28} />
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center justify-content-between bg-white rounded-4">
              <div>
                <h3 className="fw-bold text-dark mb-0">{messages.length}</h3>
                <small className="text-muted">Messages</small>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <Mail size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* --- Navigation Tabs --- */}
        <div className="d-flex overflow-auto gap-2 mb-4 pb-2">
          {[
            { id: 'volunteers', label: 'Volunteers', icon: <Users size={18}/> },
            { id: 'complaints', label: 'Complaints', icon: <Ticket size={18}/> },
            { id: 'items', label: 'Lost & Found', icon: <Search size={18}/> },
            { id: 'notices', label: 'Announcements', icon: <Megaphone size={18}/> },
            { id: 'messages', label: 'Messages', icon: <Mail size={18}/> }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 ${activeTab === tab.id ? 'btn-dark shadow' : 'btn-white bg-white text-muted border'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="bg-white p-4 rounded-4 shadow-sm border-0 min-vh-50">

          {/* 1. VOLUNTEERS TAB */}
          {activeTab === 'volunteers' && (
            <div>
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Users size={24} className="text-primary"/> Registered Volunteers</h4>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light"><tr><th>Volunteer Info</th><th>Event Details</th><th>Status</th><th>Contact</th><th>Actions</th></tr></thead>
                  <tbody>
                    {volunteers.map(v => (
                      <tr key={v.id}>
                        <td>
                          <div className="fw-bold">{v.name}</div>
                          <div className="text-muted small">Roll: {v.roll_no || 'N/A'}</div>
                        </td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary mb-1">{v.event}</span>
                          <div className="text-muted small d-flex align-items-center gap-1"><Clock size={12}/> {v.duration || 'Not specified'}</div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${v.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {v.status || 'Pending'}
                          </span>
                        </td>
                        <td className="font-monospace small d-flex align-items-center gap-1"><Phone size={14}/> {v.phone}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {v.status !== 'Approved' && (
                              <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={() => approveVolunteer(v.id)} title="Approve">
                                <CheckCircle size={16}/> Approve
                              </button>
                            )}
                            <button className="btn btn-sm btn-outline-danger p-1" onClick={() => deleteItem('volunteers', v.id)} title="Delete">
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. COMPLAINTS TAB */}
          {activeTab === 'complaints' && (
            <div>
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Ticket size={24} className="text-warning"/> Support Tickets</h4>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light"><tr><th>Date</th><th>Category & Campus</th><th>Issue</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="fw-bold text-dark">{c.category}</div>
                          <div className="text-muted small d-flex align-items-center gap-1 mt-1"><Building size={12}/> {c.campus || 'Head Office'}</div>
                        </td>
                        <td className="small text-muted" style={{maxWidth: '300px'}}>{c.description}</td>
                        <td>
                          <span className={`badge rounded-pill ${c.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {c.status !== 'Resolved' && (
                              <button className="btn btn-sm btn-success rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => updateStatus(c.id, 'Resolved')}>
                                <CheckCircle size={16}/> Solve
                              </button>
                            )}
                            <button className="btn btn-sm btn-outline-danger p-1 border-0" onClick={() => deleteItem('complaints', c.id)} title="Delete">
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. LOST ITEMS TAB */}
          {activeTab === 'items' && (
            <div>
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Search size={24} className="text-danger"/> Lost & Found Items</h4>
              <div className="row g-3">
                {items.map(i => (
                  <div className="col-md-4 col-lg-3" key={i.id}>
                    <div className="card h-100 border shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span className={`badge ${i.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>{i.type}</span>
                          <span className={`badge ${i.status === 'Pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{i.status}</span>
                        </div>
                        <h6 className="fw-bold">{i.title}</h6>
                        <p className="small text-muted text-truncate">{i.description}</p>
                        <p className="small mb-3 d-flex align-items-center gap-1"><Phone size={14}/> {i.contact}</p>
                        <button className="btn btn-sm btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2" onClick={() => deleteItem('lost_found_items', i.id)}>
                          <Trash2 size={16}/> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. NOTICES TAB */}
          {activeTab === 'notices' && (
            <div className="row">
              <div className="col-md-4 border-end">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><Megaphone size={20}/> Post Announcement</h5>
                <form onSubmit={postNotice}>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted">Title</label>
                    <input className="form-control" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted">Message</label>
                    <textarea className="form-control" rows="4" value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} required></textarea>
                  </div>
                  <button className="btn btn-dark w-100 fw-bold">Publish Notice</button>
                </form>
              </div>
              <div className="col-md-8 ps-md-4">
                <h5 className="fw-bold mb-3">Active Notices</h5>
                <div className="list-group">
                  {notices.map(n => (
                    <div key={n.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start border-0 border-bottom">
                      <div>
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1 fw-bold text-dark">{n.title}</h6>
                        </div>
                        <p className="mb-1 text-secondary small">{n.message}</p>
                        <small className="text-muted d-flex align-items-center gap-1"><Clock size={12}/> {new Date(n.created_at).toLocaleDateString()}</small>
                      </div>
                      <button className="btn btn-sm text-danger border-0 bg-transparent" onClick={() => deleteItem('announcements', n.id)}>
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div>
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Mail size={24} className="text-info"/> Contact Inquiries</h4>
              <div className="row">
                {messages.map(m => (
                  <div className="col-md-6 mb-3" key={m.id}>
                    <div className="p-3 border rounded bg-light position-relative">
                      <button 
                        className="btn btn-sm position-absolute top-0 end-0 m-2 text-muted border-0 bg-transparent" 
                        onClick={() => deleteItem('contact_messages', m.id)}
                        title="Delete Message"
                      >
                        <X size={18}/>
                      </button>
                      <h6 className="fw-bold mb-0">{m.name}</h6>
                      <small className="text-primary">{m.email}</small>
                      <hr className="my-2"/>
                      <p className="mb-0 small text-secondary">"{m.message}"</p>
                      <small className="text-muted d-flex align-items-center gap-1 mt-2 justify-content-end" style={{fontSize: '0.7rem'}}>
                        <Clock size={12}/> {new Date(m.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-muted">No new messages.</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;