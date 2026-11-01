import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import * as db from './db.js';

const app = express();
const dir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(dir, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

function estAdmin(role) {
  return role === 'admin' || role === 'superadmin';
}

function sessionDe(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token ? db.getSession(token) : null;
}

function exigerAdmin(req, res, next) {
  const session = sessionDe(req);
  if (!session || !estAdmin(session.role)) {
    return res.status(403).json({ message: 'Réservé à l’administrateur.' });
  }
  next();
}

function exigerSuperadmin(req, res, next) {
  const session = sessionDe(req);
  if (!session || session.role !== 'superadmin') {
    return res.status(403).json({ message: 'Seul le compte principal peut gérer les administrateurs.' });
  }
  next();
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Le fichier doit être une image.'));
  },
});

function avecImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) return next();
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'L’image doit faire moins de 2 Mo.'
      : (error.message || 'Image invalide.');
    res.status(400).json({ message });
  });
}

function effacerImage(image) {
  if (!image) return;
  const file = path.join(uploadsDir, path.basename(image));
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/products', (_req, res) => res.json(db.listProducts()));

app.post('/products', exigerAdmin, avecImage, (req, res) => {
  const name = req.body?.name?.trim();
  const price = Number(req.body?.price);
  const info = req.body?.info?.trim() || '';
  const description = req.body?.description?.trim() || '';
  if (!name || !Number.isFinite(price) || price < 0) {
    effacerImage(req.file ? `/uploads/${req.file.filename}` : '');
    return res.status(400).json({ message: 'Nom et prix valides requis.' });
  }
  const product = {
    id: db.nextProductId(),
    name,
    price,
    info,
    description,
    image: req.file ? `/uploads/${req.file.filename}` : '',
  };
  db.insertProduct(product);
  res.status(201).json(product);
});

app.delete('/products/:id', exigerAdmin, (req, res) => {
  const id = Number(req.params.id);
  const product = db.removeProduct(id);
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  effacerImage(product.image);
  res.json({ message: 'Produit retiré.' });
});

app.get('/users', exigerSuperadmin, (_req, res) => {
  res.json(db.listUsers().map(({ email, role }) => ({ email, role: role || 'client' })));
});

app.patch('/users/role', exigerSuperadmin, (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const role = req.body?.role;
  const user = db.findUser(email);
  if (!user) return res.status(404).json({ message: 'Compte introuvable.' });
  if (user.role === 'superadmin') return res.status(403).json({ message: 'Ce rôle ne peut pas être modifié.' });
  if (role !== 'admin' && role !== 'client') return res.status(400).json({ message: 'Rôle invalide.' });
  db.updateRole(user.email, role);
  db.alignSessions(user.email, role);
  res.json({ email: user.email, role });
});

app.post('/admins', exigerSuperadmin, async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;
  if (!email || !password) return res.status(400).json({ message: 'Adresse e-mail et mot de passe requis.' });
  if (db.findUser(email)) {
    return res.status(409).json({ message: 'Ce compte existe déjà. Change son rôle dans la liste.' });
  }
  db.insertUser(email, await bcrypt.hash(password, 10), 'admin');
  res.status(201).json({ email, role: 'admin' });
});

app.post('/signup', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;
  if (!email || !password) return res.status(400).json({ message: 'Adresse e-mail et mot de passe requis.' });
  if (db.findUser(email)) return res.status(409).json({ message: 'Cette adresse est déjà utilisée.' });
  db.insertUser(email, await bcrypt.hash(password, 10), 'client');
  res.status(201).json({ message: 'Compte créé.', email });
});

app.post('/login', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const user = db.findUser(email);
  if (!user || !(await bcrypt.compare(req.body?.password || '', user.hash))) {
    return res.status(401).json({ message: 'Identifiants incorrects.' });
  }
  const token = randomBytes(24).toString('hex');
  const session = { email: user.email, role: user.role || 'client' };
  db.setSession(token, session.email, session.role);
  res.json({ message: 'Connecté.', ...session, token });
});

app.get('/me', (req, res) => {
  const session = sessionDe(req);
  if (!session) return res.status(401).json({ message: 'Non connecté.' });
  res.json(session);
});

app.listen(3001, () => console.log('API: http://localhost:3001 (SQLite boutique.db)'));
