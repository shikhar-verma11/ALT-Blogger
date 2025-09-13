import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ErrorIcon: React.FC = () => (
    <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm1-4a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1z" />
    </svg>
);

// --- NEW: Google Icon for the button ---
const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.494 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) return null;
  const { login, signup, signInWithGoogle } = authContext; // Get the new function

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if(!email || !password || (!isLogin && !username)){
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(username, email, password);
      }
      navigate('/profile');

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handler for Google Sign-In button ---
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
        await signInWithGoogle();
        navigate('/profile');
    } catch (err: any) {
        setError(err.message || 'An error occurred with Google Sign-In.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button onClick={() => setIsLogin(true)} className={`w-1/2 py-4 font-display text-lg font-semibold transition-colors ${isLogin ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-light-subtle dark:text-dark-subtle'}`}>
            Login
          </button>
          <button onClick={() => setIsLogin(false)} className={`w-1/2 py-4 font-display text-lg font-semibold transition-colors ${!isLogin ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-light-subtle dark:text-dark-subtle'}`}>
            Sign Up
          </button>
        </div>
        
        <h2 className="font-display text-3xl font-bold text-center text-light-text dark:text-dark-text mb-2">{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
        <p className="text-center text-light-subtle dark:text-dark-subtle mb-6">{isLogin ? 'Log in to continue your journey.' : 'Join our community of creators.'}</p>
        
        {error && (
             <div className="bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6" role="alert">
               <div className="flex">
                   <div className="py-1"><ErrorIcon /></div>
                   <div>
                       <p className="font-bold">An error occurred</p>
                       <p className="text-sm">{error}</p>
                   </div>
               </div>
            </div>
        )}
        
        <div className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-light-text dark:text-dark-text">Username</label>
              <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple" />
          </div>
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-dark-text">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple" />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-yellow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:opacity-60 transition-all transform hover:scale-105">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>

        {/* --- NEW: Separator and Google Sign-In Button --- */}
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-light-subtle dark:text-dark-subtle text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-lg font-semibold text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-60">
            <GoogleIcon />
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

      </div>
    </div>
  );
};

export default AuthPage;