import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('volunteers');
  
  // Data States
  const [volunteers, setVolunteers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [items, setItems] = useState([]);
  const [notices, setNotices] = useState([]); 
  const [messages, setMessages] = useState([]); // 1. New State for Messages

  // Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email !== 'admin@gmail.com') { 
        Swal.fire('Access Denied', 'Sirf Admin yahan aa sakta hai!', 'error');
        navigate('/');
      } else {
        fetchData();
      }
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    // 1. Fetch Volunteers
    const { data: vData } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false });
    setVolunteers(vData || []);

    // 2. Fetch Complaints
    const { data: cData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(cData || []);

    // 3. Fetch Lost Items
    const { data: iData } = await supabase.from('lost_found_items').select('*').order('created_at', { ascending: false });
    setItems(iData || []);

    // 4. Fetch Notices
    const { data: nData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setNotices(nData || []);

    // 5. Fetch Messages (Contact Form)
    const { data: mData } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages(mData || []);
  };

  // --- Notice Post Karna ---
  const postNotice = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('announcements').insert([{ 
      title: noticeTitle, 
      message: noticeMsg 
    }]);

    if (!error) {
      Swal.fire('Success', 'Notice Board Updated!', 'success');
      setNoticeTitle('');
      setNoticeMsg('');
      fetchData();
    } else {
      Swal.fire('Error', error.message, 'error');
    }
  };

  // Delete Function (Generic)
  const deleteItem = async (table, id) => {
    if(!window.confirm("Are you sure?")) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData(); // Refresh data
  };

  // Complaint Solve Function
  const updateStatus = async (id, newStatus) => {
    await supabase.from('complaints').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold text-danger mb-4">🛡️ Admin Dashboard</h2>

      {/* Analytics Cards (Numbers) */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary p-3 mb-2">
            <h3>{volunteers.length}</h3>
            <p className="mb-0">Volunteers</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success p-3 mb-2">
            <h3>{items.length}</h3>
            <p className="mb-0">Lost Items</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning p-3 mb-2">
            <h3>{complaints.length}</h3>
            <p className="mb-0">Complaints</p>
          </div>
        </div>
        {/* New Messages Stats Card */}
        <div className="col-md-3">
          <div className="card text-white bg-info p-3 mb-2">
            <h3>{messages.length}</h3>
            <p className="mb-0">New Messages</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'volunteers' ? 'active' : ''}`} onClick={() => setActiveTab('volunteers')}>Volunteers</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>Complaints</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Lost & Found</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'notices' ? 'active fw-bold text-danger' : ''}`} onClick={() => setActiveTab('notices')}>📢 Announcements</button></li>
        {/* New Messages Tab */}
        <li className="nav-item"><button className={`nav-link ${activeTab === 'messages' ? 'active fw-bold text-primary' : ''}`} onClick={() => setActiveTab('messages')}>📩 Messages</button></li>
      </ul>

      {/* --- Tab: Messages (NEW) --- */}
      {activeTab === 'messages' && (
        <div className="bg-white p-3 shadow-sm rounded">
          <h5 className="fw-bold mb-3">User Inquiries</h5>
          <div className="list-group">
            {messages.map(m => (
              <div key={m.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="fw-bold mb-1">{m.name} <span className="text-muted fw-normal" style={{fontSize: '0.9rem'}}>({m.email})</span></h6>
                    <p className="mb-2 mt-2 bg-light p-2 rounded border">{m.message}</p>
                    <small className="text-muted">Received: {new Date(m.created_at).toLocaleString()}</small>
                  </div>
                  <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => deleteItem('contact_messages', m.id)}>Delete</button>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-center text-muted p-3">No messages yet.</p>}
          </div>
        </div>
      )}

      {/* --- Tab: Announcements --- */}
      {activeTab === 'notices' && (
        <div className="row">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm border-0 bg-light">
              <h5 className="fw-bold">Post New Notice</h5>
              <form onSubmit={postNotice}>
                <input className="form-control mb-2" placeholder="Title (e.g. Holiday)" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} required />
                <textarea className="form-control mb-2" rows="3" placeholder="Message..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} required></textarea>
                <button className="btn btn-danger w-100">Post Notice</button>
              </form>
            </div>
          </div>
          <div className="col-md-8">
            <h5 className="fw-bold">Active Notices</h5>
            <div className="list-group">
              {notices.map(n => (
                <div key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 fw-bold text-danger">{n.title}</h6>
                    <p className="mb-0 small text-muted">{n.message}</p>
                    <small className="text-muted" style={{fontSize: '0.7rem'}}>{new Date(n.created_at).toLocaleDateString()}</small>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem('announcements', n.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab: Volunteers --- */}
      {activeTab === 'volunteers' && (
        <div className="table-responsive bg-white p-3 shadow-sm rounded">
          <table className="table">
            <thead><tr><th>Name</th><th>Event</th><th>Availability</th><th>Phone</th></tr></thead>
            <tbody>
              {volunteers.map(v => <tr key={v.id}><td>{v.name}</td><td>{v.event}</td><td>{v.availability}</td><td>{v.phone}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Tab: Complaints --- */}
      {activeTab === 'complaints' && (
        <div className="table-responsive bg-white p-3 shadow-sm rounded">
          <table className="table">
            <thead><tr><th>Category</th><th>Description</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td>{c.category}</td><td>{c.description}</td>
                  <td><span className={`badge ${c.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>{c.status}</span></td>
                  <td>{c.status !== 'Resolved' && <button className="btn btn-sm btn-success" onClick={() => updateStatus(c.id, 'Resolved')}>Mark Resolved</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

       {/* --- Tab: Lost Items --- */}
       {activeTab === 'items' && (
        <div className="table-responsive bg-white p-3 shadow-sm rounded">
          <table className="table">
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.title}</td><td>{i.type}</td>
                  <td>{i.status}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => deleteItem('lost_found_items', i.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;