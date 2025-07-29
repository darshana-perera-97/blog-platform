import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { promptsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Prompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPrompts();
  }, [isAuthenticated]);

  const fetchPrompts = async () => {
    try {
      const response = await promptsAPI.getAllPrompts();
      setPrompts(response.data);
    } catch (err) {
      setError('Failed to load prompts');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-0">
                {isAuthenticated ? '🤖 My Master Prompts' : '🤖 Master Prompts'}
              </h1>
              {isAuthenticated && (
                <p className="text-muted mb-0">
                  Welcome back, <strong>{user?.username}</strong>! Here are your master prompts.
                </p>
              )}
            </div>
            {isAuthenticated && (
              <Button as={Link} to="/create-prompt" variant="success">
                + Create Prompt
              </Button>
            )}
          </div>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>

      {prompts.length === 0 ? (
        <Row>
          <Col className="text-center">
            <Card className="p-5">
              <Card.Body>
                {isAuthenticated ? (
                  <>
                    <h3>No prompts yet!</h3>
                    <p className="text-muted">Start creating your own master prompts to guide AI responses.</p>
                    <Button as={Link} to="/create-prompt" variant="success">
                      Create Your First Prompt
                    </Button>
                  </>
                ) : (
                  <>
                    <h3>No prompts available!</h3>
                    <p className="text-muted">Login to create and manage your own master prompts.</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button as={Link} to="/register" variant="success">
                        Register
                      </Button>
                      <Button as={Link} to="/login" variant="outline-primary">
                        Login
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row>
          {prompts.map((prompt) => (
            <Col key={prompt.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5 mb-0">{prompt.title}</Card.Title>
                    <div>
                      {prompt.isPublic ? (
                        <Badge bg="success">Public</Badge>
                      ) : (
                        <Badge bg="secondary">Private</Badge>
                      )}
                    </div>
                  </div>
                  
                  <Badge bg="info" className="mb-2 align-self-start">
                    {prompt.category}
                  </Badge>
                  
                  <Card.Text className="flex-grow-1">
                    {prompt.content.length > 150
                      ? `${prompt.content.substring(0, 150)}...`
                      : prompt.content}
                  </Card.Text>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        By <strong>{prompt.authorName}</strong>
                      </small>
                      <small className="text-muted">
                        {formatDate(prompt.createdAt)}
                      </small>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/prompt/${prompt.id}`}
                        variant="outline-primary"
                        size="sm"
                        className="flex-fill"
                      >
                        View Details
                      </Button>
                      
                      {isAuthenticated && user && user.id === prompt.authorId && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Prompts; 