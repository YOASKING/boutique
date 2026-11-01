import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(dir, 'boutique.db'));

const SUPERADMIN_EMAIL = 'paulchristyoas@gmail.com';
const SUPERADMIN_HASH = '$2b$10$/Men0oT2GkurGtm675VWXer.VEB63e4qDYqtsrdbLa3FDHQN6XtsC';

const catalogueInitial = [
  { id: 1, name: 'T-shirt', price: 19, info: 'Coton biologique', description: 'T-shirt droit en jersey de coton biologique. Une pièce de tous les jours.' },
  { id: 2, name: 'Sweat', price: 39, info: 'Molleton épais', description: 'Sweat à col rond en molleton épais. Confortable, sans logo visible.' },
  { id: 3, name: 'Casquette', price: 15, info: 'Broderie ton sur ton', description: 'Casquette à six panneaux, visière souple, broderie discrète.' },
  { id: 4, name: 'Cabas', price: 12, info: 'Toile solide', description: 'Cabas en toile épaisse, anses longues. Fait pour un usage quotidien.' },
  { id: 5, name: 'Chaussettes', price: 8, info: 'Lot de deux paires', description: 'Chaussettes côtelées, lot de deux paires. Coton peigné.' },
  { id: 6, name: 'Tasse', price: 14, info: 'Céramique mate', description: 'Tasse en céramique mate, 30 cl. Forme simple, bord fin.' },
];

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    hash TEXT NOT NULL,
    role TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    info TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL
  );
`);

function lireJson(fichier, sinon) {
  if (!fs.existsSync(fichier)) return sinon;
  return JSON.parse(fs.readFileSync(fichier, 'utf8'));
}

function importerSiVide() {
  const usersVides = db.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0;
  if (usersVides) {
    const users = lireJson(path.join(dir, 'users.json'), []);
    const inserer = db.prepare('INSERT INTO users (email, hash, role) VALUES (?, ?, ?)');
    for (const user of users) {
      inserer.run(user.email, user.hash, user.role || 'client');
    }
  }

  const produitsVides = db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0;
  if (produitsVides) {
    const produits = lireJson(path.join(dir, 'products.json'), catalogueInitial);
    const inserer = db.prepare(
      'INSERT INTO products (id, name, price, info, description, image) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const product of produits) {
      inserer.run(product.id, product.name, product.price, product.info || '', product.description || '', product.image || '');
    }
  }
}

function assurerSuperadmin() {
  const compte = db.prepare('SELECT email FROM users WHERE email = ?').get(SUPERADMIN_EMAIL);
  if (compte) {
    db.prepare('UPDATE users SET role = ?, hash = ? WHERE email = ?').run('superadmin', SUPERADMIN_HASH, SUPERADMIN_EMAIL);
  } else {
    db.prepare('INSERT INTO users (email, hash, role) VALUES (?, ?, ?)').run(SUPERADMIN_EMAIL, SUPERADMIN_HASH, 'superadmin');
  }
}

importerSiVide();
assurerSuperadmin();

export function listProducts() {
  return db.prepare('SELECT id, name, price, info, description, image FROM products ORDER BY id').all();
}

export function nextProductId() {
  return db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS id FROM products').get().id;
}

export function insertProduct(product) {
  db.prepare(
    'INSERT INTO products (id, name, price, info, description, image) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(product.id, product.name, product.price, product.info, product.description, product.image || '');
}

export function removeProduct(id) {
  const product = db.prepare('SELECT id, name, price, info, description, image FROM products WHERE id = ?').get(id);
  if (!product) return null;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return product;
}

export function listUsers() {
  return db.prepare('SELECT email, role FROM users').all();
}

export function findUser(email) {
  return db.prepare('SELECT email, hash, role FROM users WHERE email = ?').get(email) || null;
}

export function insertUser(email, hash, role) {
  db.prepare('INSERT INTO users (email, hash, role) VALUES (?, ?, ?)').run(email, hash, role);
}

export function updateRole(email, role) {
  db.prepare('UPDATE users SET role = ? WHERE email = ?').run(role, email);
}

export function getSession(token) {
  return db.prepare('SELECT email, role FROM sessions WHERE token = ?').get(token) || null;
}

export function setSession(token, email, role) {
  db.prepare('INSERT INTO sessions (token, email, role) VALUES (?, ?, ?)').run(token, email, role);
}

export function alignSessions(email, role) {
  db.prepare('UPDATE sessions SET role = ? WHERE email = ?').run(role, email);
}
