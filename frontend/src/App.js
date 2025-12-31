import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI, patientsAPI, imagesAPI, analysisAPI, healthAPI } from './Api.js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import ImageAnalysis from './components/ImageAnalysis';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { access_token, user } = response.data.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const checkBackendHealth = async () => {
    try {
      await healthAPI.check();
      return true;
    } catch (err) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Medical Imaging Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="flex items-center">
              <h1 className="header-title">Medical Imaging Assistant</h1>
            </div>
            
            <div className="header-user">
              <div className="text-sm text-gray-600">
                <span>{user.first_name} {user.last_name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container py-3">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2 mt-0.5 text-sm">⚠️</div>
              <div className="text-sm text-yellow-800">
                <strong>Educational Use Only:</strong> This application is designed for educational and training purposes. 
                All AI-generated analyses must be reviewed and validated by qualified medical professionals. 
                Do not use for actual patient diagnosis.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b">
          <div className="container">
            <nav className="nav py-2">
              <a href="/" className="nav-link">Dashboard</a>
              <a href="/patients" className="nav-link">Patients</a>
              <a href="/analysis" className="nav-link">Image Analysis</a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="container py-6">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/patients" element={<PatientManagement user={user} />} />
            <Route path="/analysis" element={<ImageAnalysis user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
