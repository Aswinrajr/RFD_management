const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

// Proposal routes
router.post('/', proposalController.createProposal);
router.get('/rfp/:rfpId', proposalController.getProposalsByRFP);
router.get('/compare/:rfpId', proposalController.compareProposals);
router.get('/:id', proposalController.getProposalById);
router.put('/:id/status', proposalController.updateProposalStatus);

// Email routes
router.post('/email/start-listener', proposalController.startEmailListener);
router.post('/email/check', proposalController.checkNewEmails);

module.exports = router;
