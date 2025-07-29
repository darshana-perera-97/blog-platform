import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setError('No verification token found in URL');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      setVerificationStatus('success');
      setMessage(response.data.message);
    } catch (err) {
      setVerificationStatus('error');
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Verifying...</span>
            </Spinner>
            <h4>Verifying your email...</h4>
            <p className="text-muted">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mb-3">
              <span style={{ fontSize: '3rem' }}>✅</span>
            </div>
            <h4 className="text-success">Email Verified Successfully!</h4>
            <p className="mb-4">{message}</p>
            <Button as={Link} to="/login" variant="success" size="lg">
              Go to Login
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mb-3">
              <span style={{ fontSize: '3rem' }}>❌</span>
            </div>
            <h4 className="text-danger">Verification Failed</h4>
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
            <div className="d-flex gap-2 justify-content-center">
              <Button as={Link} to="/login" variant="primary">
                Go to Login
              </Button>
              <Button as={Link} to="/register" variant="outline-secondary">
                Register Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">Email Verification</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {renderContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail; 