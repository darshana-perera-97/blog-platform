import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import NavigationBar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import EditPost from './components/EditPost';
import Prompts from './components/Prompts';
import CreatePrompt from './components/CreatePrompt';
import PromptDetail from './components/PromptDetail';
import EditPrompt from './components/EditPrompt';
import UserProfile from './components/UserProfile';
import VerifyEmail from './components/VerifyEmail';
import ResendVerification from './components/ResendVerification';
import ProtectedRoute from './components/ProtectedRoute';
import AIBlogGenerator from './components/AIBlogGenerator';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationBar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/post/:id" 
                element={
                  <ProtectedRoute>
                    <PostDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/prompts" 
                element={
                  <ProtectedRoute>
                    <Prompts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/prompt/:id" 
                element={
                  <ProtectedRoute>
                    <PromptDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-post" 
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-post/:id" 
                element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                } 
              />
                              <Route
                  path="/create-prompt"
                  element={
                    <ProtectedRoute>
                      <CreatePrompt />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
              <Route 
                path="/edit-prompt/:id" 
                element={
                  <ProtectedRoute>
                    <EditPrompt />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-generator" 
                element={
                  <ProtectedRoute>
                    <AIBlogGenerator />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
