angular.module('todo.map', ['uiGmapgoogle-maps', 'todo.services', 'ngMaterial'])
  .config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyC9yAkR7DCOXR7JJ3EE11NOeusD5NgfMHM',
      v: '3.20', //defaults to latest 3.X anyhow
      libraries: 'places' // Required for SearchBox.
    });
  }])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put('searchbox.tpl.html', '<input id="pac-input" class="pac-controls" type="text" placeholder="Search">');
  }])
  .controller('MapController', function($scope, GMap, $http, $mdDialog) {
    var geocoder = new google.maps.Geocoder;

    var parseTime = function(timeString) {

      timeString = timeString.trim().split(':');

      if (timeString[1].match(/pm/i)) {
        timeString[0] = Number(timeString[0]) + 12;
      }

      timeString[1].replace(/\s*[a,A,p,P][m,M]/i, '');
      timeString[1] = Number(timeString[1]);

      return timeString;
    };

    var getGeocode = function(geocoder, marker, cb) {

      geocoder.geocode({ 'location': { lat: Number(marker.coords.latitude), lng: Number(marker.coords.longitude) } }, function(results, status) {
        cb(results[0].formatted_address);
      });
    };

    var checkTwilio = function() {
      GMap.getGeolocation().then(function(geocoords) {
        console.log(geocoords);
        $http.post('/api/twilio', geocoords).then(function(results) {
          console.log(results);
        })
      })
    };
    
    $scope.myMarker = {
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    };

    setInterval(checkTwilio, 4000);
    // setInterval(function() {})
    // $scope.searchbox = {
    //   template: 'searchbox.tpl.html',

    //   options: {
    //     autocomplete: true
    //   },

    //   events: {
    //     places_changed: function(autoComplete) {
    //       place = autoComplete.getPlaces()
    //     }
    //   }
    // };

    var stringifyTime = function(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var timeString = '';
      if (minutes < 10) {
        timeString = ':0' + minutes;
      } else {
        timeString = ':' + minutes;
      }

      if (hours > 12) {
        timeString = timeString.concat(' PM');
        hours = hours % 12;
      } else {
        timeString = timeString.concat(' AM');
      }
      timeString = hours.toString() + timeString;
      return timeString;
    }

    $scope.monthToString = function(monthNumber) {
      var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return monthNames[monthNumber];
    }

    $scope.showPrompt = function(ev, marker) {
      var confirm = $mdDialog.prompt()
        .textContent('')
        .placeholder('What do you want to do?')
        .ariaLabel('todo')
        .targetEvent(ev)
        .ok('Okay!')
        .cancel('Never mind');
      var checkDate = $mdDialog.prompt()
        .textContent('')
        .placeholder('What day do you want to do it by?')
        .ariaLabel('tododate')
        .targetEvent(ev)
        .ok('Okay!')
        .cancel('Never mind');
      var checkWhen = $mdDialog.prompt()
        .textContent('')
        .placeholder('When do you wnat to do it?')
        .ariaLabel('todotime')
        .targetEvent(ev)
        .ok('Okay!')
        .cancel('Never mind');
      return $mdDialog.show(confirm).then(function(result) {
        console.log(result);
        return $mdDialog.show(checkDate).then(function(date) {
          console.log(date);
          return $mdDialog.show(checkWhen).then(function(time) {
            console.log(time);
            return [result, date, time];
          });
        });
      });
    };

    $scope.displayInfo = function(marker, ev) {
      if (marker.todo === undefined) {
        return $scope.showPrompt(ev, marker).then(
          function(result) {
            return result;
          });
      }
    };

    $scope.delete = function(marker) {
      console.log(marker);
      $scope.map.markers.splice($scope.map.markers.indexOf(marker), 1);
      $http.post('api/remove', marker).then(function(response) {
        console.log(response);
      });
    };

    GMap.getGeolocation().then(function(geocoords) {
      $http.get('/api/items').then(function(response) {

        var initialData = response.data;

        $scope.markerData = initialData.map(function(marker) {
          marker.date = new Date(marker.date);
          console.log(marker.date);
          return { id: marker.id, coords: { latitude: marker.lat, longitude: marker.long }, time: marker.time, date: marker.date, todo: marker.text, location: marker.location };
        });

        $scope.coords = { latitude: geocoords.lat, longitude: geocoords.long };

        $scope.map = {
          center: { latitude: geocoords.lat, longitude: geocoords.long },
          zoom: 11,
          markers: $scope.markerData,
          events: {
            click: function(map, eventName, originalEventArgs) {
              console.log('have been clicked');
              var e = originalEventArgs[0];
              var lat = e.latLng.lat(),
                lon = e.latLng.lng();
              var marker = {
                id: Date.now(),
                coords: {
                  latitude: lat,
                  longitude: lon
                },
              };
              $scope.displayInfo(marker).then(function(results) {
                getGeocode(geocoder, marker, function(geoval) {

                  marker.location = geoval;
                  marker.todo = results[0];

                  marker.date = new Date(results[1]);

                  var time = parseTime(results[2]);
                  marker.date.setHours(time[0]);
                  marker.date.setMinutes(time[1]);
                  marker.time = stringifyTime(marker.date);

                  $http.post('/api/items', marker).then(function(response) {
                    console.log('responded');
                    $scope.map.markers.push(marker);
                    // $scope.$apply();
                  });
                });
              });

            }
          }
        }
      });
    })
  });
