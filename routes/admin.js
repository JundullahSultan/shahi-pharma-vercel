const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.js');
const authentication = require('../middleware/auth.js');
const aiController = require('../controllers/ai.js');

// ==========================================
// 1. PUBLIC ROUTES (No Login Required)
// ==========================================

// Login Page & Logic
router.get('/login', adminController.login);
router.post('/login', adminController.loginAdmin);

// Logout
router.get('/logout', adminController.logoutAdmin);

// ==========================================
// 3. DASHBOARD & ORDERS
// ==========================================
router.get(
  '/dashboard',
  authentication.verifyAdmin,
  adminController.sendDashboard,
);
router.get(
  '/orders',
  authentication.verifyAdmin,
  adminController.sendOrdersPage,
);
router.put(
  '/orders/:id/status',
  authentication.verifyAdmin,
  adminController.updateOrderStatus,
);

// ==========================================
// 4. USER MANAGEMENT
// ==========================================
router.get('/users', authentication.verifyAdmin, adminController.sendUsersPage);
// UPDATED: Added uploadImage middleware here
router.post(
  '/users',
  authentication.verifyAdmin,
  adminController.uploadImage,
  adminController.createUser,
);
router.delete(
  '/users/:id',
  authentication.verifyAdmin,
  adminController.deleteUser,
);

// ==========================================
// 5. MEDICINE MANAGEMENT
// ==========================================

// View Medicine Inventory
router.get(
  '/medicines',
  authentication.verifyAdmin,
  adminController.sendMedicinesPage,
);

// Create New Medicine (Handles Image Upload)
router.post(
  '/medicines',
  authentication.verifyAdmin,
  adminController.uploadImage,
  adminController.createMedicine,
);

// Update Existing Medicine (Handles Image Upload)
// Fix: Added uploadImage middleware so we can update the photo too
router.put(
  '/medicines/:id',
  authentication.verifyAdmin,
  adminController.uploadImage,
  adminController.updateMedicine,
);

// Delete Medicine
// Fix: Now protected by the middleware barrier above
router.delete(
  '/medicines/:id',
  authentication.verifyAdmin,
  adminController.deleteMedicine,
);

// Add these lines:
router.get(
  '/requests',
  authentication.verifyAdmin,
  adminController.getRequests,
);
router.put(
  '/requests/:id/status',
  authentication.verifyAdmin,
  adminController.updateRequestStatus,
);

router.get('/ai', authentication.verifyAdmin, aiController.getAiPage);
router.post('/ai/chat', authentication.verifyAdmin, aiController.chatWithData);

router.get(
  '/settings',
  authentication.verifyAdmin,
  adminController.getSettings,
);

// Delete Request
router.delete(
  '/requests/:id',
  authentication.verifyAdmin,
  adminController.deleteRequest,
);

// Delete Order
router.delete(
  '/orders/:id',
  authentication.verifyAdmin,
  adminController.deleteOrder,
);


module.exports = router;
