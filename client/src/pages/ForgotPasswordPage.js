import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner, Modal } from 'react-bootstrap';
import { forgotPassword } from '../services/auth';
import { KeyRound } from 'lucide-react';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
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
    if (!email.trim()) {
      showCustomModal('Validation Error', 'Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(email);
      showCustomModal('Check Your Email', 'If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to process request. Please try again.';
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
          <KeyRound size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Forgot Password
        </h2>

        <p style={{ textAlign: 'center', color: '#b2dfdb', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter your email and we will send you a reset token.
        </p>

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

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="d-grid">
            <Button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn"
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                'Send Reset Token'
              )}
            </Button>
          </motion.div>

          <p className="auth-footer-text">
            Remember your password?{' '}
            <Link to="/signin" className="auth-link">Sign in</Link>
          </p>
        </Form>
      </motion.div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className={modalTitle === 'Error' ? 'text-danger' : 'text-success'}>
            {modalTitle === 'Error' ? 'Error' : 'Success'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalMessage}</p>
          {modalTitle !== 'Error' && (
            <div className="mt-3" style={{ textAlign: 'center' }}>
              <Link
                to="/signin"
                className="btn rounded-pill px-4 py-2"
                style={{
                  backgroundColor: '#0FCAEB',
                  borderColor: '#0FCAEB',
                  color: '#00121e',
                  fontWeight: 600,
                }}
                onClick={handleCloseModal}
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default ForgotPasswordPage;
