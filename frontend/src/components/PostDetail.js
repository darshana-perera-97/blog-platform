import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      setPost(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this post');
      } else {
        setError('Post not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(id);
        navigate('/home');
      } catch (err) {
        setError('Failed to delete post');
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

  if (error || !post) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error || 'Post not found'}</p>
              <hr />
              <Button as={Link} to="/home" variant="outline-danger">
                Go Back Home
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
            {/* Post Image */}
            <div className="post-image-container">
              {post.imageUrl ? (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="post-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="placeholder-image">
                  <div className="placeholder-content">
                    <span className="placeholder-icon">
                      {post.generatedFrom ? '🤖' : '📝'}
                    </span>
                    <p className="placeholder-text">{post.title}</p>
                  </div>
                </div>
              )}
              <div className="placeholder-image" style={{ display: 'none' }}>
                <div className="placeholder-content">
                  <span className="placeholder-icon">
                    {post.generatedFrom ? '🤖' : '📝'}
                  </span>
                  <p className="placeholder-text">{post.title}</p>
                </div>
              </div>
            </div>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="h2 mb-2">{post.title}</h1>
                  <div className="d-flex gap-2 mb-2">
                    {post.isPublic ? (
                      <Badge bg="success">Public</Badge>
                    ) : (
                      <Badge bg="secondary">Private</Badge>
                    )}
                  </div>
                  <div className="text-muted">
                    <small>
                      By <strong>{post.authorName}</strong> • {formatDate(post.createdAt)}
                    </small>
                  </div>
                </div>
                
                {isAuthenticated && user && user.id === post.authorId && (
                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/edit-post/${post.id}`}
                      variant="outline-secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDeletePost}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {post.metaDescription && (
                <div className="mb-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">📝 Summary</h6>
                  <p className="mb-0 text-muted">{post.metaDescription}</p>
                </div>
              )}

              <hr />

              <div className="post-content">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>

              {post.updatedAt !== post.createdAt && (
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    Last updated: {formatDate(post.updatedAt)}
                  </small>
                </div>
              )}

              <div className="mt-4">
                <Button as={Link} to="/home" variant="outline-primary">
                  ← Back to Posts
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetail; 