import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfpAPI, vendorAPI, proposalAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/RFPDetails.css';

function RFPDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVendorSelection, setShowVendorSelection] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchRFPDetails();
    fetchVendors();
    fetchProposals();
  }, [id]);

  const fetchRFPDetails = async () => {
    try {
      const response = await rfpAPI.getById(id);
      setRfp(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching RFP:', error);
      toast.error('Failed to fetch RFP details');
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await proposalAPI.getByRFP(id);
      setProposals(response.data.data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleVendorToggle = (vendorId) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      toast.error('Please select at least one vendor');
      return;
    }

    setSending(true);

    try {
      await rfpAPI.sendToVendors({
        rfpId: id,
        vendorIds: selectedVendors
      });

      toast.success(`RFP sent to ${selectedVendors.length} vendor(s) successfully! 📧`);
      setShowVendorSelection(false);
      setSelectedVendors([]);
      fetchRFPDetails();
    } catch (error) {
      console.error('Error sending RFP:', error);
      toast.error('Failed to send RFP to vendors');
    } finally {
      setSending(false);
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading RFP details...</p>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="error-container">
        <p>RFP not found</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="rfp-details">
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back
          </button>
          <h1>{rfp.title}</h1>
          <span className={`status-badge status-${rfp.status}`}>
            {rfp.status}
          </span>
        </div>
        <div className="header-actions">
          {proposals.length > 0 && (
            <button 
              onClick={() => navigate(`/compare/${rfp._id}`)}
              className="btn btn-success"
            >
              📊 Compare Proposals ({proposals.length})
            </button>
          )}
          <button 
            onClick={() => setShowVendorSelection(true)}
            className="btn btn-primary"
            disabled={rfp.status === 'completed'}
          >
            📤 Send to Vendors
          </button>
        </div>
      </div>

      <div className="rfp-content">
        <div className="rfp-section">
          <h2>📝 Description</h2>
          <p>{rfp.description}</p>
        </div>

        <div className="rfp-grid">
          <div className="rfp-section">
            <h2>💰 Budget</h2>
            <p className="budget-amount">
              {rfp.budget.currency} {rfp.budget.amount.toLocaleString()}
            </p>
          </div>

          <div className="rfp-section">
            <h2>📅 Delivery Timeline</h2>
            <p>{rfp.deliveryTimeline.value} {rfp.deliveryTimeline.unit}</p>
          </div>

          <div className="rfp-section">
            <h2>💳 Payment Terms</h2>
            <p>{rfp.paymentTerms}</p>
          </div>

          {rfp.warranty && (
            <div className="rfp-section">
              <h2>🛡️ Warranty</h2>
              <p>{rfp.warranty}</p>
            </div>
          )}
        </div>

        <div className="rfp-section">
          <h2>🛒 Requirements</h2>
          <div className="requirements-list">
            {rfp.requirements.map((req, index) => (
              <div key={index} className="requirement-item">
                <h4>{req.item}</h4>
                <p><strong>Quantity:</strong> {req.quantity}</p>
                <p><strong>Specifications:</strong> {req.specifications}</p>
              </div>
            ))}
          </div>
        </div>

        {rfp.additionalTerms && (
          <div className="rfp-section">
            <h2>📌 Additional Terms</h2>
            <p>{rfp.additionalTerms}</p>
          </div>
        )}

        {rfp.sentToVendors && rfp.sentToVendors.length > 0 && (
          <div className="rfp-section">
            <h2>📤 Sent to Vendors</h2>
            <div className="sent-vendors-list">
              {rfp.sentToVendors.map((item, index) => (
                <div key={index} className="sent-vendor-item">
                  <span>{item.vendorId?.name || 'Vendor'}</span>
                  <span className="sent-date">{formatDate(item.sentAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {proposals.length > 0 && (
          <div className="rfp-section">
            <h2>📨 Received Proposals ({proposals.length})</h2>
            <div className="proposals-preview">
              {proposals.map((proposal, index) => (
                <div key={index} className="proposal-preview-item">
                  <h4>{proposal.vendorId?.name}</h4>
                  <p><strong>Total:</strong> {proposal.pricing.currency} {proposal.pricing.totalAmount.toLocaleString()}</p>
                  <span className="status-badge status-received">Received</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vendor Selection Modal */}
      {showVendorSelection && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📤 Select Vendors</h2>
              <button 
                onClick={() => setShowVendorSelection(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              {vendors.length === 0 ? (
                <div className="empty-state">
                  <p>No vendors available. Please add vendors first.</p>
                  <button 
                    onClick={() => navigate('/vendors')}
                    className="btn btn-primary"
                  >
                    Add Vendors
                  </button>
                </div>
              ) : (
                <div className="vendor-selection-list">
                  {vendors.map(vendor => (
                    <div key={vendor._id} className="vendor-selection-item">
                      <input
                        type="checkbox"
                        id={`vendor-${vendor._id}`}
                        checked={selectedVendors.includes(vendor._id)}
                        onChange={() => handleVendorToggle(vendor._id)}
                      />
                      <label htmlFor={`vendor-${vendor._id}`}>
                        <div>
                          <strong>{vendor.name}</strong>
                          {vendor.company && <span> - {vendor.company}</span>}
                        </div>
                        <div className="vendor-meta">
                          <span>{vendor.email}</span>
                          {vendor.specialization && (
                            <span> • {vendor.specialization}</span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowVendorSelection(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendRFP}
                className="btn btn-primary"
                disabled={selectedVendors.length === 0 || sending}
              >
                {sending ? (
                  <>
                    <span className="spinner-small"></span>
                    Sending...
                  </>
                ) : (
                  `Send to ${selectedVendors.length} Vendor(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RFPDetails;
