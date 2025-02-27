const express = require('express');
const router = express.Router();
    const { searchCompanies, searchContentCreators ,searchContracts, searchContractsByRank} = require('../controller/searchController');

// Search routes
router.get('/companies', searchCompanies);
router.get('/content-creators', searchContentCreators);
router.get('/contracts', searchContracts);
router.get('/contracts/rank', searchContractsByRank);
module.exports = router;