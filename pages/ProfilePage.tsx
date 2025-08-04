import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

type Tab = 'myPosts' | 'likedPosts' | 'savedPosts';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('myPosts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  
  const user = authContext?.user;

  // This useEffect hook now runs whenever the activeTab or user changes.
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      setLoading(true);

      let postsQuery;
      const postsCollection = collection(db, "posts");

      switch (activeTab) {
        case 'myPosts':
          postsQuery = query(postsCollection, where("authorId", "==", user.id), orderBy("createdAt", "desc"));
          break;
        case 'likedPosts':
          postsQuery = query(postsCollection, where("likes", "array-contains", user.id));
          break;
        case 'savedPosts':
          postsQuery = query(postsCollection, where("saves", "array-contains", user.id));
          break;
        default:
          postsQuery = query(postsCollection, where("authorId", "==", user.id), orderBy("createdAt", "desc"));
      }

      try {
        const querySnapshot = await getDocs(postsQuery);
        // --- THIS IS THE CORRECTED PART ---
        const fetchedPosts = querySnapshot.docs.map(doc => {
          // Explicitly cast doc.data() to the Post type
          const data = doc.data() as Omit<Post, 'id'>;
          return {
            id: doc.id,
            ...data
          };
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, activeTab]); // Re-fetches when the user or active tab changes

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
          // The onInteraction prop is removed for a simpler data flow
          <PostCard key={`${activeTab}-${post.id}`} post={post} />
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