import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setLoading(true);

    try {
      await login(formData);
      navigate('/home');
    } catch (err) {
      if (err.response?.data?.emailNotVerified) {
        setEmailNotVerified(true);
        setUserEmail(formData.emailOrUsername.includes('@') ? formData.emailOrUsername : '');
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>
        <div className="auth-body">
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          
          {emailNotVerified && (
            <Alert variant="warning" className="mb-3">
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-2">Email Not Verified</h6>
                  <p className="mb-2 small">Please verify your email address before logging in.</p>
                  <div className="d-flex gap-2">
                    <Button 
                      as={Link} 
                      to="/resend-verification" 
                      variant="outline-warning"
                      size="sm"
                    >
                      Resend Email
                    </Button>
                    <Button 
                      as={Link} 
                      to="/verify-email" 
                      variant="outline-primary"
                      size="sm"
                    >
                      Verify Email
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username or Email</Form.Label>
              <Form.Control
                type="text"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleChange}
                required
                placeholder="Enter your username or email"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center">
              <p className="text-muted mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none fw-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login; 