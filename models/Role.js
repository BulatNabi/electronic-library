const db = require('../config/db');

class Role {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM Roles ORDER BY ID_Role');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM Roles WHERE ID_Role = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = Role;
