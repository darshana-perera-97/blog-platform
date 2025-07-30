import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsageStats();
      setUsageStats(response.data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="h2 fw-bold mb-2">User Profile</h1>
            <p className="text-muted">Manage your account and view usage statistics</p>
          </div>

          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <Row>
            {/* User Information */}
            <Col md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">👤 Account Information</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Username</label>
                    <p className="mb-0 fw-semibold">{user?.username}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Email</label>
                    <p className="mb-0 fw-semibold">{user?.email}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">Member Since</label>
                    <p className="mb-0 fw-semibold">
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline-danger" 
                      onClick={handleLogout}
                      className="w-100"
                    >
                      🚪 Sign Out
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Usage Statistics */}
            <Col md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">📊 Daily Blog Generation</h5>
                </Card.Header>
                <Card.Body>
                  {usageStats ? (
                    <>
                      <div className="text-center mb-4">
                        <div className="usage-circle mb-3">
                          <div className="usage-progress">
                            <span className="usage-number">{usageStats.remaining}</span>
                            <span className="usage-label">remaining</span>
                          </div>
                        </div>
                        <p className="text-muted small mb-0">
                          Out of {usageStats.max} daily limit
                        </p>
                      </div>

                      <div className="usage-stats">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Used today:</span>
                          <span className="fw-semibold">{usageStats.used}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Remaining:</span>
                          <span className="fw-semibold text-success">{usageStats.remaining}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Daily limit:</span>
                          <span className="fw-semibold">{usageStats.max}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Usage Progress</small>
                          <small className="text-muted">{Math.round((usageStats.used / usageStats.max) * 100)}%</small>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${(usageStats.used / usageStats.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center">
                        <small className="text-muted">
                          Resets daily at midnight
                        </small>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-muted mb-2">
                        <span className="display-6">📊</span>
                      </div>
                      <p className="text-muted mb-0">Usage statistics not available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">⚡ Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="mb-3">
                      <Button 
                        variant="outline-primary" 
                        className="w-100"
                        onClick={() => navigate('/create-post')}
                      >
                        ✍️ Create Post
                      </Button>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Button 
                        variant="outline-success" 
                        className="w-100"
                        onClick={() => navigate('/prompts')}
                      >
                        🤖 Manage Prompts
                      </Button>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Button 
                        variant="outline-info" 
                        className="w-100"
                        onClick={() => navigate('/home')}
                      >
                        📝 View Posts
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile; 