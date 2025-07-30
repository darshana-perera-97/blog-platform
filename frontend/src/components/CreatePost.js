import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { postsAPI } from '../services/api';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    metaDescription: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check for pre-filled data from AI generation
    const generatedData = sessionStorage.getItem('generatedBlogData');
    if (generatedData) {
      try {
        const parsedData = JSON.parse(generatedData);
        setFormData({
          title: parsedData.title || '',
          content: parsedData.content || '',
          metaDescription: parsedData.metaDescription || '',
          imageUrl: parsedData.imageUrl || ''
        });
        setIsAIGenerated(true);
        // Clear the session storage
        sessionStorage.removeItem('generatedBlogData');
      } catch (err) {
        console.error('Error parsing generated blog data:', err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      // Check if this is an AI-generated post with a DALL-E image URL
      const isAIGeneratedWithImage = isAIGenerated && formData.imageUrl && formData.imageUrl.startsWith('http');
      
      if (isAIGeneratedWithImage) {
        // For AI-generated posts with DALL-E images, we need to download the image
        // The backend will handle this automatically
        console.log('🤖 Creating AI-generated post with image download...');
      }
      
      await postsAPI.createPost(formData);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">Create New Post</h4>
              {isAIGenerated && (
                <Badge bg="info" className="mt-2">
                  🤖 AI Generated Content
                </Badge>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              {isAIGenerated && (
                <Alert variant="info">
                  <strong>AI Generated Content Detected!</strong>
                  <br />
                  Review and edit the content below before publishing. You can modify any part of the generated content.
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter post title"
                    maxLength={100}
                  />
                  <Form.Text className="text-muted">
                    {formData.title.length}/100 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Enter a brief description for SEO (optional)"
                    maxLength={160}
                  />
                  <Form.Text className="text-muted">
                    {formData.metaDescription.length}/160 characters - This helps with SEO and social media sharing
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Image URL (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Form.Text className="text-muted">
                    Add an image URL to display with your post. Leave empty to use a placeholder image.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Write your post content here..."
                    style={{ resize: 'vertical' }}
                  />
                </Form.Group>

                <Alert variant="info" className="mb-4">
                  <strong>Note:</strong> All posts are created as private by default. 
                  You can publish them later from your blog dashboard to make them visible on the sample blog page.
                </Alert>

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
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Post'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePost; 