import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner, Modal } from 'react-bootstrap';
import { register } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const showCustomModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !username.trim() || !password.trim()) {
      showCustomModal('Validation Error', 'Please fill out all fields before registering.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await register({ email, username, password });
      login(userData);
      showCustomModal('Success!', 'Your account has been created. Redirecting to home...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Failed to register:', err);
      const message = err?.response?.data?.message || 'Failed to register. Please try again.';
      showCustomModal('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="auth-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <motion.div className="auth-card">
        <h2 className="auth-card-title">
          <UserPlus size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Register Account
        </h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="auth-label">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="username">
            <Form.Label className="auth-label">Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="auth-label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
              className="auth-input"
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
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </motion.div>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/signin" className="auth-link">Sign in</Link>
          </p>
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

export default RegisterPage;
