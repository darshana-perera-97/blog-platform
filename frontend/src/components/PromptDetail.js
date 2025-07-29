import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { promptsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PromptDetail = () => {
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const response = await promptsAPI.getPrompt(id);
      setPrompt(response.data);
    } catch (err) {
      setError('Prompt not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async () => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await promptsAPI.deletePrompt(id);
        navigate('/prompts');
      } catch (err) {
        setError('Failed to delete prompt');
      }
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
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !prompt) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error || 'Prompt not found'}</p>
              <hr />
              <Button as={Link} to="/prompts" variant="outline-danger">
                Go Back to Prompts
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="h2 mb-2">{prompt.title}</h1>
                  <div className="d-flex gap-2 mb-2">
                    <Badge bg="info">{prompt.category}</Badge>
                    {prompt.isPublic ? (
                      <Badge bg="success">Public</Badge>
                    ) : (
                      <Badge bg="secondary">Private</Badge>
                    )}
                  </div>
                  <div className="text-muted">
                    <small>
                      By <strong>{prompt.authorName}</strong> • {formatDate(prompt.createdAt)}
                    </small>
                  </div>
                </div>
                
                {user && user.id === prompt.authorId && (
                  <div className="d-flex gap-2">
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
                      onClick={handleDeletePrompt}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <hr />

              <div className="prompt-content">
                <h5>Master Prompt Content:</h5>
                <div className="bg-light p-3 rounded border">
                  {prompt.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {prompt.updatedAt !== prompt.createdAt && (
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    Last updated: {formatDate(prompt.updatedAt)}
                  </small>
                </div>
              )}

              <div className="mt-4">
                <Button as={Link} to="/prompts" variant="outline-primary">
                  ← Back to Prompts
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PromptDetail; 