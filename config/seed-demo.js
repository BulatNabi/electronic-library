const db = require('./db');
const fs = require('fs');
const path = require('path');

async function seedDemo() {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

  const demoFiles = [
    { name: 'report-2024.txt', content: 'Технический отчёт за 2024 год. Содержание: анализ системы, выводы, рекомендации.' },
    { name: 'textbook-js.txt', content: 'Учебное пособие по JavaScript. Основы языка, DOM, асинхронное программирование.' },
    { name: 'gost-34.txt', content: 'ГОСТ 34.601-90. Автоматизированные системы. Стадии создания.' },
    { name: 'article-ai.txt', content: 'Научная статья: Применение искусственного интеллекта в веб-разработке.' },
    { name: 'manual-nodejs.txt', content: 'Методическое пособие по Node.js и Express. Серверная разработка на JavaScript.' },
    { name: 'report-security.txt', content: 'Отчёт по информационной безопасности. Аудит, уязвимости, меры защиты.' },
    { name: 'textbook-db.txt', content: 'Учебник по базам данных. SQL, нормализация, проектирование схем.' },
    { name: 'article-web.txt', content: 'Статья: Современные тенденции веб-разработки 2025.' },
  ];

  for (const f of demoFiles) {
    fs.writeFileSync(path.join(uploadsDir, f.name), f.content, 'utf8');
  }

  const docs = [
    { title: 'Технический отчёт за 2024 год', author: 'Сидоров А.В.', year: 2024, annotation: 'Подробный технический отчёт о результатах разработки и тестирования информационной системы. Включает анализ производительности, выявленные проблемы и рекомендации по улучшению.', filePath: 'report-2024.txt', categoryId: 1 },
    { title: 'Основы JavaScript', author: 'Петров И.С.', year: 2023, annotation: 'Учебное пособие для студентов, изучающих веб-программирование. Рассматриваются основы языка JavaScript, работа с DOM, события, асинхронное программирование с Promise и async/await.', filePath: 'textbook-js.txt', categoryId: 2 },
    { title: 'ГОСТ 34.601-90 Стадии создания АС', author: 'Госстандарт', year: 1990, annotation: 'Стандарт определяет стадии и этапы создания автоматизированных систем. Применяется при разработке технической документации на системы различного назначения.', filePath: 'gost-34.txt', categoryId: 3 },
    { title: 'Применение ИИ в веб-разработке', author: 'Козлова Е.Н.', year: 2025, annotation: 'Исследование возможностей применения технологий искусственного интеллекта для автоматизации процессов разработки и тестирования веб-приложений.', filePath: 'article-ai.txt', categoryId: 4 },
    { title: 'Node.js и Express: серверная разработка', author: 'Иванов М.А.', year: 2024, annotation: 'Методическое пособие по разработке серверных приложений на платформе Node.js с использованием фреймворка Express. Включает практические примеры и задания.', filePath: 'manual-nodejs.txt', categoryId: 5 },
    { title: 'Аудит информационной безопасности', author: 'Смирнов Д.К.', year: 2024, annotation: 'Отчёт о проведении аудита информационной безопасности корпоративной сети. Описаны выявленные уязвимости и предложены меры защиты.', filePath: 'report-security.txt', categoryId: 1 },
    { title: 'Проектирование баз данных', author: 'Кузнецов В.Г.', year: 2022, annotation: 'Учебник по проектированию реляционных баз данных. Рассматриваются нормальные формы, ER-диаграммы, язык SQL и оптимизация запросов.', filePath: 'textbook-db.txt', categoryId: 2 },
    { title: 'Тренды веб-разработки 2025', author: 'Новикова А.И.', year: 2025, annotation: 'Обзорная статья о современных тенденциях в области веб-разработки: SSR, Edge Computing, AI-assisted development, WebAssembly и новые JavaScript-фреймворки.', filePath: 'article-web.txt', categoryId: 4 },
  ];

  for (const doc of docs) {
    await db.query(
      `INSERT INTO Documents (Title, Author, Year, Annotation, File_path, ID_Category, Upload_date)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE Title = Title`,
      [doc.title, doc.author, doc.year, doc.annotation, doc.filePath, doc.categoryId]
    );
  }

  console.log(`Inserted ${docs.length} demo documents with files.`);
  process.exit(0);
}

seedDemo().catch(err => {
  console.error('Seed demo failed:', err.message);
  process.exit(1);
});
