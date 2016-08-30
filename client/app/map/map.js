angular.module('todo.map', ['uiGmapgoogle-maps', 'todo.services'])
  .controller('MapController', function($scope, GMap) { 
    GMap.getGeolocation().then(function(geocoords) {
      $scope.coords = {latitude: geocoords.lat, longitude: geocoords.long};
      $scope.map = {
        center: {latitude: geocoords.lat, longitude: geocoords.long},
        zoom: 11,
        markers: [],
        events: {
          click: function (map, eventName, originalEventArgs) {
              console.log('have been clicked');
              var e = originalEventArgs[0];
              var lat = e.latLng.lat(),lon = e.latLng.lng();
              var marker = {
                  id: 1,
                  coords: {
                      latitude: lat,
                      longitude: lon
                  },
                  options: {labelClass:'marker_labels',labelAnchor:'12 60',labelContent:'m'}
              };
              $scope.map.markers.push(marker);
              console.log($scope.map.markers);
              $scope.$apply();
          }
        }
      }
    })
});
