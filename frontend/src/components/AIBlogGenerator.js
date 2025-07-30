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
  const [generationStep, setGenerationStep] = useState('');
  
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
    setGenerationStep('Initializing AI service...');

    try {
      // Simulate generation steps for better UX
      setTimeout(() => setGenerationStep('Analyzing your topic and prompt...'), 500);
      setTimeout(() => setGenerationStep('Generating blog content...'), 1500);
      setTimeout(() => setGenerationStep('Creating AI-generated image...'), 3000);
      setTimeout(() => setGenerationStep('Finalizing your blog post...'), 5000);

      const response = await aiBlogAPI.generateBlog(formData);
      
      if (response.data.generated) {
        // Blog was auto-saved
        navigate('/home');
      } else {
        // Show generated content for review
        setGeneratedBlog(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate blog post');
    } finally {
      setLoading(false);
      setGenerationStep('');
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
      
      // The backend will handle downloading and saving the image
      navigate('/home');
    } catch (err) {
      setError('Failed to save generated blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGeneratedBlog = () => {
    if (!generatedBlog) return;
    
    // Navigate to create post with pre-filled data
    // Note: The imageUrl here will be the DALL-E URL, which will be downloaded when saved
    const postData = {
      title: generatedBlog.generatedBlog.title,
      content: generatedBlog.generatedBlog.content,
      metaDescription: generatedBlog.generatedBlog.metaDescription,
      imageUrl: generatedBlog.generatedBlog.imageUrl || ''
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
      {/* Loading Overlay */}
      {loading && (
        <div className="generation-overlay">
          <div className="generation-modal">
            <div className="text-center">
              <div className="mb-4">
                <span className="display-1">🤖</span>
              </div>
              <h4 className="mb-3">Generating Your Blog Post</h4>
              <div className="mb-4">
                <Spinner animation="border" size="lg" className="me-3" />
                <span className="text-muted">{generationStep}</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-muted small mb-0">
                This may take a few moments. Please don't close this page.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
                      onClick={() => navigate('/home')}
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
                          {generationStep || 'Generating...'}
                        </>
                      ) : (
                        'Generate Blog Post'
                      )}
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Alert variant="success" className="mb-4">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <span className="display-6">🎉</span>
                      </div>
                      <div>
                        <h5 className="mb-1">Blog Post Generated Successfully!</h5>
                        <p className="mb-0 text-muted">Review the generated content below and choose what to do next.</p>
                      </div>
                    </div>
                  </Alert>

                  {/* Generation Info */}
                  <Card className="mb-4 border-0 bg-light">
                    <Card.Body className="py-3">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <h6 className="mb-1">🤖 Generation Details</h6>
                          <div className="d-flex gap-2">
                            <Badge bg="info">AI Generated</Badge>
                            <Badge bg="secondary">{generatedBlog.generationParams.style}</Badge>
                            <Badge bg="success">{generatedBlog.generationParams.topic}</Badge>
                          </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                          <small className="text-muted">
                            Generated using: <strong>{generatedBlog.promptUsed.title}</strong>
                          </small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Blog Preview */}
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h4 className="mb-2">{generatedBlog.generatedBlog.title}</h4>
                          <p className="text-muted mb-0">
                            <small>AI-generated blog post preview</small>
                          </p>
                        </div>
                        <div className="text-end">
                          <Badge bg="primary" className="mb-1">Preview</Badge>
                          <br />
                          <small className="text-muted">
                            {new Date().toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </Card.Header>
                    
                    <Card.Body className="p-0">
                      {/* Generated Image */}
                      {generatedBlog.generatedBlog.imageUrl && (
                        <div className="blog-preview-image">
                          <div className="post-image-container">
                            <img 
                              src={generatedBlog.generatedBlog.imageUrl} 
                              alt={generatedBlog.generatedBlog.title}
                              className="post-image w-100"
                              style={{ 
                                maxHeight: '400px', 
                                objectFit: 'cover',
                                borderBottom: '1px solid #eee'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="placeholder-image" style={{ display: 'none', height: '300px' }}>
                              <div className="placeholder-content">
                                <span className="placeholder-icon">🖼️</span>
                                <p className="placeholder-text">Generated image could not be loaded</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        {/* Meta Description */}
                        {generatedBlog.generatedBlog.metaDescription && (
                          <div className="mb-4 p-3 bg-light rounded">
                            <h6 className="text-muted mb-2">
                              <span className="me-2">📝</span>Summary
                            </h6>
                            <p className="mb-0 text-muted fst-italic">
                              "{generatedBlog.generatedBlog.metaDescription}"
                            </p>
                          </div>
                        )}
                        
                        {/* Blog Content */}
                        <div className="blog-content">
                          <h6 className="text-muted mb-3">
                            <span className="me-2">📄</span>Content
                          </h6>
                          {generatedBlog.generatedBlog.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Action Buttons */}
                  <Card className="border-0 bg-light">
                    <Card.Body className="py-4">
                      <h6 className="text-center mb-3">What would you like to do with this generated blog post?</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <Button
                            variant="outline-secondary"
                            onClick={() => setGeneratedBlog(null)}
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                            style={{ minHeight: '100px' }}
                          >
                            <span className="display-6 mb-2">🔄</span>
                            <strong>Generate Another</strong>
                            <small className="text-muted">Create a new blog post</small>
                          </Button>
                        </div>
                        <div className="col-md-4">
                          <Button
                            variant="outline-primary"
                            onClick={handleEditGeneratedBlog}
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                            style={{ minHeight: '100px' }}
                          >
                            <span className="display-6 mb-2">✏️</span>
                            <strong>Edit & Save</strong>
                            <small className="text-muted">Modify before saving</small>
                          </Button>
                        </div>
                        <div className="col-md-4">
                          <Button
                            variant="success"
                            onClick={handleSaveGeneratedBlog}
                            disabled={loading}
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                            style={{ minHeight: '100px' }}
                          >
                            {loading ? (
                              <>
                                <Spinner animation="border" size="sm" className="mb-2" />
                                <strong>Saving...</strong>
                                <small className="text-muted">Please wait</small>
                              </>
                            ) : (
                              <>
                                <span className="display-6 mb-2">💾</span>
                                <strong>Save As-Is</strong>
                                <small className="text-muted">Save immediately</small>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
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