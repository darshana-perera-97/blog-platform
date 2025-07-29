import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditPost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    metaDescription: ''
  });
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      const postData = response.data;
      
      // Check if user is the author
      if (postData.authorId !== user?.id) {
        setError('You can only edit your own posts');
        setLoading(false);
        return;
      }
      
      setPost(postData);
      setFormData({
        title: postData.title,
        content: postData.content,
        metaDescription: postData.metaDescription || ''
      });
    } catch (err) {
      setError('Post not found or you do not have permission to edit it');
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);

    try {
      await postsAPI.updatePost(id, formData);
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
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

  if (error && !formData.title) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              <hr />
              <Button onClick={() => navigate('/')} variant="outline-danger">
                Go Back Home
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-warning text-dark text-center">
              <h4 className="mb-0">Edit Post</h4>
              {post && (
                <div className="mt-2">
                  {post.isPublic ? (
                    <Badge bg="success">Public</Badge>
                  ) : (
                    <Badge bg="secondary">Private</Badge>
                  )}
                </div>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              {post && (
                <Alert variant="info" className="mb-4">
                  <strong>Publication Status:</strong> {post.isPublic ? 'Public' : 'Private'}
                  <br />
                  <small className="text-muted">
                    You can change the publication status from your blog dashboard after saving changes.
                  </small>
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

                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/post/${id}`)}
                    className="flex-fill"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="warning"
                    type="submit"
                    className="flex-fill"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
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

export default EditPost; 