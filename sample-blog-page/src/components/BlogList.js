import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import config from '../config';
import { BlogListSEO, LoadingSEO, ErrorSEO } from './SEO';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await blogAPI.getAllPosts();
      // Filter posts for the configured user
      const userPosts = response.data.filter(post => post.authorId === config.user.id);
      setPosts(userPosts);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
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
      <>
        <LoadingSEO config={config} />
        <Container className="py-5">
          <div className="loading-container">
            <Spinner animation="border" role="status" size="lg">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading blog posts...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ErrorSEO config={config} errorType="error" />
        <Container className="py-5">
          <div className="error-container">
            <Alert variant="danger">
              <h4>Error Loading Posts</h4>
              <p>{error}</p>
              <p className="small text-muted">
                Please check if the backend server is running at: {config.backendUrl}
              </p>
            </Alert>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <BlogListSEO config={config} postsCount={posts.length} />
      
      <Container className="py-4">
        {/* User Info */}
        <div className="mb-4">
          <Alert variant="info">
            <h5>📝 Blog Posts by {config.user.username}</h5>
            <p className="mb-0">
              Showing {posts.length} post{posts.length !== 1 ? 's' : ''} from {config.user.email}
            </p>
          </Alert>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <Row>
            <Col className="text-center">
              <Card className="p-5 border-0 shadow-sm">
                <Card.Body>
                  <div className="mb-3">
                    <span className="display-4">📝</span>
                  </div>
                  <h3 className="mb-3">No posts found!</h3>
                  <p className="text-muted mb-0">
                    This user hasn't published any blog posts yet.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            {posts.map(post => (
              <Col key={post.id} xs={12} md={6} lg={4} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <h5 className="card-title fw-bold mb-2 line-clamp-2">
                        {post.title}
                      </h5>
                      <p className="text-muted small mb-2">
                        {formatDate(post.createdAt)}
                      </p>
                      {post.metaDescription && (
                        <p className="text-muted small line-clamp-3">
                          {post.metaDescription}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <Button 
                        as={Link} 
                        to={`/post/${post.id}`} 
                        variant="outline-primary" 
                        size="sm"
                        className="w-100"
                      >
                        Read More
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default BlogList; 