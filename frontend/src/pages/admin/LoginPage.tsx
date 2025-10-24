import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/admin/employer-approvals');
    } else {
      setError('Invalid admin credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-gray-300">
            Administrator access to Global Skills Bridge
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@gsb.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex">
              <Shield className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-700 font-medium">Demo Admin Credentials:</p>
                <p className="text-blue-600 mt-1">
                  <span className="font-mono">admin@gsb.com</span> / <span className="font-mono">password123</span>
                </p>
                <p className="text-blue-600 mt-1">
                  <span className="font-mono">rtb@rtb.gov.rw</span> / <span className="font-mono">password123</span>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Regular user login
            </Link>
          </div>
        </form>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-300 hover:text-white flex items-center justify-center">
            <Globe className="h-4 w-4 mr-1" />
            Back to Global Skills Bridge
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
