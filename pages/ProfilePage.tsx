import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { Post, User } from '../types'; // Ensure User type is imported
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

type Tab = 'myPosts' | 'likedPosts' | 'savedPosts';

const ProfilePage: React.FC = () => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const [activeTab, setActiveTab] = useState<Tab>('myPosts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Determine if this is the user's own profile
  const isOwnProfile = !urlUsername || urlUsername === currentUser?.username;

  // 2. Fetch User Data based on the URL username
  useEffect(() => {
    const fetchProfileUser = async () => {
      if (isOwnProfile) {
        setProfileUser(currentUser);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", urlUsername), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setProfileUser({ id: querySnapshot.docs[0].id, ...userData });
          setError(null);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user");
      }
      setLoading(false);
    };

    fetchProfileUser();
  }, [urlUsername, currentUser, isOwnProfile]);

  // 3. Fetch Posts for the profile being viewed
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profileUser) return;
      setLoading(true);

      let postsQuery;
      const postsCollection = collection(db, "posts");

      // Logic: If viewing someone else, only show 'myPosts' (their posts)
      // Usually Liked and Saved posts are private.
      switch (activeTab) {
        case 'myPosts':
          postsQuery = query(postsCollection, where("authorId", "==", profileUser.id), orderBy("createdAt", "desc"));
          break;
        case 'likedPosts':
          postsQuery = query(postsCollection, where("likes", "array-contains", profileUser.id));
          break;
        case 'savedPosts':
          postsQuery = query(postsCollection, where("saves", "array-contains", profileUser.id));
          break;
        default:
          postsQuery = query(postsCollection, where("authorId", "==", profileUser.id), orderBy("createdAt", "desc"));
      }

      try {
        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Post));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profileUser) fetchPosts();
  }, [profileUser, activeTab]);

  if (loading && !profileUser) return <div className="text-center py-20">Loading Profile...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!profileUser && !currentUser) return <div className="text-center py-20">Please log in.</div>;

  const tabClasses = (tabName: Tab) => `px-6 py-2 text-sm font-semibold rounded-full transition-all ${
    activeTab === tabName 
      ? 'bg-brand-purple text-white shadow-lg' 
      : 'text-light-subtle dark:text-dark-subtle hover:bg-gray-200 dark:hover:bg-gray-700'
  }`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-8 mb-8 flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-4xl mb-4 ring-4 ring-white dark:ring-gray-900 shadow-xl">
          {profileUser?.username?.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-3xl font-bold text-light-text dark:text-dark-text">@{profileUser?.username}</h1>
        {isOwnProfile && <p className="text-light-subtle dark:text-dark-subtle text-sm mt-1">{profileUser?.email}</p>}
      </div>

      {/* Tabs - Only show Liked/Saved if it's the user's own profile */}
      <div className="flex justify-center p-1.5 bg-gray-200/50 dark:bg-gray-800/50 rounded-full mb-8 max-w-md mx-auto">
        <button onClick={() => setActiveTab('myPosts')} className={tabClasses('myPosts')}>
          {isOwnProfile ? 'My Posts' : 'Posts'}
        </button>
        {isOwnProfile && (
          <>
            <button onClick={() => setActiveTab('likedPosts')} className={tabClasses('likedPosts')}>Liked</button>
            <button onClick={() => setActiveTab('savedPosts')} className={tabClasses('savedPosts')}>Saved</button>
          </>
        )}
      </div>
      
      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-10">Updating list...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-light-card dark:bg-dark-card rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           {isOwnProfile ? "You haven't added anything here yet." : "This user hasn't posted anything yet."}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;