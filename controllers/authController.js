const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
