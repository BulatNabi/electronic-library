const db = require('../config/db');

class Category {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM Categories ORDER BY Category_name');
    return rows;
  }

  static async findAllWithCount() {
    const [rows] = await db.query(`
      SELECT c.*, COUNT(d.ID_Document) as doc_count
      FROM Categories c
      LEFT JOIN Documents d ON c.ID_Category = d.ID_Category
      GROUP BY c.ID_Category
      ORDER BY c.Category_name
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM Categories WHERE ID_Category = ?', [id]);
    return rows[0] || null;
  }

  static async findByName(name) {
    const [rows] = await db.query('SELECT * FROM Categories WHERE Category_name = ?', [name]);
    return rows[0] || null;
  }

  static async create(name) {
    const [result] = await db.query('INSERT INTO Categories (Category_name) VALUES (?)', [name]);
    return result.insertId;
  }

  static async update(id, name) {
    await db.query('UPDATE Categories SET Category_name = ? WHERE ID_Category = ?', [name, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM Categories WHERE ID_Category = ?', [id]);
  }

  static async getDocumentCount(id) {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM Documents WHERE ID_Category = ?', [id]);
    return rows[0].count;
  }

  static async reassignDocuments(categoryId) {
    let [rows] = await db.query("SELECT ID_Category FROM Categories WHERE Category_name = 'Без категории'");
    let defaultCatId;
    if (rows.length === 0) {
      const [result] = await db.query("INSERT INTO Categories (Category_name) VALUES ('Без категории')");
      defaultCatId = result.insertId;
    } else {
      defaultCatId = rows[0].ID_Category;
    }
    await db.query('UPDATE Documents SET ID_Category = ? WHERE ID_Category = ?', [defaultCatId, categoryId]);
  }
}

module.exports = Category;
