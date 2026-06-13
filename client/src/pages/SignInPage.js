import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner, Modal } from 'react-bootstrap';
import { signIn } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
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

    if (!email.trim() || !password.trim()) {
      showCustomModal('Validation Error', 'Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await signIn({ email, password });
      login(userData);
      showCustomModal('Success!', 'You have successfully signed in.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Failed to sign in:', err);
      const message =
        err?.response?.data?.message || 'Invalid email or password. Please try again.';
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
          <LogIn size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Sign In
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

          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="auth-label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <Link to="/forgot-password" style={{ color: '#b2dfdb', textDecoration: 'none', fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </div>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Sign up</Link>
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

export default SignInPage;
