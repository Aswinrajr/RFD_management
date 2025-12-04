const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

// Create RFP from natural language
exports.createRFP = async (req, res) => {
  try {
    const { naturalLanguageInput } = req.body;

    if (!naturalLanguageInput) {
      return res.status(400).json({ 
        success: false, 
        message: 'Natural language input is required' 
      });
    }

    // Parse natural language to structured RFP using AI
    const parsedRFP = await aiService.parseRFPFromNaturalLanguage(naturalLanguageInput);

    // Create RFP in database
    const rfp = await RFP.create({
      ...parsedRFP,
      rawInput: naturalLanguageInput,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'RFP created successfully',
      data: rfp
    });
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create RFP',
      error: error.message
    });
  }
};

// Get all RFPs
exports.getAllRFPs = async (req, res) => {
  try {
    const rfps = await RFP.find()
      .populate('sentToVendors.vendorId', 'name email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rfps.length,
      data: rfps
    });
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFPs',
      error: error.message
    });
  }
};

// Get single RFP by ID
exports.getRFPById = async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id)
      .populate('sentToVendors.vendorId', 'name email company');

    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rfp
    });
  } catch (error) {
    console.error('Error fetching RFP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFP',
      error: error.message
    });
  }
};

// Send RFP to selected vendors
exports.sendRFPToVendors = async (req, res) => {
  try {
    const { rfpId, vendorIds } = req.body;

    if (!rfpId || !vendorIds || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'RFP ID and vendor IDs are required'
      });
    }

    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No vendors found'
      });
    }

    const emailResults = [];
    const sentToVendors = [];

    // Send email to each vendor
    for (const vendor of vendors) {
      try {
        await emailService.sendRFPEmail(vendor.email, vendor.name, rfp);
        
        emailResults.push({
          vendorId: vendor._id,
          vendorName: vendor.name,
          email: vendor.email,
          status: 'sent',
          sentAt: new Date()
        });

        sentToVendors.push({
          vendorId: vendor._id,
          sentAt: new Date()
        });
      } catch (error) {
        emailResults.push({
          vendorId: vendor._id,
          vendorName: vendor.name,
          email: vendor.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update RFP with sent vendors
    rfp.sentToVendors = [...rfp.sentToVendors, ...sentToVendors];
    rfp.status = 'sent';
    await rfp.save();

    res.status(200).json({
      success: true,
      message: 'RFP sent to vendors',
      data: {
        rfpId: rfp._id,
        emailResults
      }
    });
  } catch (error) {
    console.error('Error sending RFP to vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send RFP to vendors',
      error: error.message
    });
  }
};

// Update RFP
exports.updateRFP = async (req, res) => {
  try {
    const rfp = await RFP.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'RFP updated successfully',
      data: rfp
    });
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update RFP',
      error: error.message
    });
  }
};

// Delete RFP
exports.deleteRFP = async (req, res) => {
  try {
    const rfp = await RFP.findByIdAndDelete(req.params.id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'RFP deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete RFP',
      error: error.message
    });
  }
};
