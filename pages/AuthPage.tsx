import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ErrorIcon: React.FC = () => (
    <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm1-4a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1z" />
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
  const { login, signup } = authContext;

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
        const user = await login(email, password);
        if (user) {
          navigate('/profile');
        } else {
          setError('Invalid credentials. Please check your email and password.');
        }
      } else {
        const user = await signup(username, email, password);
        if (user) {
          navigate('/profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
      </div>
    </div>
  );
};

export default AuthPage;