function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'Администратор') return next();
  res.status(403).render('layouts/error', {
    title: 'Доступ запрещён',
    message: 'У вас нет прав для доступа к этому разделу.',
    code: 403
  });
}

function isLibrarian(req, res, next) {
  if (req.session.user && req.session.user.role === 'Библиотекарь') return next();
  res.status(403).render('layouts/error', {
    title: 'Доступ запрещён',
    message: 'У вас нет прав для доступа к этому разделу.',
    code: 403
  });
}

function isReader(req, res, next) {
  if (req.session.user && req.session.user.role === 'Читатель') return next();
  res.status(403).render('layouts/error', {
    title: 'Доступ запрещён',
    message: 'У вас нет прав для доступа к этому разделу.',
    code: 403
  });
}

module.exports = { isAuthenticated, isAdmin, isLibrarian, isReader };
