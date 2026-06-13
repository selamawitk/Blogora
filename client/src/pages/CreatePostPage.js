import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner, Modal } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PenSquare } from 'lucide-react';

function CreatePostPage({ onPostCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const showCustomModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showCustomModal('Validation Error', 'Please fill out all fields before creating a post.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/posts', { title, content });
      showCustomModal('Success!', 'Your post has been created successfully!');
      if (onPostCreated) onPostCreated();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Failed to create post:', err);
      showCustomModal('Error', 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="form-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <motion.div className="form-card">
        <h2>
          <PenSquare size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
          Create New Post
        </h2>

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
              rows={8}
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              required
              style={{ resize: 'vertical' }}
            />
          </Form.Group>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="d-grid">
            <Button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn"
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </motion.div>
        </Form>
      </motion.div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className={modalTitle === 'Error' ? 'text-danger' : 'text-success'}>
            {modalTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default CreatePostPage;
