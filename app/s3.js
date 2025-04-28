require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION, // contoh: us-east-1
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

async function listProductImages() {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: 'products/'
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map(item => {
      return {
        Key: item.Key,
        url: s3.getSignedUrl('getObject', {
          Bucket: BUCKET_NAME,
          Key: item.Key,
          Expires: 3600
        })
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

module.exports = { listProductImages };