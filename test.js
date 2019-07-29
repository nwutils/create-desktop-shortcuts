var cds = require('./index.js');

var success = cds({
  verbose: false,
  linux: {
    name: 'Koala A11y',
    comment: 'Truly commented',
    filePath: '~/Downloads/Koa11y/Koa11y',
    chmod: true,
    icon: '~/Downloads/Koa11y/package.nw/_img/logo.png'
  },
  osx: {
    filePath: '~/Downloads/Koa11y.app'
  }
});

console.log(success);
