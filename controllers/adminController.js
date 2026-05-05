const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

exports.dashboard = (req, res) => {
  res.redirect('/admin/users');
};

exports.userList = async (req, res) => {
  try {
    const { query, role } = req.query;
    let users;

    if (query || (role && role !== 'all')) {
      users = await User.search(query, role);
    } else {
      users = await User.findAll();
    }

    const roles = await Role.findAll();

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ users });
    }

    res.render('admin/users', {
      title: 'Управление пользователями',
      users,
      roles,
      searchQuery: query || '',
      searchRole: role || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, roleId } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован.' });
    }

    const login = email.split('@')[0] + Math.floor(Math.random() * 100);
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(tempPassword, 10);

    const userId = await User.create({ login, password: hashedPassword, fullName, email, roleId });

    res.json({
      success: true,
      message: 'Учётная запись создана.',
      credentials: { login, password: tempPassword },
      userId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    await User.update(req.params.id, { fullName, email });
    res.json({ success: true, message: 'Профиль успешно обновлён.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (!req.file) {
      return res.status(400).json({ error: 'Фото не прикреплено.' });
    }

    if (user.Photo) {
      const oldPhoto = path.join(__dirname, '..', 'public', 'uploads', user.Photo);
      if (fs.existsSync(oldPhoto)) {
        fs.unlinkSync(oldPhoto);
      }
    }

    await User.updatePhoto(req.params.id, req.file.filename);
    res.json({ success: true, message: 'Фото обновлено.', photo: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (user.Photo) {
      const photoPath = path.join(__dirname, '..', 'public', 'uploads', user.Photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      await User.updatePhoto(req.params.id, null);
    }

    res.json({ success: true, message: 'Фото удалено.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (user.ID_User === req.session.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить свою учётную запись.' });
    }

    if (user.Photo) {
      const photoPath = path.join(__dirname, '..', 'public', 'uploads', user.Photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    await User.delete(req.params.id);
    res.json({ success: true, message: 'Учётная запись успешно удалена.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (user.Role_name === 'Администратор') {
      const admins = await User.countByRole(1);
      if (admins <= 1 && parseInt(roleId) !== 1) {
        return res.status(400).json({
          error: 'Невозможно изменить роль: в системе должен быть хотя бы один администратор.'
        });
      }
    }

    await User.updateRole(req.params.id, roleId);
    res.json({ success: true, message: 'Роль успешно изменена.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
