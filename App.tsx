import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import { DiaryPage, FramesPage, ProjectDetailPage, ProjectsPage } from './pages/CollectionPage';

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

  const renderRoute = () => {
    if (route.startsWith('#/article/')) {
      const slug = route.replace('#/article/', '');
      return <ArticleDetail slug={slug} />;
    }

    if (route.startsWith('#/projects/')) {
      const id = route.replace('#/projects/', '');
      return <ProjectDetailPage id={id} />;
    }

    switch (route) {
      case '#/projects':
        return <ProjectsPage />;
      case '#/frames':
        return <FramesPage />;
      case '#/diary':
        return <DiaryPage />;
      case '#/':
      default:
        return <Home />;
    }
  };

  return (
    route === '#/' ? renderRoute() : <Layout>{renderRoute()}</Layout>
  );
};

export default App;
