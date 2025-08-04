import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AuthPage from './pages/AuthPage';
import NewPostPage from './pages/NewPostPage';
import ProfilePage from './pages/ProfilePage';
import { AuthContext } from './contexts/AuthContext';

// --- This component is now more robust ---
// It checks the loading state before deciding to redirect.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useContext(AuthContext)!;

  if (loading) {
    return <div>Loading session...</div>; // Show loading screen while checking
  }

  if (!user) {
    return <Navigate to="/auth" replace />; // Redirect if not logged in
  }

  return <>{children}</>; // Show the protected page if logged in
};

const App: React.FC = () => {
  const authContext = useContext(AuthContext);

  // Show a global loading indicator while Firebase initializes
  if (authContext?.loading) {
    return <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">Loading...</div>;
  }
  
  const { user } = authContext!;

  return (
    <div className="min-h-screen flex flex-col font-sans text-light-text dark:text-dark-text">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-in-up">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Note the change on the next line for the PostPage route */}
          <Route path="/post/:postId" element={<PostPage />} />
          
          {/* If the user is logged in, redirect from /auth to their profile */}
          <Route path="/auth" element={user ? <Navigate to="/profile" replace /> : <AuthPage />} />
          
          {/* These routes are now correctly protected */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="bg-light-card/50 dark:bg-dark-card/50 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-light-subtle dark:text-dark-subtle">
        <div className="container mx-auto px-4">
            <p className="text-sm">&copy; 2025 ALT Blogger. All rights reserved.</p>
            <p className="text-xs mt-2">Powered by React and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;