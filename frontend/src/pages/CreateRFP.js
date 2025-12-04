import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfpAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/CreateRFP.css';

function CreateRFP() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedRFP, setParsedRFP] = useState(null);
  const navigate = useNavigate();

  const exampleInput = `I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 512GB SSD, and 15 monitors 27-inch 4K. Payment terms should be net 30, and we need at least 1 year warranty.`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!naturalLanguageInput.trim()) {
      toast.error('Please enter your requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await rfpAPI.create({ naturalLanguageInput });
      const createdRFP = response.data.data;
      
      setParsedRFP(createdRFP);
      toast.success('RFP created successfully! 🎉');
      
      // Navigate to RFP details after 2 seconds
      setTimeout(() => {
        navigate(`/rfp/${createdRFP._id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating RFP:', error);
      toast.error('Failed to create RFP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useExampleInput = () => {
    setNaturalLanguageInput(exampleInput);
  };

  return (
    <div className="create-rfp">
      <div className="page-header">
        <h1>✨ Create New RFP</h1>
        <p>Describe your procurement needs in natural language, and our AI will structure it for you</p>
      </div>

      {!parsedRFP ? (
        <div className="rfp-form-container">
          <form onSubmit={handleSubmit} className="rfp-form">
            <div className="form-group">
              <label htmlFor="requirements">
                📝 Describe Your Requirements
                <span className="label-hint">Tell us what you need in plain English</span>
              </label>
              <textarea
                id="requirements"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="Example: I need to procure 50 laptops with 16GB RAM, Intel i7 processor, and 512GB SSD. Budget is $75,000. Need delivery in 45 days. Payment terms: Net 30. Warranty: 2 years minimum."
                rows="10"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={useExampleInput}
                className="btn btn-secondary"
                disabled={loading}
              >
                📋 Use Example
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Processing with AI...
                  </>
                ) : (
                  <>
                    🚀 Create RFP
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="tips-section">
            <h3>💡 Tips for Better Results</h3>
            <ul>
              <li>Be specific about quantities and specifications</li>
              <li>Mention your budget clearly</li>
              <li>Include delivery timeline requirements</li>
              <li>Specify payment terms if you have preferences</li>
              <li>Add any warranty or compliance requirements</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rfp-preview">
          <div className="success-message">
            <h2>✅ RFP Created Successfully!</h2>
            <p>Your requirements have been structured and saved. Redirecting to RFP details...</p>
          </div>

          <div className="parsed-rfp">
            <h3>Structured RFP Preview</h3>
            
            <div className="rfp-field">
              <strong>Title:</strong>
              <p>{parsedRFP.title}</p>
            </div>

            <div className="rfp-field">
              <strong>Description:</strong>
              <p>{parsedRFP.description}</p>
            </div>

            <div className="rfp-field">
              <strong>Budget:</strong>
              <p>{parsedRFP.budget.currency} {parsedRFP.budget.amount.toLocaleString()}</p>
            </div>

            <div className="rfp-field">
              <strong>Requirements:</strong>
              <ul>
                {parsedRFP.requirements.map((req, index) => (
                  <li key={index}>
                    <strong>{req.item}</strong> - Qty: {req.quantity} - {req.specifications}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rfp-field">
              <strong>Delivery Timeline:</strong>
              <p>{parsedRFP.deliveryTimeline.value} {parsedRFP.deliveryTimeline.unit}</p>
            </div>

            <div className="rfp-field">
              <strong>Payment Terms:</strong>
              <p>{parsedRFP.paymentTerms}</p>
            </div>

            {parsedRFP.warranty && (
              <div className="rfp-field">
                <strong>Warranty:</strong>
                <p>{parsedRFP.warranty}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateRFP;
