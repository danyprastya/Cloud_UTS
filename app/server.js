require('dotenv').config();
const express = require('express');
const db = require('./db');
const { listProductImages } = require('./s3');

const app = express();
const PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
  try {
    const images = await listProductImages();
    const [products] = await db.query('SELECT * FROM products');
    
    console.log('DB products:', products);
    console.log('S3 images:', images);

    const productsWithImages = products.map(p => {
      const img = images.find(i => i.Key === p.image_key);
      return {
        ...p,
        imageUrl: img ? img.url : null
      };
    });

    console.log('Merged:', productsWithImages);

    res.render('index', { products: productsWithImages });
  } catch (err) {
    console.error('Route / error:', err);
    res.status(500).send('Something went wrong');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
