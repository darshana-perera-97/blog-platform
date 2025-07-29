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
      navigate('/');
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
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted">Sign in to your account to continue</p>
          </div>
          
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
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
                  <Form.Label className="fw-medium">Username or Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="emailOrUsername"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username or email"
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="form-control-lg"
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 