import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'title' | 'username' | 'hashtag'>('title');
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(postsQuery);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Post));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  useEffect(() => {
    if (filterType !== 'username' || !searchTerm) {
      setUserSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const usersQuery = query(
        collection(db, "posts"),
        where("authorUsername", ">=", searchTerm.toLowerCase()),
        where("authorUsername", "<=", searchTerm.toLowerCase() + '\uf8ff'),
        limit(5)
      );

      const querySnapshot = await getDocs(usersQuery);
      const uniqueUsernames = new Set(querySnapshot.docs.map(doc => doc.data().authorUsername));
      setUserSuggestions(Array.from(uniqueUsernames));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterType]);

  const handleUserSelect = (username: string) => {
    setSelectedUser(username);
    setSearchTerm(username);
    setUserSuggestions([]);
  };

  const filteredPosts = posts.filter(post => {
    // If a user has been selected, ONLY filter by that user.
    if (selectedUser) {
      return post.authorUsername === selectedUser;
    }

    // If no user is selected, proceed with other filters.
    const term = searchTerm.toLowerCase();
    if (!term) return true; // Show all posts if search is empty

    switch (filterType) {
      // We no longer handle 'username' here because it's covered by 'selectedUser'
      case 'hashtag':
        return post.hashtags?.some(tag => tag.toLowerCase().includes(term));
      case 'title':
      default:
        return post.title.toLowerCase().includes(term);
    }
  });
  
  const handleFilterChange = (newFilter: 'title' | 'username' | 'hashtag') => {
    setFilterType(newFilter);
    setSelectedUser(null);
    setSearchTerm('');
  };

  if (loading) {
    return <div className="columns-1 md:columns-2 gap-8">{/* Skeleton loaders... */}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-light-text dark:text-dark-text mb-4">
            Discover Stories
        </h1>
        <p className="text-lg text-light-subtle dark:text-dark-subtle">
            A place for creators, thinkers, and explorers.
        </p>
      </div>

      <div className="mb-12 max-w-lg mx-auto flex items-center gap-2">
        <div className="relative w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUser(null);
            }}
            placeholder={`Search by ${filterType}...`}
            className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />
          {userSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10">
              {userSuggestions.map(username => (
                <button
                  key={username}
                  onClick={() => handleUserSelect(username)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {username}
                </button>
              ))}
            </div>
          )}
        </div>
        <select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value as any)}
          className="px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
        >
          <option value="title">Title</option>
          <option value="username">Username</option>
          <option value="hashtag">Hashtag</option>
        </select>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="columns-1 md:columns-2 gap-8">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-light-subtle dark:text-dark-subtle bg-light-card dark:bg-dark-card rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">No Posts Found</h2>
          <p>{searchTerm ? 'Try a different search or filter.' : 'It\'s a little quiet in here.'}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;