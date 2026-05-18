const fs = require('fs');
// Load HTML template
const html = require('./template.js');
fs.writeFileSync('C:/Users/Administrator/morph-landing/index.html', html);
console.log('Written OK');