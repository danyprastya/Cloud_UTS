require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const BUCKET = process.env.AWS_S3_BUCKET;

async function listProductImages() {
  try {
    const { Contents } = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    // Format: [{ Key, url }]
    return Contents.map(item => ({
      Key: item.Key,
      url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    }));
  } catch (err) {
    console.error('S3 List Error:', err);
    return [];
  }
}

module.exports = { listProductImages };
