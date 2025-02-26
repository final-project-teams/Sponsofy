const express = require('express');
const router = express.Router();
const { searchCompanies, searchContentCreators } = require('../controller/searchController');

// Search routes
router.get('/companies', searchCompanies);
router.get('/content-creators', searchContentCreators);

module.exports = router;