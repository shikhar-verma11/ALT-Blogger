import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { Post } from '../types';
import { mockApi } from '../services/mockApi';
import PostCard from '../components/PostCard';

type Tab = 'myPosts' | 'likedPosts' | 'savedPosts';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('myPosts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  
  const user = authContext?.user;

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const allPosts = await mockApi.getPosts();
    let filteredPosts: Post[] = [];

    switch (activeTab) {
      case 'myPosts':
        filteredPosts = allPosts.filter(p => p.authorId === user.id);
        break;
      case 'likedPosts':
        filteredPosts = allPosts.filter(p => p.likes.includes(user.id));
        break;
      case 'savedPosts':
        filteredPosts = allPosts.filter(p => p.saves.includes(user.id));
        break;
    }
    setPosts(filteredPosts);
    setLoading(false);
  }, [user, activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!user) {
    return <div className="text-center py-10">You need to be logged in to view this page.</div>;
  }

  const tabClasses = (tabName: Tab) => `px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ${
    activeTab === tabName 
      ? 'bg-brand-purple text-white shadow-md' 
      : 'bg-transparent text-light-subtle dark:text-dark-subtle hover:bg-gray-200 dark:hover:bg-gray-700'
  }`;

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10">Loading...</div>;
    }
    if (posts.length === 0) {
        let message = "";
        if (activeTab === "myPosts") message = "You haven't created any posts yet.";
        if (activeTab === "likedPosts") message = "You haven't liked any posts yet.";
        if (activeTab === "savedPosts") message = "You haven't saved any posts yet.";
      return <div className="text-center py-20 text-light-subtle dark:text-dark-subtle bg-light-card dark:bg-dark-card rounded-xl">{message}</div>;
    }
    return (
      <div className="columns-1 md:columns-2 gap-8 mt-6">
        {posts.map(post => (
          <PostCard key={`${activeTab}-${post.id}`} post={post} onInteraction={fetchPosts} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-8 mb-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-4xl mb-4 ring-4 ring-light-card dark:ring-dark-card">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-4xl font-bold text-light-text dark:text-dark-text">@{user.username}</h1>
        <p className="text-light-subtle dark:text-dark-subtle mt-1">{user.email}</p>
      </div>

      <div className="flex justify-center p-2 bg-gray-200/70 dark:bg-gray-800/70 rounded-full mb-8">
        <button onClick={() => setActiveTab('myPosts')} className={tabClasses('myPosts')}>My Posts</button>
        <button onClick={() => setActiveTab('likedPosts')} className={tabClasses('likedPosts')}>Liked Posts</button>
        <button onClick={() => setActiveTab('savedPosts')} className={tabClasses('savedPosts')}>Saved Posts</button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default ProfilePage;