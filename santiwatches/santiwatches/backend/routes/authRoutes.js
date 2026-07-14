/**
 * routes/authRoutes.js
 */

'use strict';

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.me);

module.exports = router;
