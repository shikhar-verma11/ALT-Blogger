import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Post, Comment } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

const CommentSection: React.FC<{ postId: string }> = ({ postId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const fetchComments = useCallback(async () => {
        const commentsQuery = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(commentsQuery);
        const fetchedComments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Comment));
        setComments(fetchedComments);
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !user) return;
        setLoading(true);
        
        await addDoc(collection(db, "posts", postId, "comments"), {
            postId,
            authorId: user.id,
            authorUsername: user.username,
            content: newComment,
            createdAt: serverTimestamp()
        });
        
        setNewComment('');
        await fetchComments();
        setLoading(false);
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-display text-2xl font-bold mb-6">Discussion ({comments.length})</h3>
            {user ? (
                 <div className="mb-8">
                     <textarea 
                         rows={3} 
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         placeholder="Join the discussion..."
                         className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                     />
                     <button 
                         onClick={handleSubmitComment} 
                         disabled={loading || !newComment.trim()}
                         className="mt-3 py-2 px-6 rounded-lg font-semibold text-white bg-brand-purple hover:opacity-90 disabled:opacity-60 transition-all"
                     >
                         {loading ? 'Posting...' : 'Post Comment'}
                     </button>
                 </div>
            ) : (
                <p className="mb-8 text-light-subtle dark:text-dark-subtle">You must be logged in to comment.</p>
            )}

            <div className="space-y-6">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-4 animate-fade-in-up">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {comment.authorUsername.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg rounded-tl-none">
                                <p className="font-semibold text-light-text dark:text-dark-text">{comment.authorUsername}</p>
                                <p className="text-sm text-light-subtle dark:text-dark-subtle mb-2">
                                    {comment.createdAt ? new Date((comment.createdAt as any).toDate()).toLocaleDateString() : 'Just now'}
                                </p>
                                <p className="text-light-text dark:text-dark-text">{comment.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  // --- NEW: State to control the image modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setLoading(true);
      
      const postRef = doc(db, "posts", postId);
      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({ id: docSnap.id, ...data } as Post);
      } else {
        console.log("No such document!");
        setPost(null);
      }
      setLoading(false);
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-10 text-red-500">Post not found.</div>;
  }
  
  const postDate = post.createdAt ? new Date((post.createdAt as any).toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Just now';

  return (
    <div className="max-w-4xl mx-auto">
        <article className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
            {post.coverImageUrl && (
                // --- UPDATED: Image is now a button to open the modal ---
                <button onClick={() => setIsModalOpen(true)} className="w-full block">
                    <img src={post.coverImageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
                </button>
            )}
            <div className="p-6 sm:p-10">
              <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
                <h1 className="font-display text-4xl md:text-5xl font-extrabold text-light-text dark:text-dark-text mb-4 leading-tight">{post.title}</h1>
                <div className="flex items-center text-light-subtle dark:text-dark-subtle">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-lg mr-3">
                      {post.authorUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <p className="font-semibold text-light-text dark:text-dark-text">{post.authorUsername}</p>
                      <p className="text-sm">{postDate}</p>
                  </div>
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {(post.hashtags || []).map(tag => (
                        <span key={tag} className="text-xs font-medium bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">#{tag}</span>
                    ))}
                </div>
              </header>
              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-light-text dark:prose-p:text-dark-text prose-headings:font-display prose-headings:text-light-text dark:prose-headings:text-dark-text prose-a:text-brand-purple hover:prose-a:opacity-80 dark:prose-a:text-brand-purple dark:hover:prose-a:opacity-80">
                {post.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              <CommentSection postId={post.id} />

            </div>
        </article>
        
        {/* --- NEW: Image Modal --- */}
        {isModalOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-up"
                onClick={() => setIsModalOpen(false)} // Close modal on background click
            >
                <img 
                    src={post.coverImageUrl} 
                    alt={post.title} 
                    className="max-w-[90vw] max-h-[90vh] object-contain"
                />
                <button 
                    className="absolute top-4 right-4 text-white text-3xl font-bold"
                >
                    &times;
                </button>
            </div>
        )}
    </div>
  );
};

export default PostPage;