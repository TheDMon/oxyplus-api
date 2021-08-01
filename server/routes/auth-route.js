const express = require('express');
const AuthController = require('../controllers/auth-controller');

const router = express.Router();

// define routes
router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.login);

module.exports = router;
