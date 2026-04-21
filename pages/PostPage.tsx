import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

const DiscussionItem: React.FC<{
    comment: Comment;
    allComments: Comment[];
    postId: string;
    postAuthorId: string;
    user: any;
    onDelete: (id: string) => void;
    onReply: (parentId: string, replyToUsername: string, replyToName: string, content: string) => Promise<void>;
}> = ({ comment, allComments, postId, postAuthorId, user, onDelete, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [visibleReplies, setVisibleReplies] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // FLAT LOGIC: Find all replies where parentId is THIS comment's ID
    const replies = allComments.filter(c => c.parentId === comment.id);
    const hasMore = visibleReplies < replies.length;
    const remaining = replies.length - visibleReplies;

const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    

    const targetHandle = comment.authorUsername; 
    
    const targetDisplayName = comment.authorName || comment.authorUsername;

    // Pass both to the onReply function
    await onReply(comment.id, targetHandle, targetDisplayName, replyText);
    
    setReplyText('');
    setIsReplying(false);
    setIsSubmitting(false);
    
    if (visibleReplies === 0) setVisibleReplies(3);
    else setVisibleReplies(prev => prev + 1);
};

    // Keyboard shortcut logic
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleReplySubmit();
        }
    };

    const isAuthor = user?.id === comment.authorId || user?.id === postAuthorId;

    return (
        <div className="flex flex-col space-y-3">
            {/* Main Discussion Bubble */}
            <div className="group flex items-start space-x-3">
                <Link 
                    to={`/profile/${comment.authorUsername}`}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple to-brand-yellow flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:opacity-90 transition-all cursor-pointer"
                >
                    {comment.authorUsername.charAt(0).toUpperCase()}
                </Link>
                <div className="flex-1">
                    <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                            <Link 
                                to={`/profile/${comment.authorUsername}`}
                                className="font-bold text-xs hover:underline text-light-text dark:text-dark-text"
                            >
                                {comment.authorName || comment.authorUsername}
                            </Link>
                            {isAuthor && (
                                <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                        <p className="text-sm">
                            {comment.replyToUsername && (
                                <button 
                                    onClick={() => navigate(`/profile/${comment.replyToUsername}`)}
                                    className="text-brand-purple font-bold mr-1 hover:underline"
                                >
                                    @{comment.replyToName || comment.replyToUsername}
                                </button>
                            )}
                            {comment.content}
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-1.5 ml-1">
                        <span className="text-[10px] text-light-subtle dark:text-dark-subtle">
                            {comment.createdAt ? formatDistanceToNow(new Date((comment.createdAt as any).toDate())) : 'Just now'}
                        </span>
                        {user && (
                            <button onClick={() => setIsReplying(!isReplying)} className="text-[11px] font-bold text-light-subtle hover:text-brand-purple transition-colors">
                                Reply
                            </button>
                        )}
                    </div>

                    {/* Reply Area */}
                    {isReplying && (
                        <div className="mt-3 flex flex-col space-y-2">
                            <textarea 
                                autoFocus
                                value={replyText}
                                onKeyDown={handleKeyDown}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder={`Reply to ${comment.authorName || comment.authorUsername}... (Press Enter to post)`}
                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-1 text-sm focus:outline-none focus:border-brand-purple resize-none"
                                rows={1}
                            />
                            <p className="text-[9px] text-light-subtle">Shift + Enter for new line</p>
                        </div>
                    )}

                    {/* Pagination Button */}
                    {replies.length > 0 && (
                        <div className="mt-2">
                            {visibleReplies === 0 ? (
                                <button onClick={() => setVisibleReplies(3)} className="flex items-center text-[11px] font-bold text-light-subtle hover:text-light-text">
                                    <span className="w-8 h-[1px] bg-gray-300 dark:bg-gray-700 mr-2"></span>
                                    View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                            ) : hasMore && (
                                <button onClick={() => setVisibleReplies(prev => prev + 3)} className="flex items-center text-[11px] font-bold text-light-subtle hover:text-light-text mt-2 ml-4">
                                    <span className="w-6 h-[1px] bg-gray-300 dark:bg-gray-700 mr-2"></span>
                                    View {remaining} more
                                </button>
                            )}
                        </div>
                    )}

                    {/* FLAT REPLIES LIST (No more nesting) */}
                    {visibleReplies > 0 && (
                        <div className="mt-4 space-y-5 border-l-2 border-gray-100 dark:border-gray-800 ml-1.5 pl-4">
                            {replies.slice(0, visibleReplies).map(reply => (
                                <div key={reply.id} className="group flex items-start space-x-3">
                                    <Link 
                                        to={`/profile/${reply.authorName || reply.authorUsername}`}
                                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                                    >
                                        {reply.authorUsername.charAt(0).toUpperCase()}
                                    </Link>
                                    <div className="flex-1">
                                        <div className="bg-light-bg/50 dark:bg-dark-bg/50 p-2.5 rounded-2xl rounded-tl-none border border-gray-50 dark:border-gray-900">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <Link 
                                                    to={`/profile/${reply.authorUsername}`}
                                                    className="font-bold text-[11px] hover:underline"
                                                >
                                                    {reply.authorUsername}
                                                </Link>
                                                {(user?.id === reply.authorId || user?.id === postAuthorId) && (
                                                    <button onClick={() => onDelete(reply.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TrashIcon />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm">
                                                <Link 
                                                    to={`/profile/${comment.authorUsername}`}
                                                    className="text-brand-purple font-bold mr-1 hover:underline"
                                                    >
                                                    @{comment.authorUsername}
                                                </Link>
                                                {reply.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3 mt-1 ml-1">
                                            <span className="text-[9px] text-light-subtle">
                                                {reply.createdAt ? formatDistanceToNow(new Date((reply.createdAt as any).toDate())) : 'Just now'}
                                            </span>
                                            {user && (
                                                <button 
                                                    onClick={() => {
                                                        setIsReplying(true);
                                                        setReplyText(""); // Focuses the parent reply box
                                                    }} 
                                                    className="text-[10px] font-bold text-light-subtle hover:text-brand-purple"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentSection: React.FC<{ postId: string, postAuthorId: string }> = ({ postId, postAuthorId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const fetchComments = useCallback(async () => {
        // We order by asc so the thread builds logically
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

const handleSubmitDiscussion = async (
    parentId: string | null = null, 
    replyToUsername: string | null = null, 
    replyToName: string | null = null, 
    content: string | null = null
) => {
    const textToPost = content || newComment;
    if (!textToPost.trim() || !user) return;
    
    if (!parentId) setLoading(true);

    try {
        // 1. Define correctUsername by fetching it from Firestore
        const userDoc = await getDoc(doc(db, "users", user.id));

        const correctUsername = userDoc.exists() 
            ? userDoc.data()?.username 
            : user.username.toLowerCase().replace(/\s+/g, '');

        const postRef = doc(db, "posts", postId);
        
        // 2. Now 'correctUsername' is defined and can be used below
        await addDoc(collection(postRef, "comments"), {
            postId,
            authorId: user.id,
            authorName: user.username,        
            authorUsername: correctUsername,  
            content: textToPost,
            createdAt: serverTimestamp(),
            parentId: parentId || null,
            replyToUsername: replyToUsername || null, 
            replyToName: replyToName || null          
        });

        await updateDoc(postRef, { commentCount: increment(1) });
        
        setTimeout(async () => {
            await fetchComments();
            if (!parentId) {
                setNewComment('');
                setLoading(false);
            }
        }, 500);
    } catch (err) {
        console.error("Submission error:", err);
        setLoading(false);
    }
};

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            try {
                const commentRef = doc(db, "posts", postId, "comments", commentId);
                await deleteDoc(commentRef);
                const postRef = doc(db, "posts", postId);
                await updateDoc(postRef, { commentCount: increment(-1) });
                await fetchComments();
            } catch (error) {
                console.error("Error deleting: ", error);
            }
        }
    };

    // Only show top-level discussions in the main map (ones without a parentId)
    const topLevelDiscussions = comments.filter(c => !c.parentId);

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-display text-2xl font-bold mb-6">Discussion ({comments.length})</h3>
            
            {user ? (
                <div className="mb-10">
                    <textarea 
                        rows={3} 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Join the discussion..."
                        className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                            onClick={() => handleSubmitDiscussion()} 
                            disabled={loading || !newComment.trim()}
                            className="py-2 px-8 rounded-full font-bold text-white bg-brand-purple hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-brand-purple/20"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="mb-8 text-sm text-light-subtle dark:text-dark-subtle italic">You must be logged in to join the discussion.</p>
            )}

            <div className="space-y-10">
                {topLevelDiscussions.map(comment => (
                    <DiscussionItem 
                        key={comment.id}
                        comment={comment}
                        allComments={comments}
                        postId={postId}
                        postAuthorId={postAuthorId}
                        user={user}
                        onDelete={handleDeleteComment}
                        // Ensure all 3 parameters (pId, username, text) are passed here:
                       onReply={(pId, handle, name, text) => handleSubmitDiscussion(pId, handle, name, text)}
                    />
                ))}
            </div>
        </div>
    );
};


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