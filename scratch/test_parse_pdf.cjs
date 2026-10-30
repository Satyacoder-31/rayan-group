const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('scratch/test_download.pdf');
pdf(dataBuffer).then(data => {
  console.log('PDF text preview:');
  console.log(data.text.slice(0, 1500));
}).catch(err => {
  console.error('PDF parse error:', err);
});
