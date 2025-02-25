const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const verifyToken = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');

router.post('/login', userController.loginUser);

// Admin & Employee can READ users
router.get('/users', verifyToken, checkPermission('users', 'can_read'), userController.getAllUsers);
router.get('/users/:id', verifyToken, checkPermission('users', 'can_read'), userController.getUserById);

// Admin-only actions
router.post('/users', verifyToken, checkPermission('users', 'can_write'), userController.createUser);
router.put('/users/:id', verifyToken, checkPermission('users', 'can_update'), userController.updateUser);
router.delete('/users/:id', verifyToken, checkPermission('users', 'can_delete'), userController.deleteUser);

router.get('/export/csv', userController.exportCSV);
router.get('/export/excel', userController.exportExcel);
router.get('/export/pdf', userController.exportPDF);

router.post('/login', userController.loginUser);

module.exports = router;
