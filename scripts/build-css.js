const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const atImport = require('postcss-import');

// Read the main CSS file
const css = fs.readFileSync('dist/l3ui.css', 'utf8');

// Process with PostCSS
postcss([atImport()])
  .process(css, {
    from: 'dist/l3ui.css',
    to: 'dist/l3ui.bundle.css'
  })
  .then(result => {
    fs.writeFileSync('dist/l3ui.bundle.css', result.css);
    console.log('CSS bundle built successfully!');
  })
  .catch(error => {
    console.error('Error building CSS bundle:', error);
  });