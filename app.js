const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const librarianRoutes = require('./routes/librarian');
const readerRoutes = require('./routes/reader');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'document-library-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/librarian', librarianRoutes);
app.use('/reader', readerRoutes);

app.get('/', (req, res) => {
  if (req.session.user) {
    const role = req.session.user.role;
    if (role === 'Администратор') return res.redirect('/admin');
    if (role === 'Библиотекарь') return res.redirect('/librarian');
    return res.redirect('/reader');
  }
  res.redirect('/auth/login');
});

app.use((req, res) => {
  res.status(404).render('layouts/error', {
    title: 'Страница не найдена',
    message: 'Запрашиваемая страница не существует.',
    code: 404
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('layouts/error', {
    title: 'Ошибка сервера',
    message: 'Произошла внутренняя ошибка сервера.',
    code: 500
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
