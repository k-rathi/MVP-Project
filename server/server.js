var express = require('express');
var mongoose = require('mongoose');
var Q = require('q');
var itemController = require('./items/itemController.js');
var client = require('twilio')('AC69ee4dd4c54712695fd6ad31bab0c699', 'ee9687c4e88c9dea1595235d013c5d95');

var app = express();
app.use(express.static(__dirname + '/../client'));

var passport = require('passport');
var OAuth = require('passport-oauth').OAuthStrategy;
var session = require('express-session');
app.use(session({ secret: 'shhh its a secret' , resave: false, saveUninitialized: true})); // session secret
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost/Todos');

app.get('/', function(req, res) {
  res.render('index.html');
});

app.post('/api/users/signin', function(req, res) {
  res.send(req.user);
  res.send('received sign in');
});

app.post('/api/users/signup', function(req, res) {
  res.send('signing up');
});

app.post('/api/users/signout', function(req, res) {
  req.logOut(); 
  res.send('received sign out');
});

app.get('/api/users/signedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : 0); 
})



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

app.post('/api/twilio', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += Buffer(chunk).toString();
  }).on('end', function() {
    itemController.allItems({sentMessage: false}).then(function(todos) {
      data = JSON.parse(data);
      console.log(todos);
      var len = todos.length;
      todos.forEach(function(todo) {
        var distance = (Number(data.lat) - Number(todo.lat)) * (Number(data.lat) - Number(todo.lat)) + (Number(data.long) - Number(todo.long)) * (Number(data.long) - Number(todo.long));
        if(distance < 0.0009) {
          console.log('sending a message');
          client.sendMessage({
            body: todo.text + ' at ' + todo.location,
            to: '+14083916950',
            from: '+16692717093'
          }, function(error, response) {
            if(error) {
              console.log(error);
            }
            todo.sentMessage = true;
            todo.save();
            console.log('got my message');
            res.end('something');
          })
        }
      });
      res.end('nothing');
      // res.send('hello');
    })
    // res.send('hello');
  });
});

app.listen(8000);

module.exports = app;