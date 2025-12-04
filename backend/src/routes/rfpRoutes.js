const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

// RFP routes
router.post('/', rfpController.createRFP);
router.get('/', rfpController.getAllRFPs);
router.get('/:id', rfpController.getRFPById);
router.put('/:id', rfpController.updateRFP);
router.delete('/:id', rfpController.deleteRFP);
router.post('/send', rfpController.sendRFPToVendors);

module.exports = router;
