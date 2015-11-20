var express  = require('express'),
    config   = require('./config/config'),
    mongoose = require('mongoose'),
    glob     = require('glob'),
    Yakuza   = require('yakuza'),
    cheerio  = require('cheerio');

mongoose.connect(config.db);

var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var Movie    = require('../app/models/movie') ;

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

var app = express();
require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});


