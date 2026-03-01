import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { Megaphone, X } from 'lucide-react'; 

const AnnouncementBanner = () => {
  const [latestNotice, setLatestNotice] = useState(null);
  const [isVisible, setIsVisible] = useState(true); 

  useEffect(() => {
    const fetchNotice = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setLatestNotice(data[0]);
      }
    };

    fetchNotice();
  }, []);


  if (!latestNotice || !isVisible) return null;

  return (
    <div className="bg-warning text-dark py-2 px-3 shadow-sm border-bottom border-dark position-relative animate__animated animate__fadeInDown">
      <div className="container d-flex align-items-center justify-content-between">
        
        {/* Left Side: Text */}
        <div className="d-flex align-items-center text-truncate">
          <span className="badge bg-dark text-warning me-2 animate__animated animate__flash animate__infinite animate__slower d-flex align-items-center gap-1">
            <Megaphone size={12} /> NEW
          </span>
          <span className="fw-bold small text-truncate">
            <span className="text-uppercase me-1">{latestNotice.title}:</span>
            <span className="fw-normal">{latestNotice.message}</span>
          </span>
        </div>

        {/* Right Side: Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="btn btn-link text-dark p-0 ms-3 text-decoration-none d-flex align-items-center"
          title="Close"
        >
          <X size={20} />
        </button>

      </div>
    </div>
  );
};

export default AnnouncementBanner;