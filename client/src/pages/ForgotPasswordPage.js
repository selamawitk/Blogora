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
  const [resetToken, setResetToken] = useState('');

  const showCustomModal = (title, message, token) => {
    setModalTitle(title);
    setModalMessage(message);
    setResetToken(token || '');
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
      const data = await forgotPassword(email);
      const msg = data.resetToken
        ? `A reset token has been generated. Copy it below and go to the Reset Password page.`
        : data.message;
      showCustomModal('Success', msg, data.resetToken);
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
            {modalTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalMessage}</p>
          {resetToken && (
            <div
              className="p-3 rounded"
              style={{ background: 'rgba(11, 31, 58, 0.9)', color: '#0FCAEB', wordBreak: 'break-all' }}
            >
              <strong>Reset Token:</strong>
              <br />
              <code style={{ color: '#e2f1f5' }}>{resetToken}</code>
              <br />
              <small style={{ color: '#b2dfdb' }}>
                Copy this token and go to the Reset Password page.
              </small>
            </div>
          )}
          {resetToken && (
            <div className="mt-3 text-center">
              <Link
                to={`/reset-password/${resetToken}`}
                className="btn rounded-pill px-4 py-2"
                style={{
                  backgroundColor: '#0FCAEB',
                  borderColor: '#0FCAEB',
                  color: '#00121e',
                  fontWeight: 600,
                }}
                onClick={handleCloseModal}
              >
                Go to Reset Password
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
