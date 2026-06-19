import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Clock, User, Edit3, Trash2, MessageCircle, ArrowLeft, Link2, Globe } from 'lucide-react';
import CommentCard from '../components/CommentCard';
import { useAuth } from '../context/AuthContext';

const GRADIENTS = [
  'linear-gradient(135deg, #0FCAEB22, #06B6D411)',
  'linear-gradient(135deg, #F59E0B22, #F9731611)',
  'linear-gradient(135deg, #8B5CF622, #6366F111)',
  'linear-gradient(135deg, #EC489922, #F9731611)',
  'linear-gradient(135deg, #10B98122, #06B6D411)',
];

function getGradient(title) {
  let hash = 0;
  for (let i = 0; i < (title || '').length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function BlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [saved, setSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/'); return; }

    const fetchBlogAndComments = async () => {
      try {
        const blogRes = await api.get(`/posts/${id}`);
        const blogData = blogRes.data?.success ? blogRes.data.data : blogRes.data;
        setBlog(blogData);

        const commentsRes = await api.get(`/posts/${id}/comments`);
        setComments(Array.isArray(commentsRes.data) ? commentsRes.data : commentsRes.data?.data || []);

        const likesRes = await api.get(`/posts/${id}/likes`);
        setLikesCount(likesRes.data.count || 0);
        setUserLiked(likesRes.data.userLiked || false);
      } catch (err) {
        console.error('Blog fetch error:', err.response?.data || err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [id, navigate]);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    setSaved(savedPosts.includes(id));
  }, [id]);

  useEffect(() => {
    if (!blog) return;
    const fetchRelated = async () => {
      try {
        const res = await api.get('/posts');
        const allPosts = res.data?.success ? res.data.data : Array.isArray(res.data) ? res.data : [];
        const filtered = allPosts.filter((post) => post._id !== blog._id).slice(0, 3);
        setRelatedPosts(filtered);
      } catch (error) { /* ignore */ }
    };
    fetchRelated();
  }, [blog]);

  const userId = user?.id || user?._id;
  const blogUserId = blog?.user?._id || blog?.user;
  const isPostCreator = userId && blogUserId && userId.toString() === blogUserId.toString();
  const postAuthorId = blog?.user?._id || null;

  const wordCount = blog?.content?.trim().split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));

  const handleLike = async () => {
    if (!user) { navigate('/signin'); return; }
    try {
      const res = await api.post(`/posts/${id}/likes`);
      setLikesCount(res.data.count);
      setUserLiked(res.data.liked);
    } catch (err) {
      console.error('Like error:', err.response?.data?.message || err.message);
    }
  };

  const handleBookmark = () => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    const nextSavedPosts = saved
      ? savedPosts.filter((savedId) => savedId !== id)
      : [...savedPosts, id];
    localStorage.setItem('savedPosts', JSON.stringify(nextSavedPosts));
    setSaved(!saved);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setShareMessage('Link copied to clipboard.');
      setTimeout(() => setShareMessage(''), 3000);
    } catch {
      setShareMessage('Unable to copy link.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Delete error:', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId)
        .map((c) => ({ ...c, replies: c.replies?.filter((r) => r._id !== commentId) || [] })));
    } catch (err) {
      console.error('Delete comment error:', err.response?.data?.message || err.message);
    }
  };

  const handleReply = (commentId, username) => {
    setReplyTo({ id: commentId, username });
    setNewComment(`@${username} `);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment('');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!user) { navigate('/signin'); return; }

    try {
      const body = { content: newComment };
      if (replyTo) body.parentComment = replyTo.id;
      const res = await api.post(`/posts/${id}/comments`, body);

      if (replyTo) {
        setComments((prev) => prev.map((c) =>
          c._id === replyTo.id
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        ));
      } else {
        setComments((prev) => [...prev, { ...res.data, replies: [] }]);
      }
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('Comment post error:', err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="blog-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!blog) {
    return (
      <motion.div
        className="notfound-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="glass-card">
          <h2>Post not found.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="hero-cta-btn" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} />
            Go Back Home
          </Link>
        </div>
      </motion.div>
    );
  }

  const author = blog.user || {};
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ogDescription = blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 200) : 'Read this article on Blogora';

  return (
    <>
      <Helmet>
        <title>{blog.title} — Blogora</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={`${blog.title} — Blogora`} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://blogora.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blog.title} — Blogora`} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="https://blogora.app/og-image.png" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="blog-detail-page"
      >
        <article className="blog-article">
        <motion.div
          className="blog-article-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="blog-article-badge">Article</span>
          <h1 className="blog-article-title">{blog.title}</h1>
          <div className="blog-article-meta">
            <div className="blog-article-author-row">
              <div className="blog-detail-avatar">
                <User size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span className="blog-detail-author-name">{author.username || 'Guest Author'}</span>
                <div className="blog-detail-meta">
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="blog-article-cover"
          style={{ background: getGradient(blog.title) }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {(blog.title || 'B').charAt(0).toUpperCase()}
        </motion.div>

        <motion.div
          className="blog-article-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <motion.button
            onClick={handleLike}
            className={`action-btn ${userLiked ? 'liked' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <Heart size={16} />
            <span>{likesCount}</span>
          </motion.button>
          <motion.button
            onClick={handleBookmark}
            className={`action-btn ${saved ? 'saved' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <Bookmark size={16} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </motion.button>
          <motion.a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span className="action-label">Twitter</span>
          </motion.a>
          <motion.a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            <span className="action-label">LinkedIn</span>
          </motion.a>
          <motion.a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span className="action-label">Facebook</span>
          </motion.a>
          <motion.button
            onClick={handleCopyLink}
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <Link2 size={16} />
            <span>Copy Link</span>
          </motion.button>
        </motion.div>
        {shareMessage && <p className="share-message">{shareMessage}</p>}

        <motion.div
          className="blog-article-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="blog-article-body">{blog.content}</div>
        </motion.div>

        {isPostCreator && (
          <motion.div
            className="blog-manage-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Manage post</h3>
            <div className="blog-manage-actions">
              <Link to={`/edit/${blog._id}`} className="manage-btn manage-edit">
                <Edit3 size={14} />
                Edit article
              </Link>
              <button onClick={handleDelete} className="manage-btn manage-delete">
                <Trash2 size={14} />
                Delete article
              </button>
            </div>
          </motion.div>
        )}
      </article>

      {(author.bio || author.linkedinUrl || author.twitterUrl || author.githubUrl || author.websiteUrl) && (
        <motion.div
          className="author-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="author-section-avatar">
            {(author.username || 'G').charAt(0).toUpperCase()}
          </div>
          <div className="author-section-info">
            <h4 className="author-section-name">{author.username || 'Guest Author'}</h4>
            {author.bio && <p className="author-section-bio">{author.bio}</p>}
            {(author.linkedinUrl || author.twitterUrl || author.githubUrl || author.websiteUrl) && (
              <div className="author-social-links">
                {author.linkedinUrl && (
                  <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="author-social-link linkedin" title="LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {author.twitterUrl && (
                  <a href={author.twitterUrl} target="_blank" rel="noopener noreferrer" className="author-social-link twitter" title="Twitter/X">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {author.githubUrl && (
                  <a href={author.githubUrl} target="_blank" rel="noopener noreferrer" className="author-social-link github" title="GitHub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  </a>
                )}
                {author.websiteUrl && (
                  <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer" className="author-social-link website" title="Website">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        className="blog-comments-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="comments-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={18} />
            Discussion ({comments.length})
          </h3>
        </div>

        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              canDelete={user && (comment.user?._id === userId)}
              onDelete={handleDeleteComment}
              onReply={handleReply}
              postAuthorId={postAuthorId}
              currentUserId={userId}
            />
          ))
        ) : (
          <div className="comments-empty">
            <MessageCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
            <p>Be the first to start the discussion.</p>
          </div>
        )}

        <div className="comment-form-section">
          {replyTo && (
            <div className="reply-indicator">
              <span>Replying to <strong>@{replyTo.username}</strong></span>
              <button onClick={cancelReply} className="cancel-reply-btn">Cancel</button>
            </div>
          )}
          <textarea
            rows="4"
            placeholder={user ? (replyTo ? 'Write your reply...' : 'Share your thoughts...') : 'Sign in to join the discussion...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user}
            className="comment-textarea"
          />
          <div className="comment-form-actions">
            <motion.button
              onClick={handleCommentSubmit}
              disabled={!user || !newComment.trim()}
              className="comment-submit-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle size={16} />
              {replyTo ? 'Post Reply' : 'Post Comment'}
            </motion.button>
            {!user && (
              <Link to="/signin" className="comment-signin-btn">
                Sign in to comment
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      <div className="blog-sidebar">
        <motion.div
          className="sidebar-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <h3 className="sidebar-card-title">
            <User size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
            Author
          </h3>
          <div className="sidebar-author">
            <div className="sidebar-author-avatar">
              <User size={20} />
            </div>
            <div>
              <p className="sidebar-author-name">{author.username || 'Guest Author'}</p>
              <p className="sidebar-author-bio">{author.bio || 'Creator on Blogora'}</p>
            </div>
          </div>
          {(author.linkedinUrl || author.twitterUrl || author.githubUrl || author.websiteUrl) && (
            <div className="author-social-links">
              {author.linkedinUrl && (
                <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="author-social-link linkedin">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {author.twitterUrl && (
                <a href={author.twitterUrl} target="_blank" rel="noopener noreferrer" className="author-social-link twitter">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {author.githubUrl && (
                <a href={author.githubUrl} target="_blank" rel="noopener noreferrer" className="author-social-link github">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
              )}
              {author.websiteUrl && (
                <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer" className="author-social-link website">
                  <Globe size={14} />
                </a>
              )}
            </div>
          )}
          <div className="sidebar-stats" style={{ marginTop: '0.75rem' }}>
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">{relatedPosts.length + 1}</span>
              <span className="sidebar-stat-label">Posts</span>
            </div>
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">
                {author.createdAt ? new Date(author.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}
              </span>
              <span className="sidebar-stat-label">Joined</span>
            </div>
          </div>
        </motion.div>

        {relatedPosts.length > 0 && (
          <motion.div
            className="sidebar-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="sidebar-card-title">Related articles</h3>
            {relatedPosts.map((post) => (
              <Link key={post._id} to={`/blogs/${post._id}`} className="related-post-link">
                <div className="related-post">
                  <h5 className="related-post-title">{post.title}</h5>
                  <span className="related-post-author">{post.user?.username || 'Author'}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
    </>
  );
}

export default BlogPage;
