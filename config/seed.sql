USE document_library;

INSERT IGNORE INTO Roles (ID_Role, Role_name) VALUES
  (1, 'Администратор'),
  (2, 'Библиотекарь'),
  (3, 'Читатель');

INSERT IGNORE INTO Users (Login, Password, FullName, Email, ID_Role) VALUES
  ('admin', '$2b$10$Z42GgE3crzhiAOukpsv4W.yll6HQZQzci1IarKYzTXRMeTOn7BS6G', 'Администратор системы', 'admin@library.ru', 1);

INSERT IGNORE INTO Users (Login, Password, FullName, Email, ID_Role) VALUES
  ('librarian', '$2b$10$B5nTXR4Rf2i6h86LyWkYgeH8mUQTjwacKwJqEnhwT8CJH8jOqCzxK', 'Иванова Мария Петровна', 'librarian@library.ru', 2);

INSERT IGNORE INTO Users (Login, Password, FullName, Email, ID_Role) VALUES
  ('reader', '$2b$10$/qhu1Q9uzo4eaduO0yi/XONqzYAxYxgKndl2JE4kzcSkWHI3a/ccu', 'Петров Иван Сергеевич', 'reader@library.ru', 3);

INSERT IGNORE INTO Categories (Category_name) VALUES
  ('Технические отчёты'),
  ('Учебные материалы'),
  ('Нормативные документы'),
  ('Научные статьи'),
  ('Методические пособия');
