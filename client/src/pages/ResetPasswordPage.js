import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner, Modal } from 'react-bootstrap';
import { resetPassword } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!password || password.length < 6) {
      showCustomModal('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showCustomModal('Validation Error', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await resetPassword({ token, password });
      login(data);
      showCustomModal('Success!', 'Your password has been reset. You are now signed in.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.';
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
          <Lock size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Reset Password
        </h2>

        <p style={{ textAlign: 'center', color: '#b2dfdb', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter your new password below.
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="auth-label">New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="confirmPassword">
            <Form.Label className="auth-label">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </motion.div>

          <p className="auth-footer-text">
            <Link to="/signin" className="auth-link">Back to Sign In</Link>
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

export default ResetPasswordPage;
