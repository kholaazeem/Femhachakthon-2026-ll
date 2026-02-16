import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const AnnouncementBanner = () => {
  const [latestNotice, setLatestNotice] = useState(null);

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

  // Agar koi notice nahi hai, toh kuch mat dikhao (return null)
  if (!latestNotice) return null;

  return (
    <div className="bg-warning text-dark py-2 px-3 fw-bold text-center border-bottom border-dark shadow-sm">
      📢 LATEST NEWS: <span className="ms-2">{latestNotice.title}: {latestNotice.message}</span>
    </div>
  );
};

export default AnnouncementBanner;