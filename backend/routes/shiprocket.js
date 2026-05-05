const express = require('express');
const router = express.Router();
const shiprocket = require('../utils/shiprocket');
const shipmentController = require('../controllers/shipmentController');

// Check Shiprocket Auth
router.get('/shiprocket/auth-check', async (req, res) => {
    try {
        await shiprocket.getAuthToken();
        res.json({ success: true, message: "Shiprocket authenticated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Pickup Locations
router.get('/shiprocket/pickup-locations', async (req, res) => {
    try {
        const data = await shiprocket.getShiprocketPickupLocations();
        res.json({ success: true, locations: data.data.shipping_address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Initiate Shipment (Auto-Pilot)
router.post('/shiprocket/initiate/:orderId', shipmentController.initiateShipment);

// Webhook for tracking updates
router.post('/shiprocket/webhook', shipmentController.handleShiprocketWebhook);

// Individual Tracking
router.get('/shiprocket/track/:awb', async (req, res) => {
    try {
        const data = await shiprocket.getShiprocketTracking(req.params.awb);
        res.json({ success: true, tracking: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
