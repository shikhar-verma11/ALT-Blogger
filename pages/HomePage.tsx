import React, { useState, useEffect, useRef } from 'react';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';

const SearchIcon: React.FC = () => (
    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ChevronDownIcon: React.FC = () => (
    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'title' | 'username' | 'hashtag'>('title');
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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
    if (filterType !== 'username' || !searchTerm || selectedUser) {
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
  }, [searchTerm, filterType, selectedUser]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterRef]);

  const handleUserSelect = (username: string) => {
    setSelectedUser(username);
    setSearchTerm(username);
    setUserSuggestions([]);
  };

  const filteredPosts = posts.filter(post => {
    if (selectedUser) {
      return post.authorUsername === selectedUser;
    }
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    switch (filterType) {
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
    return (
        <div className="columns-1 md:columns-2 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-6 animate-pulse w-full break-inside-avoid mb-8">
                    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
                        <div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
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

      {/* --- THIS IS THE UPDATED SECTION --- */}
      <div className="sticky top-20 z-40 mb-12 max-w-2xl mx-auto">
        <div className="relative" ref={filterRef}>
            <div className="flex items-center bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-full shadow-lg focus-within:ring-2 focus-within:ring-brand-purple transition-all duration-300">
                <div className="pl-4 pr-2">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedUser(null);
                    }}
                    placeholder={`Search by ${filterType}...`}
                    className="flex-1 w-full py-3 bg-transparent focus:outline-none text-light-text dark:text-dark-text"
                />
                <div className="border-l border-gray-200 dark:border-gray-700 h-6"></div>
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="px-4 flex items-center gap-1 text-light-subtle dark:text-dark-subtle font-medium focus:outline-none"
                >
                    <span>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</span>
                    <ChevronDownIcon />
                </button>
            </div>
            
            <div className={`
                absolute top-full right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10 
                transition-all duration-300 ease-in-out
                ${isFilterOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}>
                <a onClick={() => { handleFilterChange('title'); setIsFilterOpen(false); }} className="block px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-t-lg">Title</a>
                <a onClick={() => { handleFilterChange('username'); setIsFilterOpen(false); }} className="block px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Username</a>
                <a onClick={() => { handleFilterChange('hashtag'); setIsFilterOpen(false); }} className="block px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-b-lg">Hashtag</a>
            </div>

            {userSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 w-full bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10">
                    {userSuggestions.map(username => (
                        <button key={username} onClick={() => handleUserSelect(username)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            {username}
                        </button>
                    ))}
                </div>
            )}
        </div>
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