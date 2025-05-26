// client/src/pages/BlogPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import CommentCard from '../components/CommentCard';
import { AuthContext } from '../context/AuthContext.js';

function BlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchBlogAndComments = async () => {
      try {
        const blogRes = await api.get(`/posts/${id}`);
        setBlog(blogRes.data);

        const commentsRes = await api.get(`/posts/${id}/comments`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error('Blog or Comments fetch error:', err.response?.data?.message || err.message);
        alert(err.response?.data?.message || 'Error fetching blog post or comments.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${id}`);
        navigate('/');
      } catch (err) {
        console.error('Delete error:', err.response?.data?.message || err.message);
        alert(err.response?.data?.message || 'Failed to delete post.');
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert('You must be logged in to comment.');
      return;
    }

    try {
      const res = await api.post(
        `/posts/${id}/comments`,
        { content: newComment }
      );
      setComments((prevComments) => [...prevComments, res.data]); // Functional update for comments state
      setNewComment('');
    } catch (err) {
      console.error('Comment post error:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to post comment.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: '#0FCAEB', width: '3rem', height: '3rem' }}
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center my-5 text-danger">
        <h2>Post not found.</h2>
        <Link to="/" className="btn btn-primary mt-3">Go Back Home</Link>
      </div>
    );
  }

  const isPostCreator = user && blog && blog.user && user._id === blog.user._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, rgb(2, 38, 67) 70%, #0FCAEB 130%)',
        backdropFilter: 'blur(6px)',
        color: '#e2f1f5',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
      }}
    >
      <h1
        style={{
          background: 'linear-gradient(45deg, #0dcaf0, #6610f2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        {blog.title}
      </h1>

      <p className="fst-italic" style={{ textAlign: 'center', color: '#8fa6b8', marginBottom: '1rem' }}>
        Posted by {blog.user ? blog.user.username : 'Unknown'} on {new Date(blog.createdAt).toLocaleDateString()}
      </p>

      <div
        style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#cbd6e2',
          whiteSpace: 'pre-wrap',
          textAlign: 'justify',
          marginBottom: '2rem',
        }}
      >
        {blog.content}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {isPostCreator && (
          <>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to={`/edit/${blog._id}`}
                className="btn"
                style={buttonStyle('#0FCAEB', '#00121e')}
                onMouseOver={(e) => hoverEffect(e, '#0abed8', '#ffffff')}
                onMouseOut={(e) => hoverEffect(e, '#0FCAEB', '#00121e')}
              >
                Edit Post
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <button
                onClick={handleDelete}
                className="btn"
                style={buttonStyle('#dc3545', '#fff')}
                onMouseOver={(e) => hoverEffect(e, '#b02a37')}
                onMouseOut={(e) => hoverEffect(e, '#dc3545')}
              >
                Delete Post
              </button>
            </motion.div>
          </>
        )}

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/"
            className="btn"
            style={buttonStyle('#0FCAEB', '#00121e')}
            onMouseOver={(e) => hoverEffect(e, '#0abed8', '#ffffff')}
            onMouseOut={(e) => hoverEffect(e, '#0FCAEB', '#00121e')}
          >
            Back to Home
          </Link>
        </motion.div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#f0f9ff', marginBottom: '1rem' }}>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment) => <CommentCard key={comment._id} comment={comment} />)
        ) : (
          <p style={{ color: '#aacbe1' }}>No comments yet.</p>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <textarea
            rows="3"
            placeholder={user ? "Write a comment..." : "Log in to comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              border: 'none',
              resize: 'none',
              backgroundColor: '#012941',
              color: '#f0f9ff',
              marginBottom: '1rem',
            }}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={!user}
            style={{
              backgroundColor: '#0FCAEB',
              color: '#00121e',
              border: 'none',
              borderRadius: '20px',
              padding: '0.5rem 1.2rem',
              fontWeight: 'bold',
              cursor: user ? 'pointer' : 'not-allowed',
              boxShadow: '0 0 14px rgba(15, 202, 235, 0.5)',
              opacity: user ? 1 : 0.6,
            }}
          >
            Add Comment
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function buttonStyle(bg, color) {
  return {
    borderRadius: '30px',
    backgroundColor: bg,
    color: color,
    fontWeight: 600,
    padding: '0.6rem 1.5rem',
    border: 'none',
    boxShadow: `0 0 14px ${bg === '#dc3545' ? 'rgba(220, 53, 69, 0.5)' : 'rgba(15, 202, 235, 0.5)'}`,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  };
}

function hoverEffect(e, bg, color = null) {
  e.currentTarget.style.backgroundColor = bg;
  if (color) e.currentTarget.style.color = color;
  e.currentTarget.style.boxShadow = `0 0 20px ${bg === '#b02a37' ? 'rgba(220, 53, 69, 0.7)' : 'rgba(15, 202, 235, 0.7)'}`;
}

export default BlogPage;