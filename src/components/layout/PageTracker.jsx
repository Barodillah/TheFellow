import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // We want to wait a small amount to let the document title update
    // from any page-level useEffects or Helmet if they exist
    const timer = setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('csm_user')) || {};
      const userId = user.id || null;
      let sessionId = localStorage.getItem('session_id');

      // Generate a simple session ID if none exists for guest tracking
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('session_id', sessionId);
      }

      // Do not log visits on localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }

      fetch('https://www.incsmsociety.site/api/log_page_visit.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          page_title: document.title,
          page_url: window.location.href,
        }),
      }).catch((err) => {
        console.error('Failed to log page visit', err);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default PageTracker;
