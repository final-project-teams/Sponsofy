const axios = require('axios');

/**
 * Make an external API call
 * @param {string} method - HTTP method (e.g., 'GET', 'POST')
 * @param {string} url - API endpoint URL
 * @param {object} data - Request body (optional)
 * @param {object} headers - Request headers (optional)
 */
const makeApiCall = async (method, url, data = {}, headers = {}) => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers,
        });
        return response.data;
    } catch (error) {
        console.error('Error making API call:', error);
        throw error;
    }
};

module.exports = { makeApiCall };