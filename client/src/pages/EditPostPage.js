import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner } from 'react-bootstrap';
import api from '../services/api';

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setLoading(false);
      })
      .catch(() => {
        alert('Blog post not found.');
        navigate('/');
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/posts/${id}`, { title, content });
      navigate(`/blogs/${id}`);
    } catch (err) {
      alert('Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner
          animation="border"
          role="status"
          style={{ color: '#0FCAEB', width: '3rem', height: '3rem' }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B1F3A',
        padding: '2rem',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <motion.div
        className="card"
        style={{
          width: '100%',
          maxWidth: '600px',
          border: 'none',
          borderRadius: '1.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg,rgb(2, 38, 67) 70%, #0FCAEB 130%)',
          backdropFilter: 'blur(6px)',
          color: '#e2f1f5',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <h2
          className="text-center mb-4 fw-bold"
          style={{
            fontFamily: 'Poppins, sans-serif',
            background: 'linear-gradient(45deg, #0dcaf0, #6610f2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Edit Post
        </h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label className="fw-medium">Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
              style={{
                backgroundColor: 'rgba(11, 31, 58, 0.85)',
                color: '#b2dfdb',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="content">
            <Form.Label className="fw-medium">Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              required
              style={{
                backgroundColor: 'rgba(11, 31, 58, 0.85)',
                color: '#b2dfdb',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                resize: 'vertical',
              }}
            />
          </Form.Group>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="d-grid">
            <Button
              type="submit"
              disabled={submitting}
              className="fw-bold rounded-pill"
              style={{
                backgroundColor: '#0FCAEB',
                borderColor: '#0FCAEB',
                color: '#00121e',
                boxShadow: '0 0 14px rgba(15, 202, 235, 0.5)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0abed8';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(15, 202, 235, 0.7)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0FCAEB';
                e.currentTarget.style.color = '#00121e';
                e.currentTarget.style.boxShadow = '0 0 14px rgba(15, 202, 235, 0.5)';
              }}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Post'
              )}
            </Button>
          </motion.div>
        </Form>
      </motion.div>
    </motion.div>
  );
}

export default EditPostPage;
