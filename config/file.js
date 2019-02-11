const fs = require('fs');
const path = require('path');

const deleteFile = (file) => {
  fs.unlink(path.join(__dirname, '../', 'images', file), (err) => {
    console.log(err);
  });
};

exports.deleteFile = deleteFile;
