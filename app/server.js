require('dotenv').config();
const express = require('express');
const db = require('./db');
const { listProductImages, uploadProductImage } = require('./s3');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parsing URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Multer in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ROUTE: Daftar produk
app.get('/', async (req, res) => {
  try {
    const images = await listProductImages();                  // daftar file S3
    const [products] = await db.query('SELECT * FROM products');  // daftar produk RDS

    // Gabungkan produk dengan URL gambar dari S3
    const productsWithImages = products.map(p => {
      const img = images.find(i => i.Key === p.image_key);
      return {
        ...p,
        imageUrl: img ? img.url : null
      };
    });

    res.render('index', { products: productsWithImages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

// ROUTE: Form tambah produk
app.get('/add', (req, res) => {
  res.render('add');
});

// ROUTE: Proses tambah produk
app.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const file = req.file;
    if (!file) throw new Error('Gambar wajib diupload.');

    // Gunakan nama file asli tanpa manipulasi
    const imageKey = file.originalname;

    // Upload buffer ke S3
    await uploadProductImage(file.buffer, imageKey, file.mimetype);

    // Simpan record ke RDS
    await db.query(
      'INSERT INTO products (name, price, image_key) VALUES (?, ?, ?)',
      [name, price, imageKey]
    );

    res.redirect('/');
  } catch (err) {
    console.error('Error detail:', err);
    res.status(500).send(`Gagal menambahkan produk. Error: ${err.message}`);
}

});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
