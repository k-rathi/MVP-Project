var Q = require('q');
var Item = require('./itemModel.js');


var findItem = Q.nbind(Item.findOne, Item);
var createItem = Q.nbind(Item.create, Item);
var findAllItems = Q.nbind(Item.find, Item);
var removeItem = Q.nbind(Item.remove, Item);

module.exports = {
  allItems: function(obj) {
    return findAllItems(obj);
  },
  oneItem: function(req, res, next) {
    return findItem();
  },
  deleteItem: function(data) {
    data = JSON.parse(data);
    console.log(data.id);
    return removeItem({id: data.id});
  }, 

  newItem: function(data) {

    return findItem({id : data.id}).then(function(match) {
      if(match) {     
        console.log('we have a match');
        res.send(match);
      } else {
        var item = data;
        item = JSON.parse(item);
        console.log(item);
        var newItem = {
          id: item.id,
          date: item.date,
          time: item.time,
          location: item.location,
          lat: item['coords'].latitude,
          long: item['coords'].longitude,
          text: item.todo,
          sentMessage: false
        }
        console.log(newItem);
        return createItem(newItem);
      }
    }).then(function(newItem) {
      if(newItem) {
        console.log('new Item', newItem);
        return newItem;
      }
    }).fail(function(error) {
      console.log(error);
      return error;
    });
    // console.log(newItem);

  }
}