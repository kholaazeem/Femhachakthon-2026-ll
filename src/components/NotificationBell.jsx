import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Bell, Trash2 } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NotificationBell = ({ userEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) return;

    // 1. INITIAL FETCH: Jab user login kare toh aakhri 5 posts database se utha lo
    const fetchRecentPosts = async () => {
      const { data, error } = await supabase
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false }) // Sab se naye pehle
        .limit(5); // Sirf aakhri 5 dikhao

      if (!error && data) {
        // Apni posts ko nikal kar baqi notifications mein daal do
        const othersPosts = data.filter(item => item.user_email !== userEmail);
        setNotifications(othersPosts);
      }
    };

    fetchRecentPosts(); // Login hotay hi ye function chalega

    // 2. REALTIME LISTENER: Ab naye aane wale live signals suno
    const channel = supabase.channel('global-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lost_found_items' },
        (payload) => {
          const newItem = payload.new;

          // Agar kisi doosre ne post ki hai, toh usay list mein add karo aur popup dikhao
          if (newItem.user_email !== userEmail) {
            setNotifications((prev) => [newItem, ...prev]);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'info',
              title: `New Alert!`,
              text: `${newItem.title} (${newItem.type})`,
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
              background: '#fff',
              color: '#333'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return (
    <div className="position-relative">
      <button 
        className="btn text-white p-2 position-relative border-0 rounded-circle shadow-none transition-all" 
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '0.6rem' }}>
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="position-absolute bg-white shadow-lg rounded-3 mt-2 border-0 overflow-hidden" 
             style={{ right: '0', width: '290px', zIndex: 1050 }}>
          
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark small">Recent Updates</span>
            {notifications.length > 0 && (
              <button className="btn btn-sm text-danger p-0 border-0" onClick={() => setNotifications([])} title="Clear All">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">No recent updates</div>
            ) : (
              notifications.map((item, index) => (
                <div 
                  key={index} 
                  className="p-3 border-bottom hover-bg-light" 
                  style={{ cursor: 'pointer', transition: '0.2s' }}
                  onClick={() => { navigate('/lost-found'); setShowDropdown(false); }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={`badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`} style={{fontSize: '0.6rem'}}>
                      {item.type}
                    </span>
                    <span className="fw-bold text-dark small text-truncate" style={{maxWidth: '180px'}}>{item.title}</span>
                  </div>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>By: {item.user_email}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;