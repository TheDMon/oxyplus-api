// import dependencies and initialize the express router
const express = require('express');
const RequstController = require('../controllers/request-controller');

const router = express.Router();

// define routes
router.post('/create', RequstController.createRequest);
router.post('/update', RequstController.updateRequest);
router.get('/active/:user_id', RequstController.hasActiveRequest);
router.get('/list/:status', RequstController.getRequestsByStatus);
router.get('/submitted-by-me/:userId', RequstController.findMyRequests);
router.get('/assigned-to-me/:userId', RequstController.findAssignedRequests);

module.exports = router;
