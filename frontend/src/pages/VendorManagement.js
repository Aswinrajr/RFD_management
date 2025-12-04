import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/VendorManagement.css';

function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    specialization: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      if (editingVendor) {
        await vendorAPI.update(editingVendor._id, formData);
        toast.success('Vendor updated successfully');
      } else {
        await vendorAPI.create(formData);
        toast.success('Vendor created successfully');
      }

      resetForm();
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || '',
      company: vendor.company || '',
      address: vendor.address || '',
      specialization: vendor.specialization || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorAPI.delete(id);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      specialization: ''
    });
    setEditingVendor(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="vendor-management">
      <div className="page-header">
        <h1>👥 Vendor Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          {showForm ? '✕ Cancel' : '➕ Add Vendor'}
        </button>
      </div>

      {showForm && (
        <div className="vendor-form-container">
          <h2>{editingVendor ? '✏️ Edit Vendor' : '➕ Add New Vendor'}</h2>
          <form onSubmit={handleSubmit} className="vendor-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., IT Equipment, Office Supplies, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVendor ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="vendors-section">
        <h2>Vendor List ({vendors.length})</h2>
        {vendors.length === 0 ? (
          <div className="empty-state">
            <p>📭 No vendors yet. Add your first vendor to get started!</p>
          </div>
        ) : (
          <div className="vendors-grid">
            {vendors.map(vendor => (
              <div key={vendor._id} className="vendor-card">
                <div className="vendor-header">
                  <h3>{vendor.name}</h3>
                  <div className="vendor-actions">
                    <button 
                      onClick={() => handleEdit(vendor)}
                      className="btn-icon"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(vendor._id)}
                      className="btn-icon btn-danger"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="vendor-details">
                  {vendor.company && (
                    <p><strong>🏢 Company:</strong> {vendor.company}</p>
                  )}
                  <p><strong>📧 Email:</strong> {vendor.email}</p>
                  {vendor.phone && (
                    <p><strong>📱 Phone:</strong> {vendor.phone}</p>
                  )}
                  {vendor.specialization && (
                    <p><strong>🎯 Specialization:</strong> {vendor.specialization}</p>
                  )}
                  {vendor.address && (
                    <p><strong>📍 Address:</strong> {vendor.address}</p>
                  )}
                </div>

                <div className="vendor-footer">
                  <span className={`status-badge ${vendor.status === 'active' ? 'status-success' : 'status-inactive'}`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorManagement;
