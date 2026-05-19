const db = require('../config/db');

class Favorite {
  static async getUserFavorites(userId, query, categoryId) {
    let sql = `
      SELECT f.*, d.ID_Document, d.Title, d.Author, d.Year, d.Annotation, c.Category_name
      FROM Favorites f
      JOIN Documents d ON f.ID_Document = d.ID_Document
      LEFT JOIN Categories c ON d.ID_Category = c.ID_Category
      WHERE f.ID_User = ?
    `;
    const params = [userId];

    if (query && query.trim()) {
      sql += ' AND (d.Title LIKE ? OR d.Author LIKE ?)';
      const q = `%${query.trim()}%`;
      params.push(q, q);
    }

    if (categoryId && categoryId !== '' && categoryId !== 'all') {
      sql += ' AND d.ID_Category = ?';
      params.push(parseInt(categoryId));
    }

    sql += ' ORDER BY f.Added_date DESC';
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getUserFavoriteIds(userId) {
    const [rows] = await db.query('SELECT ID_Document FROM Favorites WHERE ID_User = ?', [userId]);
    return rows.map(r => r.ID_Document);
  }

  static async isFavorite(userId, documentId) {
    const [rows] = await db.query(
      'SELECT * FROM Favorites WHERE ID_User = ? AND ID_Document = ?',
      [userId, documentId]
    );
    return rows.length > 0;
  }

  static async add(userId, documentId) {
    await db.query(
      'INSERT INTO Favorites (ID_User, ID_Document, Added_date) VALUES (?, ?, NOW())',
      [userId, documentId]
    );
  }

  static async remove(userId, documentId) {
    await db.query(
      'DELETE FROM Favorites WHERE ID_User = ? AND ID_Document = ?',
      [userId, documentId]
    );
  }
}

module.exports = Favorite;
