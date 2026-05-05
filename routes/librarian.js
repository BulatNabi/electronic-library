const express = require('express');
const router = express.Router();
const { isAuthenticated, isLibrarian } = require('../middleware/auth');
const librarianController = require('../controllers/librarianController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Данный формат файла не поддерживается.'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.use(isAuthenticated, isLibrarian);

router.get('/', librarianController.dashboard);

router.get('/documents', librarianController.documentList);
router.post('/documents', upload.single('file'), librarianController.uploadDocument);
router.get('/documents/:id', librarianController.getDocument);
router.put('/documents/:id', upload.single('file'), librarianController.updateDocument);
router.delete('/documents/:id', librarianController.deleteDocument);

router.get('/categories', librarianController.categoryList);
router.post('/categories', librarianController.createCategory);
router.put('/categories/:id', librarianController.updateCategory);
router.delete('/categories/:id', librarianController.deleteCategory);

router.get('/stats', librarianController.downloadStats);

module.exports = router;
