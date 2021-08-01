// import dependencies and initialize the express router
const express = require('express');
const { authenticateToken } = require('../controllers/auth-controller');
const OxyplusController = require('../controllers/oxyplus-controller');

const router = express.Router();

// define routes
router.post('/profile/create', OxyplusController.createUser);
router.post('/profile/update', OxyplusController.updateUser);
router.get('/donors/near-by/:userId', OxyplusController.findNearByDonors);
router.get(
  '/list/:type',
  //authenticateToken,
  OxyplusController.getDocumentsByType,
);
router.get('/user/:email', OxyplusController.getUserByEmail);

module.exports = router;
