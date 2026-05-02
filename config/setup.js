const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('Connected to MySQL.');

  // Read and execute schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);
  console.log('Schema created.');

  // Read and execute seed
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  await connection.query(seed);
  console.log('Seed data inserted.');

  console.log('\nSetup complete! Default accounts:');
  console.log('  Admin:      login=admin,     password=admin123');
  console.log('  Librarian:  login=librarian, password=lib123');
  console.log('  Reader:     login=reader,    password=read123');

  await connection.end();
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
