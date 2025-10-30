const fs = require('fs');
const cssnano = require('cssnano');
const postcss = require('postcss');

const css = fs.readFileSync('dist/l3ui.bundle.css', 'utf8');

postcss([cssnano()])
  .process(css, {
    from: 'dist/l3ui.bundle.css',
    to: 'dist/l3ui.min.css'
  })
  .then(result => {
    fs.writeFileSync('dist/l3ui.min.css', result.css);
    console.log('Minified CSS built successfully!');
  })
  .catch(error => {
    console.error('Error minifying CSS:', error);
  });