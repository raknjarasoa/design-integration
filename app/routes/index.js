const path = require('path');
const pugDir = path.resolve('./app/views/pages/');

module.exports = function (app) {

  app.get('/foo', function(req, res) {
    res.render(pugDir + path.sep + 'a.pug');
  });

  app.get('/json', function (req, res) {
    res.json({ custom: 'response' });
  });

};
