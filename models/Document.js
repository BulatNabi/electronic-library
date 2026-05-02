const db = require('../config/db');

class Document {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT d.*, c.Category_name
      FROM Documents d
      LEFT JOIN Categories c ON d.ID_Category = c.ID_Category
      ORDER BY d.Upload_date DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT d.*, c.Category_name
      FROM Documents d
      LEFT JOIN Categories c ON d.ID_Category = c.ID_Category
      WHERE d.ID_Document = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create({ title, author, year, annotation, filePath, categoryId }) {
    const [result] = await db.query(
      `INSERT INTO Documents (Title, Author, Year, Annotation, File_path, ID_Category, Upload_date)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, author, year, annotation, filePath, categoryId]
    );
    return result.insertId;
  }

  static async update(id, { title, author, year, annotation, categoryId }) {
    await db.query(
      `UPDATE Documents SET Title = ?, Author = ?, Year = ?, Annotation = ?, ID_Category = ?
       WHERE ID_Document = ?`,
      [title, author, year, annotation, categoryId, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM Favorites WHERE ID_Document = ?', [id]);
    await db.query('DELETE FROM DownloadStats WHERE ID_Document = ?', [id]);
    await db.query('DELETE FROM Documents WHERE ID_Document = ?', [id]);
  }

  static async search(query, categoryId) {
    let sql = `
      SELECT d.*, c.Category_name
      FROM Documents d
      LEFT JOIN Categories c ON d.ID_Category = c.ID_Category
      WHERE 1=1
    `;
    const params = [];

    if (query && query.trim()) {
      sql += ' AND (d.Title LIKE ? OR d.Author LIKE ?)';
      const q = `%${query.trim()}%`;
      params.push(q, q);
    }

    if (categoryId && categoryId !== '' && categoryId !== 'all') {
      sql += ' AND d.ID_Category = ?';
      params.push(parseInt(categoryId));
    }

    sql += ' ORDER BY d.Upload_date DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = Document;
