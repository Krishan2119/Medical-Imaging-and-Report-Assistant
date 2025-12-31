import React, { useState } from 'react';

const Login = ({ onLogin, error }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onLogin(credentials);
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Medical Imaging Assistant</h1>
          <p className="text-sm text-gray-600">
            Sign in to your educational account
          </p>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <div className="flex">
                  <div className="text-red-400 mr-2">⚠️</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="alert alert-info">
          <h3 className="text-sm font-medium mb-2">Demo Credentials</h3>
          <p className="text-xs">
            For demonstration purposes, you can use any email and password combination.
          </p>
        </div>
        
        <div className="alert alert-warning">
          <p className="text-xs">
            <strong>Educational Use Only:</strong> This platform is designed for medical education and training. 
            All AI analyses require human review by qualified medical professionals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
