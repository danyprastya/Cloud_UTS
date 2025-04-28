require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const BUCKET = process.env.AWS_S3_BUCKET;

// List semua objek di bucket (root)
async function listProductImages() {
  try {
    const { Contents } = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    return Contents.map(item => ({
      Key: item.Key,
      url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    }));
  } catch (err) {
    console.error('S3 List Error:', err);
    return [];
  }
}

// Upload buffer ke S3 dengan nama kunci tetap original
async function uploadProductImage(buffer, key, contentType) {
  try {
    await s3.putObject({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    }).promise();
  } catch (err) {
    console.error('S3 Upload Error:', err);
    throw err;
  }
}

module.exports = { listProductImages, uploadProductImage };
