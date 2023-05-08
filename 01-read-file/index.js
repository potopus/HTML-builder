const path = require('path');
const fs = require('fs');

const readStream = fs.createReadStream(path.join(__dirname, 'text.txt'));
readStream.on('data', (chunk) => {
  console.log(chunk.toString());
});
readStream.on('end', () => {
  console.log('File reading completed');
});