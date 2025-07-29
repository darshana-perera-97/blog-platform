import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { promptsAPI } from '../services/api';

const CreatePrompt = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

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

    setLoading(true);

    try {
      await promptsAPI.createPrompt(formData);
      navigate('/prompts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prompt');
    } finally {
      setLoading(false);
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

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-success text-white text-center">
              <h4 className="mb-0">Create Master Prompt</h4>
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
                    This will be your personal master prompt that guides AI responses for your blog generation
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/prompts')}
                    className="flex-fill"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    className="flex-fill"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Prompt'}
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

export default CreatePrompt; 