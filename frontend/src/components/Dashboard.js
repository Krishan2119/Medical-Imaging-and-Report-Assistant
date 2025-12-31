import React, { useState, useEffect } from 'react';
import { patientsAPI, imagesAPI, reportsAPI } from '../Api.js';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    patients: 0,
    images: 0,
    reports: 0,
    analyses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, use mock data since backend is simplified
      setStats({
        patients: 12,
        images: 28,
        reports: 15,
        analyses: 20
      });
      
      setRecentActivity([
        {
          id: 1,
          type: 'analysis',
          description: 'AI analysis completed for Chest X-ray',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          id: 2,
          type: 'patient',
          description: 'New patient record created',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          id: 3,
          type: 'report',
          description: 'Medical report finalized',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        }
      ]);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'analysis':
        return '🔬';
      case 'patient':
        return '👥';
      case 'report':
        return '📄';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user.first_name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your medical imaging activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded mr-4">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.patients}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded mr-4">🖼️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded mr-4">📄</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reports}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded mr-4">🔬</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Analyses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.analyses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary">
            ➕ Add Patient
          </button>
          <button className="btn btn-success">
            🖼️ Upload Image
          </button>
          <button className="btn btn-secondary">
            🔬 Start Analysis
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
          ))}
          
          {recentActivity.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
