import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <div className="landing-page">
      <div className="container">
        <div className="landing-content">
          <h1 className="landing-title">Welcome to Blog Platform</h1>
          <p className="landing-subtitle">
            Create, manage, and share your blog posts with AI-powered assistance. 
            Join our community of writers and start your blogging journey today.
          </p>
          
          <div className="landing-features">
            <div className="feature-card">
              <span className="feature-icon">✍️</span>
              <h3 className="feature-title">Create Posts</h3>
              <p className="feature-description">
                Write and publish your own blog posts with our intuitive editor.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h3 className="feature-title">AI Generation</h3>
              <p className="feature-description">
                Generate blog posts using AI with custom master prompts.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔧</span>
              <h3 className="feature-title">Manage Prompts</h3>
              <p className="feature-description">
                Create and manage master prompts for consistent AI generation.
              </p>
            </div>
          </div>
          
          <div className="landing-actions">
            <Button as={Link} to="/register" variant="primary" size="lg">
              Get Started
            </Button>
            <Button as={Link} to="/login" variant="outline-primary" size="lg">
              Sign In
            </Button>
          </div>
          
          <Alert variant="info" className="mt-4">
            <strong>Note:</strong> You need to be logged in to view blogs, prompts, and access all features.
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 