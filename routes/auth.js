const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueName = 'photo-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Допустимые форматы: JPG, PNG, GIF, WEBP.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/profile', isAuthenticated, authController.profilePage);
router.post('/profile/photo', isAuthenticated, upload.single('photo'), authController.uploadPhoto);
router.delete('/profile/photo', isAuthenticated, authController.deletePhoto);

module.exports = router;
