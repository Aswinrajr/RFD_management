const Proposal = require('../models/Proposal');
const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

// Process incoming vendor response email
exports.processVendorResponse = async (emailData) => {
  try {
    console.log('Processing vendor response email from:', emailData.from);

    // Find vendor by email
    const vendor = await Vendor.findOne({ email: emailData.from });
    if (!vendor) {
      console.log('Vendor not found for email:', emailData.from);
      return;
    }

    // Try to extract RFP ID from email subject or content
    // This is a simple implementation - in production, you might want to use a more robust method
    const rfpMatch = emailData.subject.match(/RFP:\s*(.+?)(?:\s|$)/i);
    if (!rfpMatch) {
      console.log('Could not extract RFP title from email subject');
      return;
    }

    const rfpTitle = rfpMatch[1].trim();
    const rfp = await RFP.findOne({ title: { $regex: new RegExp(rfpTitle, 'i') } });
    
    if (!rfp) {
      console.log('RFP not found for title:', rfpTitle);
      return;
    }

    // Parse vendor response using AI
    const parsedProposal = await aiService.parseVendorResponse(
      emailData.text || emailData.html,
      {
        title: rfp.title,
        description: rfp.description,
        requirements: rfp.requirements,
        budget: rfp.budget
      }
    );

    // Create or update proposal
    const existingProposal = await Proposal.findOne({
      rfpId: rfp._id,
      vendorId: vendor._id
    });

    if (existingProposal) {
      // Update existing proposal
      existingProposal.pricing = parsedProposal.pricing;
      existingProposal.deliveryTimeline = parsedProposal.deliveryTimeline;
      existingProposal.paymentTerms = parsedProposal.paymentTerms;
      existingProposal.warranty = parsedProposal.warranty;
      existingProposal.additionalTerms = parsedProposal.additionalTerms;
      existingProposal.complianceScore = parsedProposal.complianceScore;
      existingProposal.aiSummary = parsedProposal.summary;
      existingProposal.rawEmailContent = emailData.text || emailData.html;
      existingProposal.emailReceivedAt = emailData.date;
      
      await existingProposal.save();
      console.log('Updated existing proposal for vendor:', vendor.name);
    } else {
      // Create new proposal
      const proposal = await Proposal.create({
        rfpId: rfp._id,
        vendorId: vendor._id,
        pricing: parsedProposal.pricing,
        deliveryTimeline: parsedProposal.deliveryTimeline,
        paymentTerms: parsedProposal.paymentTerms,
        warranty: parsedProposal.warranty,
        additionalTerms: parsedProposal.additionalTerms,
        complianceScore: parsedProposal.complianceScore,
        aiSummary: parsedProposal.summary,
        rawEmailContent: emailData.text || emailData.html,
        emailReceivedAt: emailData.date,
        status: 'received'
      });
      console.log('Created new proposal for vendor:', vendor.name);
    }

    // Update RFP status
    if (rfp.status === 'sent') {
      rfp.status = 'in-review';
      await rfp.save();
    }

  } catch (error) {
    console.error('Error processing vendor response:', error);
  }
};

// Manually create a proposal
exports.createProposal = async (req, res) => {
  try {
    const proposal = await Proposal.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create proposal',
      error: error.message
    });
  }
};

// Get all proposals for an RFP
exports.getProposalsByRFP = async (req, res) => {
  try {
    const { rfpId } = req.params;

    const proposals = await Proposal.find({ rfpId })
      .populate('vendorId', 'name email company specialization')
      .populate('rfpId', 'title description budget')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals',
      error: error.message
    });
  }
};

// Compare proposals and get AI recommendation
exports.compareProposals = async (req, res) => {
  try {
    const { rfpId } = req.params;

    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    const proposals = await Proposal.find({ rfpId })
      .populate('vendorId', 'name email company specialization');

    if (proposals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No proposals found for this RFP'
      });
    }

    // Get AI comparison and recommendation
    const comparison = await aiService.compareProposalsAndRecommend(
      {
        title: rfp.title,
        description: rfp.description,
        budget: rfp.budget,
        requirements: rfp.requirements,
        deliveryTimeline: rfp.deliveryTimeline
      },
      proposals
    );

    // Update proposals with AI scores
    for (const vendorScore of comparison.vendorScores) {
      const proposal = proposals.find(p => p.vendorId.name === vendorScore.vendorName);
      if (proposal) {
        proposal.aiScore = vendorScore.overallScore;
        proposal.aiRecommendation = JSON.stringify({
          priceScore: vendorScore.priceScore,
          timelineScore: vendorScore.timelineScore,
          complianceScore: vendorScore.complianceScore,
          pros: vendorScore.pros,
          cons: vendorScore.cons
        });
        await proposal.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        rfp: {
          id: rfp._id,
          title: rfp.title,
          budget: rfp.budget
        },
        proposals: proposals,
        aiComparison: comparison
      }
    });
  } catch (error) {
    console.error('Error comparing proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare proposals',
      error: error.message
    });
  }
};

// Get single proposal by ID
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('vendorId', 'name email company specialization')
      .populate('rfpId', 'title description budget requirements');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal',
      error: error.message
    });
  }
};

// Update proposal status
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proposal status updated successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update proposal status',
      error: error.message
    });
  }
};

// Start email listener for incoming proposals
exports.startEmailListener = async (req, res) => {
  try {
    emailService.startEmailListener(exports.processVendorResponse);

    res.status(200).json({
      success: true,
      message: 'Email listener started successfully'
    });
  } catch (error) {
    console.error('Error starting email listener:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start email listener',
      error: error.message
    });
  }
};

// Manually check for new emails
exports.checkNewEmails = async (req, res) => {
  try {
    const emails = await emailService.fetchUnreadEmails(exports.processVendorResponse);

    res.status(200).json({
      success: true,
      message: 'Checked for new emails',
      count: emails.length
    });
  } catch (error) {
    console.error('Error checking emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check emails',
      error: error.message
    });
  }
};
