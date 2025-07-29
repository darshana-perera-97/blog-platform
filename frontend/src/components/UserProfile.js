import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, ListGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { promptsAPI, aiBlogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showQuickGenModal, setShowQuickGenModal] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPrompts();
    }
  }, [isAuthenticated]);

  const fetchUserPrompts = async () => {
    try {
      const response = await promptsAPI.getUserPrompts();
      setPrompts(response.data);
    } catch (err) {
      setError('Failed to load your prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await promptsAPI.deletePrompt(promptId);
        setPrompts(prompts.filter(prompt => prompt.id !== promptId));
      } catch (err) {
        setError('Failed to delete prompt');
      }
    }
  };

  const handleQuickGenerate = async () => {
    if (prompts.length === 0) {
      setError('No master prompts available. Please create a master prompt first.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      // Get a random prompt (or the first one)
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      // Generate a random topic based on the prompt category
      const topics = [
        'latest trends in technology',
        'personal development tips',
        'workplace productivity',
        'digital transformation',
        'future of work',
        'innovation in business',
        'sustainable practices',
        'mental health awareness',
        'professional growth',
        'digital marketing strategies'
      ];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];

      const response = await aiBlogAPI.generateBlog({
        promptId: randomPrompt.id,
        topic: randomTopic,
        style: 'informative',
        autoSave: true
      });

      if (response.data.generated) {
        setShowQuickGenModal(false);
        // Navigate to home to see the new post
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate blog post');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <Alert variant="warning">
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>Please log in to view your profile.</p>
              <hr />
              <Button as={Link} to="/login" variant="primary">
                Go to Login
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        {/* User Information Card */}
        <Col xs={12} md={4} className="mb-4">
          <Card className="shadow h-100">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">👤 User Profile</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <h5 className="mb-2">{user?.username}</h5>
              <p className="text-muted mb-3">{user?.email}</p>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  onClick={() => setShowQuickGenModal(true)}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : '🚀 Generate Quick Blog'}
                </Button>
                <Button as={Link} to="/create-post" variant="outline-primary" size="sm">
                  📝 Create New Post
                </Button>
                <Button as={Link} to="/create-prompt" variant="outline-success" size="sm">
                  🤖 Create New Prompt
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Master Prompts Section */}
        <Col xs={12} md={8}>
          <Card className="shadow">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">🤖 My Master Prompts</h4>
              <Button as={Link} to="/create-prompt" variant="light" size="sm">
                + Add Prompt
              </Button>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {prompts.length === 0 ? (
                <div className="text-center py-4">
                  <h5 className="text-muted">No prompts yet!</h5>
                  <p className="text-muted mb-3">Start creating your master prompts to guide AI responses.</p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button 
                      variant="success" 
                      onClick={() => setShowQuickGenModal(true)}
                      disabled={generating}
                    >
                      {generating ? 'Generating...' : '🚀 Generate Quick Blog'}
                    </Button>
                    <Button as={Link} to="/create-prompt" variant="success">
                      Create Your First Prompt
                    </Button>
                  </div>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {prompts.map((prompt) => (
                    <ListGroup.Item key={prompt.id} className="border-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h6 className="mb-0">{prompt.title}</h6>
                            <Badge bg={prompt.isPublic ? "success" : "secondary"}>
                              {prompt.isPublic ? "Public" : "Private"}
                            </Badge>
                            <Badge bg="info">{prompt.category}</Badge>
                          </div>
                          
                          <p className="text-muted mb-2">
                            {prompt.content.length > 100
                              ? `${prompt.content.substring(0, 100)}...`
                              : prompt.content}
                          </p>
                          
                          <small className="text-muted">
                            Created: {formatDate(prompt.createdAt)}
                          </small>
                        </div>
                        
                        <div className="d-flex gap-1 ms-3">
                          <Button
                            as={Link}
                            to={`/prompt/${prompt.id}`}
                            variant="outline-primary"
                            size="sm"
                          >
                            View
                          </Button>
                          <Button
                            as={Link}
                            to={`/edit-prompt/${prompt.id}`}
                            variant="outline-secondary"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePrompt(prompt.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Generate Modal */}
      <Modal show={showQuickGenModal} onHide={() => setShowQuickGenModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🚀 Generate Quick Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This will automatically generate a blog post using one of your master prompts and a random topic.</p>
          <p className="text-muted">
            <strong>What happens:</strong>
            <br />
            • Selects a random master prompt from your available prompts
            <br />
            • Generates a relevant topic
            <br />
            • Creates a blog post with title, content, and meta description
            <br />
            • Saves it as a private post (you can make it public later)
          </p>
          {prompts.length === 0 && (
            <Alert variant="warning">
              <strong>No master prompts available!</strong>
              <br />
              Please create a master prompt first.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuickGenModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleQuickGenerate}
            disabled={generating || prompts.length === 0}
          >
            {generating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating...
              </>
            ) : (
              'Generate Blog Post'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile; 