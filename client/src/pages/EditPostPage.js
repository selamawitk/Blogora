import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit3 } from 'lucide-react';

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin', { replace: true });
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const post = response.data?.success ? response.data.data : response.data;
        setTitle(post.title || '');
        setContent(post.content || '');
      } catch (err) {
        console.error('Failed to load post:', err.response?.data || err.message);
        setError('Unable to load post. Redirecting to home...');
        setTimeout(() => navigate('/'), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/posts/${id}`, { title, content });
      navigate(`/blogs/${id}`);
    } catch (err) {
      console.error('Failed to update post:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-section">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <motion.div
      className="form-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <motion.div className="form-card">
        <h2>
          <Edit3 size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
          Edit Post
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="content">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              required
              style={{ resize: 'vertical' }}
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" disabled={submitting} className="auth-submit-btn">
              {submitting ? 'Updating...' : 'Update Post'}
            </Button>
          </div>
        </Form>
      </motion.div>
    </motion.div>
  );
}

export default EditPostPage;
