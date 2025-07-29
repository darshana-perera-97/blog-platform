import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { promptsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditPrompt = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const response = await promptsAPI.getPrompt(id);
      const prompt = response.data;
      
      // Check if user is the author
      if (prompt.authorId !== user?.id) {
        setError('You can only edit your own prompts');
        setLoading(false);
        return;
      }
      
      setFormData({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
      });
    } catch (err) {
      setError('Prompt not found or you do not have permission to edit it');
    } finally {
      setLoading(false);
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

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);

    try {
      await promptsAPI.updatePrompt(id, formData);
      navigate(`/prompt/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    'General',
    'Writing',
    'Programming',
    'Creative',
    'Business',
    'Education',
    'Technical',
    'Other'
  ];

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
              <Button onClick={() => navigate('/prompts')} variant="outline-danger">
                Go Back to Prompts
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
              <h4 className="mb-0">Edit Master Prompt</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter prompt title"
                    maxLength={100}
                  />
                  <Form.Text className="text-muted">
                    {formData.title.length}/100 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Write your master prompt content here..."
                    style={{ resize: 'vertical' }}
                  />
                  <Form.Text className="text-muted">
                    This will be the master prompt that guides AI responses
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/prompt/${id}`)}
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

export default EditPrompt; 