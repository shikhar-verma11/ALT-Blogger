import React, { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import { mockApi } from '../services/mockApi';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    // No need to set loading to true here, causes flicker on interaction
    const fetchedPosts = await mockApi.getPosts();
    setPosts(fetchedPosts);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

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

      {posts.length > 0 ? (
        <div className="columns-1 md:columns-2 gap-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onInteraction={fetchPosts} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-light-subtle dark:text-dark-subtle bg-light-card dark:bg-dark-card rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">No Posts Yet</h2>
          <p>It's a little quiet in here. Why not be the first to create a post?</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;