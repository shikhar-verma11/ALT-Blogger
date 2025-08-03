import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Post, Comment } from '../types';
import { mockApi } from '../services/mockApi';
import { AuthContext } from '../contexts/AuthContext';

const CommentSection: React.FC<{ postId: string }> = ({ postId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const fetchComments = useCallback(async () => {
        const fetchedComments = await mockApi.getCommentsForPost(postId);
        setComments(fetchedComments);
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !user) return;
        setLoading(true);
        await mockApi.addComment({
            postId,
            authorId: user.id,
            authorUsername: user.username,
            content: newComment,
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
                                    {new Date(comment.createdAt).toLocaleDateString()}
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
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      const fetchedPost = await mockApi.getPost(id);
      setPost(fetchedPost || null);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-10 text-red-500">Post not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <article className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
            {post.coverImageUrl && (
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
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
                      <p className="text-sm">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {post.hashtags.map(tag => (
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
    </div>
  );
};

export default PostPage;