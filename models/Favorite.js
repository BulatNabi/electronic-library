const db = require('../config/db');

class Favorite {
  static async getUserFavorites(userId) {
    const [rows] = await db.query(`
      SELECT f.*, d.Title, d.Author, d.Year, d.Annotation, c.Category_name
      FROM Favorites f
      JOIN Documents d ON f.ID_Document = d.ID_Document
      LEFT JOIN Categories c ON d.ID_Category = c.ID_Category
      WHERE f.ID_User = ?
      ORDER BY f.Added_date DESC
    `, [userId]);
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
