const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  register,
  login,
  getAllUsers,
  deleteUser,
} = require('../controllers/authController');

// Hanya admin yang boleh register user baru
router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deleteUser
);

module.exports = router;
