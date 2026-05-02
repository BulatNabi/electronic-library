const express = require('express');
const router = express.Router();
const { isAuthenticated, isReader } = require('../middleware/auth');
const readerController = require('../controllers/readerController');

router.use(isAuthenticated, isReader);

router.get('/', readerController.catalog);
router.get('/search', readerController.search);
router.get('/documents/:id', readerController.documentCard);
router.get('/documents/:id/download', readerController.downloadDocument);

// Favorites
router.get('/favorites', readerController.favoritesList);
router.post('/favorites/:id', readerController.addFavorite);
router.delete('/favorites/:id', readerController.removeFavorite);

module.exports = router;
