const db = require('../config/db');

class DownloadStats {
  static async log(userId, documentId) {
    await db.query(
      'INSERT INTO DownloadStats (ID_User, ID_Document, Download_date) VALUES (?, ?, NOW())',
      [userId, documentId]
    );
  }

  static async getAggregated() {
    const [rows] = await db.query(`
      SELECT d.ID_Document, d.Title, d.Author, COUNT(ds.ID_Download) as download_count
      FROM Documents d
      LEFT JOIN DownloadStats ds ON d.ID_Document = ds.ID_Document
      GROUP BY d.ID_Document
      ORDER BY download_count DESC
    `);
    return rows;
  }

  static async getByDocument(documentId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM DownloadStats WHERE ID_Document = ?',
      [documentId]
    );
    return rows[0].count;
  }
}

module.exports = DownloadStats;
