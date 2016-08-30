var express = require('express');
var mongoose = require('mongoose');

var app = express();
app.use(express.static(__dirname + '/../client'));

mongoose.connect('mongodb://localhost/Todos');

app.post('/api/users/signin', function(req, res) {
  res.send('received sign in');
});

app.post('/api/users/signup', function(req, res) {
  res.send('received sign up');
});


app.listen(8000);

module.exports = app;