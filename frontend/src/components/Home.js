import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { postsAPI, aiBlogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showQuickGenModal, setShowQuickGenModal] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [publishing, setPublishing] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
    if (isAuthenticated) {
      fetchAvailablePrompts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getAllPosts();
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePrompts = async () => {
    try {
      const response = await aiBlogAPI.getAvailablePrompts();
      setAvailablePrompts(response.data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (err) {
        setError('Failed to delete post');
      }
    }
  };

  const handlePublishToggle = async (postId, currentStatus) => {
    const newStatus = !currentStatus;
    setPublishing(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await postsAPI.publishPost(postId, newStatus);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isPublic: newStatus }
          : post
      ));
      
      // Show success message
      const action = newStatus ? 'published' : 'unpublished';
      alert(`Post ${action} successfully!`);
    } catch (err) {
      setError(`Failed to ${newStatus ? 'publish' : 'unpublish'} post`);
    } finally {
      setPublishing(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleQuickGenerate = async () => {
    if (availablePrompts.length === 0) {
      setError('No master prompts available. Please create a master prompt first.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      // Get a random prompt (or the first one)
      const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
      
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
        // Refresh posts to show the new generated post
        await fetchPosts();
        setShowQuickGenModal(false);
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

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading posts...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold mb-2">
                {isAuthenticated ? 'My Blog Posts' : 'Blog Posts'}
              </h1>
              <p className="text-muted mb-0">
                {isAuthenticated 
                  ? `Welcome back, ${user?.username}! Here are your blog posts.`
                  : 'Discover amazing content from our community.'
                }
              </p>
            </div>
            {isAuthenticated && (
              <div className="d-flex gap-2">
                <Button as={Link} to="/create-post" variant="primary">
                  + Create Post
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => setShowQuickGenModal(true)}
                  disabled={availablePrompts.length === 0}
                >
                  🚀 Quick Generate
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Row>
          <Col className="text-center">
            <Card className="p-5 border-0 shadow-sm">
              <Card.Body>
                <div className="mb-3">
                  <span className="display-4">📝</span>
                </div>
                {isAuthenticated ? (
                  <>
                    <h3 className="mb-3">No posts yet!</h3>
                    <p className="text-muted mb-4">Start creating your first blog post to share your thoughts with the world.</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button as={Link} to="/create-post" variant="primary">
                        Create Your First Post
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => setShowQuickGenModal(true)}
                        disabled={availablePrompts.length === 0}
                      >
                        Generate with AI
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mb-3">No posts available!</h3>
                    <p className="text-muted mb-4">Join our community to start creating and sharing amazing content.</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button as={Link} to="/register" variant="primary">
                        Join Now
                      </Button>
                      <Button as={Link} to="/login" variant="outline-primary">
                        Sign In
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
          {posts.map(post => (
            <Col key={post.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold mb-0 line-clamp-2">
                        {post.title}
                      </h5>
                      <div className="d-flex gap-1">
                        {post.isPublic && (
                          <Badge bg="success" className="fs-6">Public</Badge>
                        )}
                        {!post.isPublic && (
                          <Badge bg="secondary" className="fs-6">Private</Badge>
                        )}
                        {post.generatedFrom && (
                          <Badge bg="info" className="fs-6">AI</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted small mb-2">
                      By <span className="fw-medium">{post.authorName}</span> • {formatDate(post.createdAt)}
                    </p>
                    {post.metaDescription && (
                      <p className="text-muted small line-clamp-3">
                        {post.metaDescription}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex gap-2 mb-2">
                      <Button 
                        as={Link} 
                        to={`/post/${post.id}`} 
                        variant="outline-primary" 
                        size="sm"
                        className="flex-fill"
                      >
                        Read More
                      </Button>
                      {isAuthenticated && post.authorId === user?.id && (
                        <>
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
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Publish/Unpublish Button */}
                    {isAuthenticated && post.authorId === user?.id && (
                      <Button 
                        variant={post.isPublic ? "outline-warning" : "outline-success"}
                        size="sm"
                        className="w-100"
                        onClick={() => handlePublishToggle(post.id, post.isPublic)}
                        disabled={publishing[post.id]}
                      >
                        {publishing[post.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {post.isPublic ? 'Unpublishing...' : 'Publishing...'}
                          </>
                        ) : (
                          <>
                            {post.isPublic ? '🔒 Unpublish' : '🌐 Publish'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Quick Generate Modal */}
      <Modal show={showQuickGenModal} onHide={() => setShowQuickGenModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🚀 Quick Blog Generation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            This will generate a blog post using one of your master prompts and a random topic. 
            The post will be saved as private by default.
          </p>
          <Alert variant="info" className="mb-0">
            <strong>Available Prompts:</strong> {availablePrompts.length}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuickGenModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleQuickGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

export default Home; 