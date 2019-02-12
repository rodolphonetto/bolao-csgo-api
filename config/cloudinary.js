const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'rodolphonetto',
  api_key: '643673452146514',
  api_secret: 'zs4ORkrq6ssCw8xkBEzhHltrTcA',
});

exports.cloudinary = cloudinary;
