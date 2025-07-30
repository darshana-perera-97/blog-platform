import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { blogAPI } from '../services/api';
import config from '../config';
import { BlogPostSEO, LoadingSEO, ErrorSEO } from './SEO';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await blogAPI.getPost(id);
      const postData = response.data;
      
      // Check if the post belongs to the configured user AND is published
      if (postData.authorId !== config.user.id || postData.isPublic !== true) {
        setError('Post not found or access denied');
        setLoading(false);
        return;
      }
      
      setPost(postData);
    } catch (err) {
      setError('Failed to load post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
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
      <>
        <LoadingSEO config={config} />
        <Container className="py-5">
          <div className="loading-container">
            <Spinner animation="border" role="status" size="lg">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading post...</p>
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
              <h4>Error Loading Post</h4>
              <p>{error}</p>
              <Button as={Link} to="/" variant="outline-primary" className="mt-3">
                Back to Blog List
              </Button>
            </Alert>
          </div>
        </Container>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <ErrorSEO config={config} errorType="notFound" />
        <Container className="py-5">
          <div className="error-container">
            <Alert variant="warning">
              <h4>Post Not Found</h4>
              <p>The requested post could not be found.</p>
              <Button as={Link} to="/" variant="outline-primary" className="mt-3">
                Back to Blog List
              </Button>
            </Alert>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <BlogPostSEO post={post} config={config} />
      
      <Container className="py-4">
        {/* Back Button */}
        <div className="back-button">
          <Button as={Link} to="/" variant="outline-primary" size="sm">
            ← Back to Blog List
          </Button>
        </div>

        {/* Post Content */}
        <div className="post-content">
          {/* Post Image */}
          <div className="post-image-container mb-4">
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
          
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <p>
                By <strong>{post.authorName}</strong> • {formatDate(post.createdAt)}
              </p>
              {post.metaDescription && (
                <p className="lead">{post.metaDescription}</p>
              )}
            </div>
          </header>

          <div className="post-body">
            <div className="content">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Post Footer */}
          <footer className="post-footer">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-0">
                  Published on {formatDate(post.createdAt)}
                </p>
                {post.updatedAt !== post.createdAt && (
                  <p className="text-muted small mb-0">
                    Last updated on {formatDate(post.updatedAt)}
                  </p>
                )}
              </div>
              <div className="d-flex gap-2">
                {post.generatedFrom && (
                  <Badge bg="info">AI Generated</Badge>
                )}
                <Badge bg="success">Public</Badge>
              </div>
            </div>
          </footer>
        </div>
      </Container>
    </>
  );
};

export default PostDetail; 