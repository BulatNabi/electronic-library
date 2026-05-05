const db = require('../config/db');

class User {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT u.*, r.Role_name
      FROM Users u
      JOIN Roles r ON u.ID_Role = r.ID_Role
      ORDER BY u.ID_User
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT u.*, r.Role_name
      FROM Users u
      JOIN Roles r ON u.ID_Role = r.ID_Role
      WHERE u.ID_User = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByLogin(login) {
    const [rows] = await db.query(`
      SELECT u.*, r.Role_name
      FROM Users u
      JOIN Roles r ON u.ID_Role = r.ID_Role
      WHERE u.Login = ?
    `, [login]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM Users WHERE Email = ?', [email]);
    return rows[0] || null;
  }

  static async create({ login, password, fullName, email, roleId }) {
    const [result] = await db.query(
      'INSERT INTO Users (Login, Password, FullName, Email, ID_Role) VALUES (?, ?, ?, ?, ?)',
      [login, password, fullName, email, roleId]
    );
    return result.insertId;
  }

  static async update(id, { fullName, email }) {
    await db.query(
      'UPDATE Users SET FullName = ?, Email = ? WHERE ID_User = ?',
      [fullName, email, id]
    );
  }

  static async updatePhoto(id, photo) {
    await db.query('UPDATE Users SET Photo = ? WHERE ID_User = ?', [photo, id]);
  }

  static async updateRole(id, roleId) {
    await db.query('UPDATE Users SET ID_Role = ? WHERE ID_User = ?', [roleId, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM Favorites WHERE ID_User = ?', [id]);
    await db.query('DELETE FROM DownloadStats WHERE ID_User = ?', [id]);
    await db.query('DELETE FROM Users WHERE ID_User = ?', [id]);
  }

  static async countByRole(roleId) {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM Users WHERE ID_Role = ?', [roleId]);
    return rows[0].count;
  }

  static async search(query, roleId) {
    let sql = `
      SELECT u.*, r.Role_name
      FROM Users u
      JOIN Roles r ON u.ID_Role = r.ID_Role
      WHERE 1=1
    `;
    const params = [];

    if (query && query.trim()) {
      sql += ' AND (u.FullName LIKE ? OR u.Login LIKE ? OR u.Email LIKE ?)';
      const q = `%${query.trim()}%`;
      params.push(q, q, q);
    }

    if (roleId && roleId !== '' && roleId !== 'all') {
      sql += ' AND u.ID_Role = ?';
      params.push(parseInt(roleId));
    }

    sql += ' ORDER BY u.ID_User';
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = User;
