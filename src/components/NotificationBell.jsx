import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Bell, Trash2, X } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NotificationBell = ({ userEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // --- LOCAL STATE (Har user ka apna data) ---
  const [hiddenIds, setHiddenIds] = useState([]);
  const [readIds, setReadIds] = useState([]);

  useEffect(() => {
    if (!userEmail) return;

    // 1. User ki read aur hidden notifications browser se uthao
    const localHidden = JSON.parse(localStorage.getItem(`hidden_notifs_${userEmail}`) || '[]');
    const localRead = JSON.parse(localStorage.getItem(`read_notifs_${userEmail}`) || '[]');
    setHiddenIds(localHidden);
    setReadIds(localRead);

    // 2. User ki Account Creation Date check karo (ISSUE 3 FIX)
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
        .gte('created_at', userCreatedAt) // Sirf wo posts jo account banne ke baad aayin
        .order('created_at', { ascending: false })
        .limit(15);

      if (!error && data) {
        setNotifications(data);
      }
    };

    initData();

    // 3. REALTIME LISTENER
    const channel = supabase.channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new;

          // Khud ki post par alert na do
          if (newNotif.user_email !== userEmail) {
            setNotifications((prev) => [newNotif, ...prev]);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'info',
              title: newNotif.title,
              text: 'Check your notifications',
              showConfirmButton: false,
              timer: 4000,
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

  // --- LOGIC: Filter visible and unread notifications ---
  // Jo hide ho chuki hain, ya jo khud ki post hain unhe list se nikalo
  const visibleNotifications = notifications.filter(
    (n) => !hiddenIds.includes(n.id) && n.user_email !== userEmail
  );

  // Unread badge count
  const unreadCount = visibleNotifications.filter((n) => !readIds.includes(n.id)).length;

  // --- ACTIONS ---

  // Jab Bell par click ho (ISSUE 1 FIX)
  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    // Agar dropdown open kar raha hai aur unread msgs hain, toh sabko 'Read' mark kar do
    if (!showDropdown && unreadCount > 0) {
      const allVisibleIds = visibleNotifications.map(n => n.id);
      const updatedReadIds = [...new Set([...readIds, ...allVisibleIds])];
      
      setReadIds(updatedReadIds);
      localStorage.setItem(`read_notifs_${userEmail}`, JSON.stringify(updatedReadIds));
    }
  };

  // Har notification ka apna Delete button (ISSUE 2 FIX)
  const handleDeleteSingle = (e, id) => {
    e.stopPropagation(); // Parent par click hone se roko
    const updatedHidden = [...hiddenIds, id];
    setHiddenIds(updatedHidden);
    localStorage.setItem(`hidden_notifs_${userEmail}`, JSON.stringify(updatedHidden));
  };

  // Clear All button
  const handleClearAll = () => {
    const allVisibleIds = visibleNotifications.map(n => n.id);
    const updatedHidden = [...new Set([...hiddenIds, ...allVisibleIds])];
    
    setHiddenIds(updatedHidden);
    localStorage.setItem(`hidden_notifs_${userEmail}`, JSON.stringify(updatedHidden));
    setShowDropdown(false);
  };

  // Notification par click karna
  const handleItemClick = () => {
    navigate('/lost-found');
    setShowDropdown(false);
  };

  return (
    <div className="position-relative">
      <button 
        className="btn text-white p-2 position-relative border-0 rounded-circle shadow-none" 
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        onClick={handleBellClick}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '0.6rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="position-absolute bg-white shadow-lg rounded-3 mt-2 border-0 overflow-hidden" 
             style={{ right: '0', width: '300px', zIndex: 1050 }}>
          
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark small">Notifications</span>
            {visibleNotifications.length > 0 && (
              <button 
                className="btn btn-sm text-danger p-0 border-0 fw-bold small" 
                onClick={handleClearAll}
                title="Clear All"
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {visibleNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">No new updates</div>
            ) : (
              visibleNotifications.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 border-bottom hover-bg-light position-relative" 
                  style={{ cursor: 'pointer', transition: '0.2s', backgroundColor: readIds.includes(item.id) ? '#fff' : '#f0f8ff' }}
                  onClick={() => handleItemClick()}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="pe-3">
                      <h6 className="fw-bold text-dark small mb-1">{item.title}</h6>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{item.message}</p>
                    </div>
                    {/* Individual Delete Button */}
                    <button 
                      className="btn btn-sm p-1 text-muted hover-danger border-0" 
                      onClick={(e) => handleDeleteSingle(e, item.id)}
                      title="Remove notification"
                    >
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