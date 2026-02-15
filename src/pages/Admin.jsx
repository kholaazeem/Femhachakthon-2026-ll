import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('volunteers');
  const [volunteers, setVolunteers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [items, setItems] = useState([]);

  // Check if user is Admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Replace with your email for testing
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
  };

  // Update Complaint Status
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      Swal.fire({ icon: 'success', title: 'Status Updated!', timer: 1000, showConfirmButton: false });
      fetchData();
    }
  };

  // Delete Item (Extra Power)
  const deleteItem = async (table, id) => {
    if(!window.confirm("Are you sure?")) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold text-danger mb-4">🛡️ Admin Dashboard</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'volunteers' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('volunteers')}>Volunteers</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'complaints' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('complaints')}>Complaints</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'items' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('items')}>Lost & Found</button>
        </li>
      </ul>

      {/* --- Tab 1: Volunteers List --- */}
      {activeTab === 'volunteers' && (
        <div className="table-responsive bg-white p-3 shadow-sm rounded">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Name</th><th>Event</th><th>Availability</th><th>Phone</th></tr>
            </thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td><span className="badge bg-primary">{v.event}</span></td>
                  <td>{v.availability}</td>
                  <td>{v.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Tab 2: Complaints Management --- */}
      {activeTab === 'complaints' && (
        <div className="table-responsive bg-white p-3 shadow-sm rounded">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>User</th><th>Category</th><th>Description</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td className="small text-muted">{c.user_email}</td>
                  <td className="fw-bold">{c.category}</td>
                  <td>{c.description}</td>
                  <td>
                    <span className={`badge ${c.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>{c.status}</span>
                  </td>
                  <td>
                    {c.status !== 'Resolved' && (
                      <button className="btn btn-sm btn-success" onClick={() => updateStatus(c.id, 'Resolved')}>Mark Resolved</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Tab 3: Lost Items Management --- */}
      {activeTab === 'items' && (
        <div className="table-responsive bg-white p-3 shadow-sm rounded">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Title</th><th>Type</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.title}</td>
                  <td><span className={`badge ${i.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>{i.type}</span></td>
                  <td>{i.status}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem('lost_found_items', i.id)}>Delete</button>
                  </td>
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