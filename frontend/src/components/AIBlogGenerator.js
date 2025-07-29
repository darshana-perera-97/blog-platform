import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { aiBlogAPI } from '../services/api';

const AIBlogGenerator = () => {
  const [formData, setFormData] = useState({
    promptId: '',
    topic: '',
    style: 'informative',
    autoSave: false
  });
  const [prompts, setPrompts] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrompts();
    fetchAIStatus();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await aiBlogAPI.getAvailablePrompts();
      setPrompts(response.data);
    } catch (err) {
      setError('Failed to load master prompts');
    } finally {
      setPromptsLoading(false);
    }
  };

  const fetchAIStatus = async () => {
    try {
      const response = await aiBlogAPI.getAIStatus();
      setAiStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedBlog(null);

    if (!formData.promptId || !formData.topic.trim()) {
      setError('Please select a master prompt and enter a topic');
      return;
    }

    setLoading(true);

    try {
      const response = await aiBlogAPI.generateBlog(formData);
      
      if (response.data.generated) {
        // Blog was auto-saved
        navigate('/');
      } else {
        // Show generated content for review
        setGeneratedBlog(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneratedBlog = async () => {
    if (!generatedBlog) return;

    try {
      setLoading(true);
      const response = await aiBlogAPI.generateBlog({
        ...formData,
        autoSave: true
      });
      
      navigate('/');
    } catch (err) {
      setError('Failed to save generated blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGeneratedBlog = () => {
    if (!generatedBlog) return;
    
    // Navigate to create post with pre-filled data
    const postData = {
      title: generatedBlog.generatedBlog.title,
      content: generatedBlog.generatedBlog.content,
      metaDescription: generatedBlog.generatedBlog.metaDescription
    };
    
    // Store in sessionStorage for the create post component to use
    sessionStorage.setItem('generatedBlogData', JSON.stringify(postData));
    navigate('/create-post');
  };

  if (promptsLoading) {
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
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="shadow">
            <Card.Header><h4>🤖 AI Blog Generator</h4></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {aiStatus && (
                <Alert variant={aiStatus.available ? 'success' : 'warning'}>
                  <strong>AI Service Status:</strong> {aiStatus.available ? 'Available' : 'Not Available'}
                  {aiStatus.available && (
                    <span> • Model: {aiStatus.model} • Max Tokens: {aiStatus.maxTokens}</span>
                  )}
                </Alert>
              )}
              
              {!aiStatus?.available && (
                <Alert variant="warning">
                  <strong>Note:</strong> AI blog generation is currently unavailable. Please check your OpenAI configuration.
                </Alert>
              )}
              
              {prompts.length === 0 && !promptsLoading && (
                <Alert variant="info">
                  <strong>No Master Prompts Available</strong><br />
                  You need to create your own master prompts first. You can only use your own prompts for AI blog generation.
                  <br />
                  <Link to="/prompts/create" className="btn btn-primary btn-sm mt-2">
                    Create Your First Master Prompt
                  </Link>
                </Alert>
              )}
              
              {!generatedBlog ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Select Your Master Prompt</strong></Form.Label>
                        <Form.Select
                          name="promptId"
                          value={formData.promptId}
                          onChange={handleChange}
                          required
                          disabled={promptsLoading || prompts.length === 0}
                        >
                          <option value="">Choose a master prompt...</option>
                          {prompts.map(prompt => (
                            <option key={prompt.id} value={prompt.id}>
                              {prompt.title} {!prompt.isPublic && <Badge bg="secondary">Private</Badge>}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          You can only use your own master prompts for AI generation.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Blog Topic</strong></Form.Label>
                        <Form.Control
                          type="text"
                          name="topic"
                          value={formData.topic}
                          onChange={handleChange}
                          placeholder="Enter the topic for your blog post..."
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Writing Style</Form.Label>
                    <Form.Select
                      name="style"
                      value={formData.style}
                      onChange={handleChange}
                    >
                      <option value="informative">Informative</option>
                      <option value="conversational">Conversational</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="technical">Technical</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="autoSave"
                      checked={formData.autoSave}
                      onChange={handleChange}
                      label="Automatically save generated blog post"
                    />
                    <Form.Text className="text-muted">
                      If unchecked, you can review and edit before saving
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/')}
                      className="flex-fill"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className="flex-fill"
                      disabled={loading || !aiStatus?.available}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Generating...
                        </>
                      ) : (
                        'Generate Blog Post'
                      )}
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Alert variant="success">
                    <h5>✅ Blog Post Generated Successfully!</h5>
                    <p className="mb-0">Review the generated content below and choose what to do next.</p>
                  </Alert>

                  <Card className="mb-4">
                    <Card.Header>
                      <h5>{generatedBlog.generatedBlog.title}</h5>
                      <div className="d-flex gap-2">
                        <Badge bg="info">AI Generated</Badge>
                        <Badge bg="secondary">{generatedBlog.generationParams.style}</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {generatedBlog.generatedBlog.metaDescription && (
                        <div className="mb-3 p-3 bg-light rounded">
                          <h6 className="text-muted mb-2">📝 Summary</h6>
                          <p className="mb-0 text-muted">{generatedBlog.generatedBlog.metaDescription}</p>
                        </div>
                      )}
                      
                      <div className="blog-content">
                        {generatedBlog.generatedBlog.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  <div className="d-flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setGeneratedBlog(null)}
                      className="flex-fill"
                    >
                      Generate Another
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={handleEditGeneratedBlog}
                      className="flex-fill"
                    >
                      Edit & Save
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSaveGeneratedBlog}
                      disabled={loading}
                      className="flex-fill"
                    >
                      {loading ? 'Saving...' : 'Save As-Is'}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AIBlogGenerator; 