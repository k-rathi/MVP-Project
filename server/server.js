var express = require('express');
var mongoose = require('mongoose');
var Q = require('q');
var itemController = require('./items/itemController.js');


var app = express();
app.use(express.static(__dirname + '/../client'));

mongoose.connect('mongodb://localhost/Todos');

// var createItem = Q.nbind(Item.create, Item);

app.post('/api/users/signin', function(req, res) {
  res.send('received sign in');
});

app.post('/api/users/signup', function(req, res) {
  res.send('received sign up');
});
app.post('/api/remove', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += Buffer(chunk).toString();
  }).on('end', function() {
    console.log(data);
    itemController.deleteItem(data).then(function() {
      res.send('deleted');
    });
  });
});
app.post('/api/items', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += Buffer(chunk).toString();
  }).on('end', function() {
    itemController.newItem(data).then(function(newData) {
      res.json(newData);
    })
  });
});

app.get('/api/items', function(req, res) {
  itemController.allItems().then(function(data) {
    res.send(data);
  });
});

app.listen(8000);

module.exports = app;