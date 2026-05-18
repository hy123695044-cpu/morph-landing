var fs = require('fs');
var html = fs.readFileSync('index.html','utf8');

var bumps = {
  'font-size:0.3rem': 'font-size:0.4rem',
  'font-size:0.34rem': 'font-size:0.42rem',
  'font-size:0.36rem': 'font-size:0.44rem',
  'font-size:0.38rem': 'font-size:0.46rem',
  'font-size:0.4rem':  'font-size:0.48rem',
  'font-size:0.42rem': 'font-size:0.5rem',
  'font-size:0.44rem': 'font-size:0.5rem',
  'font-size:0.46rem': 'font-size:0.52rem',
};

Object.keys(bumps).forEach(function(k) {
  var v = bumps[k];
  var count = 0;
  while (html.indexOf(k) !== -1) {
    html = html.replace(k, v);
    count++;
  }
  if (count > 0) console.log(k + ' -> ' + v + ': ' + count + ' replacements');
});

fs.writeFileSync('index.html', html);
console.log('Done');
