const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.loginPage = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', { title: 'Вход в систему', error: null });
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findByLogin(login);

    if (!user || !bcrypt.compareSync(password, user.Password)) {
      return res.render('auth/login', {
        title: 'Вход в систему',
        error: 'Неверный логин или пароль.'
      });
    }

    req.session.user = {
      id: user.ID_User,
      login: user.Login,
      fullName: user.FullName,
      email: user.Email,
      photo: user.Photo,
      role: user.Role_name,
      roleId: user.ID_Role
    };

    const role = user.Role_name;
    if (role === 'Администратор') return res.redirect('/admin');
    if (role === 'Библиотекарь') return res.redirect('/librarian');
    return res.redirect('/reader');
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'Вход в систему',
      error: 'Ошибка сервера. Попробуйте позже.'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

exports.profilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('auth/profile', { title: 'Мой профиль', user });
  } catch (err) {
    console.error(err);
    res.status(500).render('layouts/error', { title: 'Ошибка', message: 'Ошибка сервера', code: 500 });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);

    if (!req.file) {
      return res.status(400).json({ error: 'Фото не прикреплено.' });
    }

    if (user.Photo) {
      const oldPhoto = path.join(__dirname, '..', 'public', 'uploads', user.Photo);
      if (fs.existsSync(oldPhoto)) fs.unlinkSync(oldPhoto);
    }

    await User.updatePhoto(userId, req.file.filename);
    req.session.user.photo = req.file.filename;

    res.json({ success: true, message: 'Фото обновлено.', photo: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);

    if (user.Photo) {
      const photoPath = path.join(__dirname, '..', 'public', 'uploads', user.Photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      await User.updatePhoto(userId, null);
      req.session.user.photo = null;
    }

    res.json({ success: true, message: 'Фото удалено.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
