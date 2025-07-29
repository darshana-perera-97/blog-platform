import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar expand="lg" className="navbar-light">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
          ✨ Blog Platform
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              📝 {isAuthenticated ? 'My Posts' : 'Posts'}
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/prompts" 
              className={isActive('/prompts') ? 'active' : ''}
            >
              🤖 {isAuthenticated ? 'My Prompts' : 'Prompts'}
            </Nav.Link>
            
            {isAuthenticated && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/profile" 
                  className={isActive('/profile') ? 'active' : ''}
                >
                  👤 Profile
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/ai-generator" 
                  className={isActive('/ai-generator') ? 'active' : ''}
                >
                  🚀 AI Generator
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">
                  Welcome, <span className="fw-medium text-primary">{user?.username}</span>
                </span>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleLogout}
                  className="px-3"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  size="sm"
                  className="px-3"
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  size="sm"
                  className="px-3"
                >
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 