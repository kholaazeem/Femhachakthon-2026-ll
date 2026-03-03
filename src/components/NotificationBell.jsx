import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Bell, Trash2, X } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NotificationBell = ({ userEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const [hiddenIds, setHiddenIds] = useState([]);
  const [readIds, setReadIds] = useState([]);

  useEffect(() => {
    // Agar userEmail nahi aya parent se, toh ruk jao
    if (!userEmail) return;

    console.log("🟢 Bell is active for user:", userEmail);

    const localHidden = JSON.parse(localStorage.getItem(`hidden_notifs_${userEmail}`) || '[]');
    const localRead = JSON.parse(localStorage.getItem(`read_notifs_${userEmail}`) || '[]');
    setHiddenIds(localHidden);
    setReadIds(localRead);

    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchNotifications(user.created_at);
      }
    };

    const fetchNotifications = async (userCreatedAt) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', userCreatedAt)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        const myNotifications = data.filter(n => {
           const target = String(n.target_email).toLowerCase().trim();
           const current = String(userEmail).toLowerCase().trim();
           return target === 'all' || target === current;
        });
        setNotifications(myNotifications);
      }
    };

    initData();

    // 🚀 REALTIME LISTENER WITH X-RAY LOGS
    const channel = supabase.channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new;
          
          // 🛠️ X-RAY LOG: Pata chalega signal aaya ya nahi!
          console.log("🔔 ALERT RECEIVED FROM SUPABASE!", newNotif);

          const target = String(newNotif.target_email).toLowerCase().trim();
          const current = String(userEmail).toLowerCase().trim();
          const sender = String(newNotif.user_email).toLowerCase().trim();

          console.log(`🎯 Matching: Target='${target}' | Current='${current}'`);

          // Agar target 'all' hai ya is specific user ka email hai
          if (target === 'all' || target === current) {
            
            // Agar sab ke liye thi aur khud ne bheji hai, toh ignore karo
            if (target === 'all' && sender === current) {
               console.log("🚫 Ignored: User's own global post.");
               return;
            }

            console.log("✅ Match Successful! Showing Popup...");
            setNotifications((prev) => [newNotif, ...prev]);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: target === 'all' ? 'info' : 'success',
              title: newNotif.title,
              text: newNotif.message || 'Check your notifications',
              showConfirmButton: false,
              timer: 5000,
              background: '#fff',
              color: '#333',
            
            });
          } else {
            console.log("❌ Match Failed: Yeh notification kisi aur ke liye thi.");
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime Connection Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  // --- LOGIC: Filter visible and unread notifications ---
  const visibleNotifications = notifications.filter((n) => {
    if (hiddenIds.includes(n.id)) return false;
    const target = String(n.target_email).toLowerCase().trim();
    const sender = String(n.user_email).toLowerCase().trim();
    const current = String(userEmail).toLowerCase().trim();
    if (target === 'all' && sender === current) return false;
    return true;
  });

  const unreadCount = visibleNotifications.filter((n) => !readIds.includes(n.id)).length;

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      const allVisibleIds = visibleNotifications.map(n => n.id);
      const updatedReadIds = [...new Set([...readIds, ...allVisibleIds])];
      setReadIds(updatedReadIds);
      localStorage.setItem(`read_notifs_${userEmail}`, JSON.stringify(updatedReadIds));
    }
  };

  const handleDeleteSingle = (e, id) => {
    e.stopPropagation();
    const updatedHidden = [...hiddenIds, id];
    setHiddenIds(updatedHidden);
    localStorage.setItem(`hidden_notifs_${userEmail}`, JSON.stringify(updatedHidden));
  };

  const handleClearAll = () => {
    const allVisibleIds = visibleNotifications.map(n => n.id);
    const updatedHidden = [...new Set([...hiddenIds, ...allVisibleIds])];
    setHiddenIds(updatedHidden);
    localStorage.setItem(`hidden_notifs_${userEmail}`, JSON.stringify(updatedHidden));
    setShowDropdown(false);
  };

  return (
    <div className="position-relative">
      <button 
        className="btn text-white p-2 position-relative border-0 rounded-circle shadow-none transition-all" 
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onClick={handleBellClick}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="position-absolute bg-white shadow-lg rounded-3 mt-2 border-0 overflow-hidden animate__animated animate__fadeIn" 
             style={{ right: '0', width: '300px', zIndex: 1050 }}>
          
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark small">Notifications</span>
            {visibleNotifications.length > 0 && (
              <button className="btn btn-sm text-danger p-0 border-0 fw-bold small" onClick={handleClearAll} title="Clear All">
                Clear All
              </button>
            )}
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {visibleNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">No new updates</div>
            ) : (
              visibleNotifications.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 border-bottom position-relative" 
                  style={{ cursor: 'pointer', transition: '0.2s', backgroundColor: readIds.includes(item.id) ? '#fff' : '#f0f8ff' }}
                  onClick={() => { navigate('/lost-found'); setShowDropdown(false); }}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="pe-3">
                      <h6 className="fw-bold text-dark small mb-1">{item.title}</h6>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{item.message}</p>
                    </div>
                    <button className="btn btn-sm p-1 text-muted hover-danger border-0" onClick={(e) => handleDeleteSingle(e, item.id)}>
                      <X size={16} />
                    </button>
                  </div>
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