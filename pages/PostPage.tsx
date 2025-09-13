import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    serverTimestamp,
    updateDoc,
    increment,
    deleteDoc
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

// --- NEW: Icon for delete button ---
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CommentSection: React.FC<{ postId: string, postAuthorId: string }> = ({ postId, postAuthorId }) => {
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
        const postRef = doc(db, "posts", postId);
        await addDoc(collection(postRef, "comments"), {
            postId,
            authorId: user.id,
            authorUsername: user.username,
            content: newComment,
            createdAt: serverTimestamp()
        });
        await updateDoc(postRef, { commentCount: increment(1) });
        setNewComment('');
        await fetchComments();
        setLoading(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                const commentRef = doc(db, "posts", postId, "comments", commentId);
                await deleteDoc(commentRef);
                const postRef = doc(db, "posts", postId);
                await updateDoc(postRef, { commentCount: increment(-1) });
                await fetchComments();
            } catch (error) {
                console.error("Error deleting comment: ", error);
                alert("Failed to delete comment.");
            }
        }
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
                {comments.map(comment => {
                    const isCommentAuthor = user && user.id === comment.authorId;
                    const isPostAuthor = user && user.id === postAuthorId;
                    
                    return (
                        <div key={comment.id} className="group flex items-start space-x-4 animate-fade-in-up">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {comment.authorUsername.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg rounded-tl-none relative">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-light-text dark:text-dark-text">{comment.authorUsername}</p>
                                        {(isCommentAuthor || isPostAuthor) && (
                                            <button 
                                                onClick={() => handleDeleteComment(comment.id)} 
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete comment"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-light-subtle dark:text-dark-subtle mb-2">
                                        {comment.createdAt ? `${formatDistanceToNow(new Date((comment.createdAt as any).toDate()))} ago` : 'Just now'}
                                    </p>
                                    <p className="text-light-text dark:text-dark-text">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const postRef = doc(db, "posts", postId);
    const docSnap = await getDoc(postRef);
    if (docSnap.exists()) {
      setPost({ id: docSnap.id, ...docSnap.data() } as Post);
    } else {
      setPost(null);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDeletePost = async () => {
    if (!post) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
        try {
            await deleteDoc(doc(db, "posts", post.id));
            navigate('/');
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete post.");
        }
    }
  };

  const handleUpdatePost = async () => {
    if (!post) return;
    setLoading(true);
    try {
        const postRef = doc(db, "posts", post.id);
        await updateDoc(postRef, {
            title: editedTitle,
            content: editedContent,
            updatedAt: serverTimestamp()
        });
        await fetchPost();
        setIsEditing(false);
    } catch (error) {
        console.error("Error updating document: ", error);
        alert("Failed to update post.");
    }
    setLoading(false);
  };
  
  const startEditing = () => {
    if (!post) return;
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setIsEditing(true);
  };

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-10 text-red-500">Post not found.</div>;
  }
  
  const originalPostDate = post.createdAt?.toDate ? `${formatDistanceToNow(post.createdAt.toDate())} ago` : 'Just now';
  const editedDate = post.updatedAt?.toDate ? `(edited ${formatDistanceToNow(post.updatedAt.toDate())} ago)` : null;
  const isAuthor = user && user.id === post.authorId;

  return (
    <div className="max-w-4xl mx-auto">
        <article className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
            {post.coverImageUrl && (
                <button onClick={() => setIsModalOpen(true)} className="w-full block">
                    <img src={post.coverImageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
                </button>
            )}
            <div className="p-6 sm:p-10">
              <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
                {isEditing ? (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-light-subtle dark:text-dark-subtle">Title</label>
                        <input 
                            type="text" 
                            value={editedTitle} 
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="w-full text-4xl font-extrabold bg-light-bg dark:bg-dark-bg p-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                ) : (
                    <h1 className="font-display text-4xl md:text-5xl font-extrabold text-light-text dark:text-dark-text mb-4 leading-tight">{post.title}</h1>
                )}
                <div className="flex justify-between items-start">
                    <div className="flex items-center text-light-subtle dark:text-dark-subtle mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-lg mr-3">
                          {post.authorUsername.charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <p className="font-semibold text-light-text dark:text-dark-text">{post.authorUsername}</p>
                          <p className="text-sm">
                            {originalPostDate} {editedDate && <span className="italic text-gray-500">{editedDate}</span>}
                          </p>
                      </div>
                    </div>
                    {isAuthor && !isEditing && (
                        <div className="flex items-center space-x-4 mt-4">
                            <button onClick={startEditing} className="text-sm font-semibold text-blue-500 hover:underline">Edit</button>
                            <button onClick={handleDeletePost} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
                        </div>
                    )}
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {(post.hashtags || []).map(tag => (
                        <span key={tag} className="text-xs font-medium bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">#{tag}</span>
                    ))}
                </div>
              </header>
              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-light-text dark:prose-p:text-dark-text prose-headings:font-display prose-headings:text-light-text dark:prose-headings:text-dark-text prose-a:text-brand-purple hover:prose-a:opacity-80 dark:prose-a:text-brand-purple dark:hover:prose-a:opacity-80">
                {isEditing ? (
                    <textarea 
                        rows={20} 
                        value={editedContent} 
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full text-lg bg-light-bg dark:bg-dark-bg p-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                ) : (
                    post.content.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)
                )}
              </div>
              
              {isEditing && (
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={() => setIsEditing(false)} className="py-2 px-6 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleUpdatePost} className="py-2 px-6 rounded-lg font-semibold text-white bg-brand-purple hover:opacity-90">Save Changes</button>
                </div>
              )}
              
              {!isEditing && <CommentSection postId={post.id} postAuthorId={post.authorId} />}
            </div>
        </article>
        
        {isModalOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-up"
                onClick={() => setIsModalOpen(false)}
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