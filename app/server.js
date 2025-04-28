require('dotenv').config();
const express = require('express');
const db = require('./db');
const { listProductImages } = require('./s3');

const app = express();
const PORT = 3000;

// Setup EJS view engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
    try {
      const images = await listProductImages(); // list dari S3
      const [products] = await db.query('SELECT * FROM products'); // dari database

      // Untuk tiap product, cari gambar yang cocok dari list images
      const productsWithImages = products.map(product => {
        const matchedImage = images.find(img => img.Key === product.image_key);
        return {
          ...product,
          imageUrl: matchedImage ? matchedImage.url : null
        };
      });

      res.render('index', { products: productsWithImages });
    } catch (error) {
      console.error(error);
      res.status(500).send('Something went wrong');
    }
});
  