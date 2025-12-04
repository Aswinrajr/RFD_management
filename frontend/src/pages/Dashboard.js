import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfpAPI, proposalAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

function Dashboard() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRFPs: 0,
    sentRFPs: 0,
    inReview: 0,
    completed: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRFPs();
    startEmailListener();
  }, []);

  const fetchRFPs = async () => {
    try {
      const response = await rfpAPI.getAll();
      const rfpData = response.data.data;
      setRfps(rfpData);

      // Calculate stats
      const stats = {
        totalRFPs: rfpData.length,
        sentRFPs: rfpData.filter(rfp => rfp.status === 'sent').length,
        inReview: rfpData.filter(rfp => rfp.status === 'in-review').length,
        completed: rfpData.filter(rfp => rfp.status === 'completed').length
      };
      setStats(stats);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      toast.error('Failed to fetch RFPs');
      setLoading(false);
    }
  };

  const startEmailListener = async () => {
    try {
      await proposalAPI.startEmailListener();
      console.log('Email listener started');
    } catch (error) {
      console.error('Error starting email listener:', error);
    }
  };

  const checkNewEmails = async () => {
    try {
      toast.info('Checking for new emails...');
      await proposalAPI.checkNewEmails();
      toast.success('Email check completed');
      fetchRFPs(); // Refresh data
    } catch (error) {
      console.error('Error checking emails:', error);
      toast.error('Failed to check emails');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'status-badge status-draft';
      case 'sent':
        return 'status-badge status-sent';
      case 'in-review':
        return 'status-badge status-review';
      case 'completed':
        return 'status-badge status-completed';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="header-actions">
          <button onClick={checkNewEmails} className="btn btn-secondary">
            📧 Check New Emails
          </button>
          <button onClick={() => navigate('/create-rfp')} className="btn btn-primary">
            ➕ Create New RFP
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalRFPs}</h3>
            <p>Total RFPs</p>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <h3>{stats.sentRFPs}</h3>
            <p>Sent to Vendors</p>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <h3>{stats.inReview}</h3>
            <p>In Review</p>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* RFPs List */}
      <div className="rfps-section">
        <h2>Recent RFPs</h2>
        {rfps.length === 0 ? (
          <div className="empty-state">
            <p>📭 No RFPs yet. Create your first RFP to get started!</p>
            <button onClick={() => navigate('/create-rfp')} className="btn btn-primary">
              Create RFP
            </button>
          </div>
        ) : (
          <div className="rfps-list">
            {rfps.map(rfp => (
              <div 
                key={rfp._id} 
                className="rfp-card"
                onClick={() => navigate(`/rfp/${rfp._id}`)}
              >
                <div className="rfp-card-header">
                  <h3>{rfp.title}</h3>
                  <span className={getStatusBadgeClass(rfp.status)}>
                    {rfp.status}
                  </span>
                </div>
                <p className="rfp-description">{rfp.description}</p>
                <div className="rfp-card-footer">
                  <div className="rfp-meta">
                    <span>💰 {rfp.budget.currency} {rfp.budget.amount.toLocaleString()}</span>
                    <span>📅 {formatDate(rfp.createdAt)}</span>
                  </div>
                  <div className="rfp-vendors">
                    {rfp.sentToVendors.length > 0 && (
                      <span>📤 Sent to {rfp.sentToVendors.length} vendor(s)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
