import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Button, Spinner, Modal } from 'react-bootstrap';
import { signIn } from '../services/auth';
import { useAuth } from '../context/AuthContext';

function SignInPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  // Guard: if Auth context is not available, show an error message
  if (!auth) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <h4 className="text-danger">
          Auth context not found. Please ensure your app is wrapped in &lt;AuthProvider&gt;.
        </h4>
      </div>
    );
  }

  const { login } = auth;

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
          maxWidth: '480px',
          border: 'none',
          borderRadius: '1.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgb(2, 38, 67) 70%, #0FCAEB 130%)',
          backdropFilter: 'blur(6px)',
          color: '#e2f1f5',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          marginTop: '-40px', // Adjust card vertical position
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
          Sign In
        </h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-medium">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="fw-medium">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
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

export default SignInPage;
