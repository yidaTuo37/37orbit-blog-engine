import React, { useState, useEffect } from 'react';
import LayoutDemo from './pages/LayoutDemo';

//
const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  // Force hash-router to always run at site root
  if (window.location.pathname !== '/') {
    const hash = window.location.hash || '#/';
    window.location.replace(`/${hash}`);
  }

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return <LayoutDemo route={route} />;
};

export default App;
