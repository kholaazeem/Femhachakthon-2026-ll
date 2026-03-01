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
    console.log("🔔 Bell System Active for:", userEmail);
    if (!userEmail) return;

    // Naya Channel Name (Unique)
    const channel = supabase.channel('lf-global-alerts');

    channel
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'lost_found_items' 
        },
        (payload) => {
          // Sab se pehle console check karein
          console.log("🔥 DATABASE CHANGE DETECTED!", payload);

          const newItem = payload.new;
          
          // Agar email mismatch ho ya admin ho toh dikhao
          if (newItem.user_email !== userEmail) {
            setNotifications((prev) => [newItem, ...prev]);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'info',
              title: `New ${newItem.type} Item`,
              text: newItem.title,
              showConfirmButton: false,
              timer: 4000,
              timerProgressBar: true
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Subscription Status:", status);
      });

    return () => {
      console.log("🔌 Channel Closed");
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return (
    <div className="position-relative">
      <button 
        className="btn text-white p-2 position-relative border-0 rounded-circle" 
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
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
        <div className="position-absolute bg-white shadow-lg rounded-3 mt-2 border-0 overflow-hidden animate__animated animate__fadeIn" 
             style={{ right: '0', width: '280px', zIndex: 1050 }}>
          
          <div className="p-2 px-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark small">New Activity</span>
            {notifications.length > 0 && (
              <button className="btn btn-sm text-danger p-0 border-0" onClick={() => setNotifications([])}>
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">No new updates</div>
            ) : (
              notifications.map((item, index) => (
                <div 
                  key={index} 
                  className="p-3 border-bottom hover-bg-light" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => { navigate('/lost-found'); setShowDropdown(false); }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={`badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`} style={{fontSize: '0.6rem'}}>{item.type}</span>
                    <span className="fw-bold text-dark small text-truncate">{item.title}</span>
                  </div>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Posted by: {item.user_email}</p>
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