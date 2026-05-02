const Document = require('../models/Document');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const DownloadStats = require('../models/DownloadStats');
const path = require('path');
const fs = require('fs');

exports.catalog = async (req, res) => {
  try {
    const documents = await Document.findAll();
    const categories = await Category.findAll();
    const favorites = await Favorite.getUserFavoriteIds(req.session.user.id);
    res.render('reader/catalog', { title: 'Каталог документов', documents, categories, favorites });
  } catch (err) {
    console.error(err);
    res.status(500).render('layouts/error', { title: 'Ошибка', message: 'Ошибка сервера', code: 500 });
  }
};

exports.search = async (req, res) => {
  try {
    const { query, category } = req.query;
    const documents = await Document.search(query, category);
    const categories = await Category.findAll();
    const favorites = await Favorite.getUserFavoriteIds(req.session.user.id);

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ documents, favorites });
    }

    res.render('reader/catalog', {
      title: 'Результаты поиска',
      documents,
      categories,
      favorites,
      searchQuery: query || '',
      searchCategory: category || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.documentCard = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).render('layouts/error', {
        title: 'Документ не найден',
        message: 'Документ не найден или был удалён.',
        code: 404
      });
    }

    const isFavorite = await Favorite.isFavorite(req.session.user.id, doc.ID_Document);
    res.render('reader/document', { title: doc.Title, document: doc, isFavorite });
  } catch (err) {
    console.error(err);
    res.status(500).render('layouts/error', { title: 'Ошибка', message: 'Ошибка сервера', code: 500 });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    const filePath = path.join(__dirname, '..', 'public', 'uploads', doc.File_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл временно недоступен.' });
    }

    // Log download
    await DownloadStats.log(req.session.user.id, doc.ID_Document);

    res.download(filePath, doc.Title + path.extname(doc.File_path));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.favoritesList = async (req, res) => {
  try {
    const favorites = await Favorite.getUserFavorites(req.session.user.id);
    res.render('reader/favorites', { title: 'Избранное', favorites });
  } catch (err) {
    console.error(err);
    res.status(500).render('layouts/error', { title: 'Ошибка', message: 'Ошибка сервера', code: 500 });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const exists = await Favorite.isFavorite(req.session.user.id, req.params.id);
    if (exists) {
      return res.status(400).json({ error: 'Документ уже в вашем избранном.' });
    }

    await Favorite.add(req.session.user.id, req.params.id);
    res.json({ success: true, message: 'Документ добавлен в избранное.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await Favorite.remove(req.session.user.id, req.params.id);
    res.json({ success: true, message: 'Документ удалён из избранного.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
