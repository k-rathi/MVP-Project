angular.module('todo.map', ['uiGmapgoogle-maps', 'todo.services'])
  .controller('MapController', function($scope, GMap, $http) { 
    

    GMap.getGeolocation().then(function(geocoords) {
      $http.get('/api/items').then(function(response) {
        
        var initialData = response.data;
        
        $scope.markerData = initialData.map(function(marker) {
            return {id: marker.id, coords: {latitude: marker.lat, longitude: marker.long}, todo: marker.text};
        });

        $scope.displayInfo = function(marker) {
          console.log('this is displaying');
          if(marker.todo==='') {
            return "What do you want to do?";
          } else {
            return 'this is what you are doing';
          }
        };

        $scope.delete = function(marker) {
          console.log(marker);
          $scope.map.markers.splice($scope.map.markers.indexOf(marker),1);
          $http.post('api/remove', marker).then(function(response) {
            console.log(response);
          });
        }  
        
        $scope.coords = {latitude: geocoords.lat, longitude: geocoords.long};
        
        $scope.map = {
          center: {latitude: geocoords.lat, longitude: geocoords.long},
          zoom: 11,
          markers: $scope.markerData,
          events: {
            click: function (map, eventName, originalEventArgs) {
                console.log('have been clicked');
                var e = originalEventArgs[0];
                var lat = e.latLng.lat(),lon = e.latLng.lng();
                var marker = {
                    id: Date.now(),
                    coords: {
                        latitude: lat,
                        longitude: lon
                    },
                    todo: '',
                    tempParameters: {todo: this.todo}
                };

                $http.post('/api/items', marker).then(function(response) {
                  console.log(response.header);
                });
                $scope.map.markers.push(marker);
                console.log($scope.map.markers[0]);
                $scope.$apply();
            }
          }
        }
      });
    })



}).controller('infowindowTemplateController', function($scope) {
  console.log($scope.todo);
});