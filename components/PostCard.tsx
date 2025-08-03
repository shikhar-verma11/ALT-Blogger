import React, { useContext, useState, useEffect } from 'react';
import type { Post } from '../types';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { mockApi } from '../services/mockApi';

// Icon components
const HeartIcon: React.FC<{solid: boolean}> = ({solid}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={solid ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const BookmarkIcon: React.FC<{solid: boolean}> = ({solid}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={solid ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

interface PostCardProps {
  post: Post;
  onInteraction: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onInteraction }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(user ? post.likes.includes(user.id) : false);
  const [isSaved, setIsSaved] = useState(user ? post.saves.includes(user.id) : false);

  useEffect(() => {
    setIsLiked(user ? post.likes.includes(user.id) : false);
    setIsSaved(user ? post.saves.includes(user.id) : false);
    setLikeCount(post.likes.length);
  }, [post, user]);


  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return; // Or prompt to login
    const updatedPost = await mockApi.toggleLike(post.id, user.id);
    setIsLiked(updatedPost.likes.includes(user.id));
    setLikeCount(updatedPost.likes.length);
    onInteraction();
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await mockApi.toggleSave(post.id, user.id);
    setIsSaved(prev => !prev);
    onInteraction();
  };

  return (
    <div className="w-full break-inside-avoid mb-8 animate-fade-in-up">
      <Link to={`/post/${post.id}`} className="block group">
          <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl border border-gray-200 dark:border-gray-800">
            {post.coverImageUrl && (
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
            )}
            <div className="p-6">
              <div className="flex items-center mb-4">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-sm mr-3">
                      {post.authorUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">{post.authorUsername}</p>
                      <p className="text-xs text-light-subtle dark:text-dark-subtle">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-light-text dark:text-dark-text group-hover:text-brand-purple dark:group-hover:text-brand-purple transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-light-subtle dark:text-dark-subtle line-clamp-2">
                {post.content}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {post.hashtags.map(tag => (
                    <span key={tag} className="text-xs font-medium bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">#{tag}</span>
                ))}
              </div>

              <div className="mt-6 flex justify-end items-center space-x-4">
                  <button onClick={handleLike} disabled={!user} className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'text-light-subtle dark:text-dark-subtle'} hover:text-red-500 disabled:opacity-50 disabled:hover:text-light-subtle`}>
                    <HeartIcon solid={isLiked} />
                    <span className="font-medium text-sm">{likeCount}</span>
                  </button>
                  <button onClick={handleSave} disabled={!user} className={`flex items-center space-x-2 transition-colors ${isSaved ? 'text-brand-yellow' : 'text-light-subtle dark:text-dark-subtle'} hover:text-brand-yellow disabled:opacity-50 disabled:hover:text-light-subtle`}>
                    <BookmarkIcon solid={isSaved} />
                    <span className="font-medium text-sm">Save</span>
                  </button>
              </div>
            </div>
          </div>
      </Link>
    </div>
  );
};

export default PostCard;