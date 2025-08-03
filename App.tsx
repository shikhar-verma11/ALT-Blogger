import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AuthPage from './pages/AuthPage';
import NewPostPage from './pages/NewPostPage';
import ProfilePage from './pages/ProfilePage';
import { AuthContext } from './contexts/AuthContext';

const App: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div>Loading...</div>;
  }
  const { user } = authContext;

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return user ? <>{children}</> : <Navigate to="/auth" />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-light-text dark:text-dark-text">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-in-up">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/auth" element={user ? <Navigate to="/profile" /> : <AuthPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="bg-light-card/50 dark:bg-dark-card/50 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-light-subtle dark:text-dark-subtle">
        <div className="container mx-auto px-4">
            <p className="text-sm">&copy; 2024 ALT Blogger. All rights reserved.</p>
            <p className="text-xs mt-2">Powered by React and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
// test change