import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import BlogList from './components/BlogList';
import PostDetail from './components/PostDetail';
import config from './config';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="App">
          {/* Header */}
          <header className="header">
            <div className="container">
              <div className="header-content">
                <h1>{config.display.title}</h1>
                <p>{config.display.subtitle}</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<BlogList />} />
              <Route path="/post/:id" element={<PostDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
