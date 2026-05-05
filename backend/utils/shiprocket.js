const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let authToken = null;
let tokenExpiry = null;

const getAuthToken = async () => {
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
        return authToken;
    }

    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD?.trim();

    if (!email || !password) {
        throw new Error('Shiprocket credentials missing in .env');
    }

    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        authToken = response.data.token;
        tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
        return authToken;
    } catch (error) {
        console.error('Shiprocket Auth Error:', error.response?.data || error.message);
        throw error;
    }
};

const shiprocketRequest = async (method, endpoint, data = null, params = null) => {
    const token = await getAuthToken();
    try {
        const response = await axios({
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: { 'Authorization': `Bearer ${token}` },
            data,
            params
        });
        return response.data;
    } catch (error) {
        console.error(`Shiprocket Error [${endpoint}]:`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    getAuthToken,
    getShiprocketPickupLocations: () => shiprocketRequest('GET', '/settings/company/pickup'),
    
    addShiprocketPickupLocation: async (details) => {
        // Storing address exactly as provided in DB as requested
        const payload = {
            pickup_location: details.location_name,
            name: details.location_name,
            contact_person: details.contact_name || "Warehouse Manager",
            email: details.email || process.env.SHIPROCKET_EMAIL,
            phone: details.contact_phone,
            address: details.address_line_1, // Exact address from DB
            address_2: details.address2 || "",
            city: details.city,
            state: details.state,
            country: details.country || "India",
            pin_code: details.pincode
        };
        return shiprocketRequest('POST', '/settings/company/addpickup', payload);
    },

    createShiprocketOrder: (orderData) => shiprocketRequest('POST', '/orders/create/adhoc', orderData),
    getShiprocketTracking: (awbCode) => shiprocketRequest('GET', `/courier/track/awb/${awbCode}`),
    getShiprocketServiceability: (params) => shiprocketRequest('GET', '/courier/serviceability', null, params),
    assignShiprocketAWB: (payload) => shiprocketRequest('POST', '/courier/assign/awb', payload),
    generateShiprocketPickup: (shipmentIds) => shiprocketRequest('POST', '/courier/generate/pickup', { shipment_id: shipmentIds }),
    cancelShiprocketOrder: (srOrderIds) => shiprocketRequest('POST', '/orders/cancel', { ids: srOrderIds }),
    createShiprocketReturn: (returnData) => shiprocketRequest('POST', '/orders/create/return', returnData)
};
