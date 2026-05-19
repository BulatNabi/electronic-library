const db = require('../config/db');

class DownloadStats {
  static async log(userId, documentId) {
    await db.query(
      'INSERT INTO DownloadStats (ID_User, ID_Document, Download_date) VALUES (?, ?, NOW())',
      [userId, documentId]
    );
  }

  static async getAggregated(query, sortBy) {
    let sql = `
      SELECT d.ID_Document, d.Title, d.Author, COUNT(ds.ID_Download) as download_count
      FROM Documents d
      LEFT JOIN DownloadStats ds ON d.ID_Document = ds.ID_Document
    `;
    const params = [];
    const where = [];

    if (query && query.trim()) {
      where.push('(d.Title LIKE ? OR d.Author LIKE ?)');
      const q = `%${query.trim()}%`;
      params.push(q, q);
    }

    if (where.length > 0) sql += ' WHERE ' + where.join(' AND ');
    sql += ' GROUP BY d.ID_Document';

    if (sortBy === 'title') sql += ' ORDER BY d.Title';
    else if (sortBy === 'author') sql += ' ORDER BY d.Author';
    else if (sortBy === 'asc') sql += ' ORDER BY download_count ASC';
    else sql += ' ORDER BY download_count DESC';

    const [rows] = await db.query(sql, params);
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
