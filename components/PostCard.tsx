import React, { useContext, useState, useEffect } from 'react';
import type { Post } from '../types';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase'; // Import Firestore
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; // Import Firestore functions

// Icon components (no changes here)
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
  // onInteraction is removed as we now update state directly
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // --- UPDATED to be safer with default values ---
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
  const [isLiked, setIsLiked] = useState(user ? post.likes?.includes(user.id) : false);
  const [isSaved, setIsSaved] = useState(user ? post.saves?.includes(user.id) : false);

  // This effect ensures the state is correct if the post prop changes
  useEffect(() => {
    setIsLiked(user ? post.likes?.includes(user.id) : false);
    setIsSaved(user ? post.saves?.includes(user.id) : false);
    setLikeCount(post.likes?.length ?? 0);
  }, [post, user]);

  // --- UPDATED to use Firestore ---
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    const postRef = doc(db, "posts", post.id);
    if (isLiked) {
      // Unlike the post
      await updateDoc(postRef, {
        likes: arrayRemove(user.id)
      });
      setLikeCount(prev => prev - 1);
    } else {
      // Like the post
      await updateDoc(postRef, {
        likes: arrayUnion(user.id)
      });
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(prev => !prev);
  };

  // --- UPDATED to use Firestore ---
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    const postRef = doc(db, "posts", post.id);
    if (isSaved) {
      // Unsave the post
      await updateDoc(postRef, {
        saves: arrayRemove(user.id)
      });
    } else {
      // Save the post
      await updateDoc(postRef, {
        saves: arrayUnion(user.id)
      });
    }
    setIsSaved(prev => !prev);
  };
  
  // --- UPDATED to handle potentially missing 'createdAt' and convert it ---
  // The 'createdAt' from Firestore is an object, so we convert it to a Date
  const postDate = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now';

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
                      {post.authorUsername?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">{post.authorUsername}</p>
                      <p className="text-xs text-light-subtle dark:text-dark-subtle">{postDate}</p>
                  </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-light-text dark:text-dark-text group-hover:text-brand-purple dark:group-hover:text-brand-purple transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-light-subtle dark:text-dark-subtle line-clamp-2">
                {post.content}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {/* --- UPDATED to safely handle missing hashtags --- */}
                {(post.hashtags || []).map(tag => (
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