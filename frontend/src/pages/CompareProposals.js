import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proposalAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/CompareProposals.css';

function CompareProposals() {
  const { rfpId } = useParams();
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, [rfpId]);

  const fetchComparison = async () => {
    try {
      const response = await proposalAPI.compare(rfpId);
      setComparisonData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      toast.error('Failed to fetch proposal comparison');
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Analyzing proposals with AI...</p>
      </div>
    );
  }

  if (!comparisonData || !comparisonData.proposals || comparisonData.proposals.length === 0) {
    return (
      <div className="error-container">
        <p>No proposals found for comparison</p>
        <button onClick={() => navigate(`/rfp/${rfpId}`)} className="btn btn-primary">
          Back to RFP
        </button>
      </div>
    );
  }

  const { rfp, proposals, aiComparison } = comparisonData;

  return (
    <div className="compare-proposals">
      <div className="page-header">
        <div>
          <button onClick={() => navigate(`/rfp/${rfpId}`)} className="btn-back">
            ← Back to RFP
          </button>
          <h1>📊 Proposal Comparison</h1>
          <p className="rfp-title">{rfp.title}</p>
        </div>
      </div>

      {/* AI Recommendation Section */}
      <div className="recommendation-section">
        <div className="recommendation-card">
          <h2>🤖 AI Recommendation</h2>
          <p className="recommendation-text">{aiComparison.overallRecommendation}</p>
        </div>

        {aiComparison.keyFindings && aiComparison.keyFindings.length > 0 && (
          <div className="findings-card">
            <h3>🔍 Key Findings</h3>
            <ul>
              {aiComparison.keyFindings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>
        )}

        {aiComparison.riskFactors && aiComparison.riskFactors.length > 0 && (
          <div className="risk-card">
            <h3>⚠️ Risk Factors</h3>
            <ul>
              {aiComparison.riskFactors.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Vendor Scores Comparison */}
      <div className="scores-section">
        <h2>📈 Vendor Scores Comparison</h2>
        <div className="scores-grid">
          {aiComparison.vendorScores.map((vendorScore, index) => {
            const proposal = proposals.find(p => p.vendorId.name === vendorScore.vendorName);
            
            return (
              <div key={index} className="vendor-score-card">
                <div className="vendor-score-header">
                  <h3>{vendorScore.vendorName}</h3>
                  <div 
                    className="overall-score"
                    style={{ backgroundColor: getScoreColor(vendorScore.overallScore) }}
                  >
                    <span className="score-value">{vendorScore.overallScore}</span>
                    <span className="score-label">{getScoreLabel(vendorScore.overallScore)}</span>
                  </div>
                </div>

                <div className="score-breakdown">
                  <div className="score-item">
                    <span>💰 Price Score</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${vendorScore.priceScore}%`,
                          backgroundColor: getScoreColor(vendorScore.priceScore)
                        }}
                      />
                      <span className="score-number">{vendorScore.priceScore}</span>
                    </div>
                  </div>

                  <div className="score-item">
                    <span>⏱️ Timeline Score</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${vendorScore.timelineScore}%`,
                          backgroundColor: getScoreColor(vendorScore.timelineScore)
                        }}
                      />
                      <span className="score-number">{vendorScore.timelineScore}</span>
                    </div>
                  </div>

                  <div className="score-item">
                    <span>✅ Compliance Score</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${vendorScore.complianceScore}%`,
                          backgroundColor: getScoreColor(vendorScore.complianceScore)
                        }}
                      />
                      <span className="score-number">{vendorScore.complianceScore}</span>
                    </div>
                  </div>
                </div>

                <div className="pros-cons">
                  <div className="pros">
                    <h4>✅ Pros</h4>
                    <ul>
                      {vendorScore.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="cons">
                    <h4>❌ Cons</h4>
                    <ul>
                      {vendorScore.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {proposal && (
                  <div className="proposal-details">
                    <p><strong>Total Amount:</strong> {proposal.pricing.currency} {proposal.pricing.totalAmount.toLocaleString()}</p>
                    <p><strong>Delivery:</strong> {proposal.deliveryTimeline.value} {proposal.deliveryTimeline.unit}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Proposals Table */}
      <div className="proposals-table-section">
        <h2>📋 Detailed Proposal Comparison</h2>
        <div className="table-container">
          <table className="proposals-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Company</th>
                <th>Total Amount</th>
                <th>Delivery Timeline</th>
                <th>Payment Terms</th>
                <th>Warranty</th>
                <th>AI Summary</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal, index) => (
                <tr key={index}>
                  <td><strong>{proposal.vendorId.name}</strong></td>
                  <td>{proposal.vendorId.company || '-'}</td>
                  <td>
                    <strong>{proposal.pricing.currency} {proposal.pricing.totalAmount.toLocaleString()}</strong>
                  </td>
                  <td>
                    {proposal.deliveryTimeline.value} {proposal.deliveryTimeline.unit}
                  </td>
                  <td>{proposal.paymentTerms || '-'}</td>
                  <td>{proposal.warranty || '-'}</td>
                  <td className="summary-cell">{proposal.aiSummary || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="breakdown-section">
        <h2>💵 Price Breakdown</h2>
        <div className="breakdown-grid">
          {proposals.map((proposal, index) => (
            <div key={index} className="breakdown-card">
              <h3>{proposal.vendorId.name}</h3>
              <div className="total-amount">
                {proposal.pricing.currency} {proposal.pricing.totalAmount.toLocaleString()}
              </div>
              {proposal.pricing.breakdown && proposal.pricing.breakdown.length > 0 && (
                <div className="breakdown-items">
                  {proposal.pricing.breakdown.map((item, i) => (
                    <div key={i} className="breakdown-item">
                      <span>{item.item}</span>
                      <span>
                        {item.unitPrice !== null && item.quantity > 1 ? (
                          <>
                            {item.quantity} × {proposal.pricing.currency} {item.unitPrice.toLocaleString()} = 
                            <strong> {proposal.pricing.currency} {item.totalPrice.toLocaleString()}</strong>
                          </>
                        ) : (
                          <strong>{proposal.pricing.currency} {item.totalPrice.toLocaleString()}</strong>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompareProposals;