const Document = require('../models/Document');
const Category = require('../models/Category');
const DownloadStats = require('../models/DownloadStats');
const fs = require('fs');
const path = require('path');

exports.dashboard = (req, res) => {
  res.redirect('/librarian/documents');
};

exports.documentList = async (req, res) => {
  try {
    const { query, category } = req.query;
    let documents;

    if (query || (category && category !== 'all')) {
      documents = await Document.search(query, category);
    } else {
      documents = await Document.findAll();
    }

    const categories = await Category.findAll();
    res.render('librarian/documents', {
      title: 'Управление документами',
      documents,
      categories,
      searchQuery: query || '',
      searchCategory: category || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { title, author, year, annotation, categoryId } = req.body;

    if (!title || !author || !year || !annotation || !categoryId) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не прикреплён.' });
    }

    const filePath = req.file.filename;
    const docId = await Document.create({ title, author, year: parseInt(year), annotation, filePath, categoryId: parseInt(categoryId) });

    res.json({ success: true, message: 'Документ успешно добавлен.', documentId: docId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Документ не найден' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, author, year, annotation, categoryId } = req.body;

    if (!title || !author || !year || !annotation || !categoryId) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены.' });
    }

    let newFilePath = null;
    if (req.file) {
      newFilePath = req.file.filename;
      const doc = await Document.findById(req.params.id);
      if (doc) {
        const oldFile = path.join(__dirname, '..', 'public', 'uploads', doc.File_path);
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }
    }

    await Document.update(req.params.id, { title, author, year: parseInt(year), annotation, categoryId: parseInt(categoryId), filePath: newFilePath });
    res.json({ success: true, message: 'Изменения успешно сохранены.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Документ не найден' });

    const filePath = path.join(__dirname, '..', 'public', 'uploads', doc.File_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.delete(req.params.id);
    res.json({ success: true, message: 'Документ успешно удалён.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.categoryList = async (req, res) => {
  try {
    const { query } = req.query;
    let categories;

    if (query) {
      categories = await Category.searchWithCount(query);
    } else {
      categories = await Category.findAllWithCount();
    }

    res.render('librarian/categories', {
      title: 'Управление категориями',
      categories,
      searchQuery: query || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название категории не может быть пустым.' });
    }

    const existing = await Category.findByName(name.trim());
    if (existing) {
      return res.status(400).json({ error: 'Данная категория уже существует.' });
    }

    const catId = await Category.create(name.trim());
    res.json({ success: true, message: 'Категория создана.', categoryId: catId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название категории не может быть пустым.' });
    }

    const existing = await Category.findByName(name.trim());
    if (existing && existing.ID_Category !== parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Данная категория уже существует.' });
    }

    await Category.update(req.params.id, name.trim());
    res.json({ success: true, message: 'Категория обновлена.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const docCount = await Category.getDocumentCount(req.params.id);

    if (docCount > 0) {
      await Category.reassignDocuments(req.params.id);
    }

    await Category.delete(req.params.id);
    res.json({ success: true, message: 'Категория удалена.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.downloadStats = async (req, res) => {
  try {
    const { query, sort } = req.query;
    const stats = await DownloadStats.getAggregated(query, sort);
    res.render('librarian/stats', {
      title: 'Статистика скачиваний',
      stats,
      searchQuery: query || '',
      sortBy: sort || 'desc'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
