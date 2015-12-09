angular.module('SearchController', [])

.controller('SearchCtrl', function($scope, $state, $rootScope, $q, $location, localStorageService, Meetups, $cordovaGeolocation, GoogleMaps) {

    // reroute user to Map Tab
    $rootScope.clickMap = function() {
      $location.url('/tabs/map');
    } 
    displayUserAddress().then(function(address){
      $scope.userLocation = address;
    })
    function displayUserAddress() {
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder;

      var lsUserLocation = localStorageService.get('userLocation');

      var request = {
        'location': lsUserLocation
      }

            geocoder.geocode(request, function(results, status){
               if (status === google.maps.GeocoderStatus.OK) {
                  for (var i = 0; i <= results.length; i++) {
                    if (i == 0) {
                      var address = results[0].formatted_address;                
                    }
                  }
                    deferred.resolve(address);
               }
            });

      return deferred.promise;

    }

    $scope.pointB = '';
    var places;

    var displaySuggestions = function(predictions, status) {

      var results = [];

      predictions.forEach(function(prediction) {
        results.push(prediction);
      });

      places = results;
      return places;

    };


    $scope.getPlaces = function(query) {
      
      var service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: query || 'ch' }, displaySuggestions);

      if (query) {
        return {
          results: places         
        }
      }

    };

    function fillInAddress() {


      var place = autocomplete.getPlacePredictions({input: query});

    }

    function geolocate() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          });
          autocomplete.setBounds(circle.getBounds());
        });
      }
    }

    function initLocalStorageMeetupPlaces() {

        localStorageService.set('meetupList', Meetups.types);
        getLSItems();

    }

    function getLSItems() {
        return localStorageService.get('meetupList').filter(function(meetup){
          return meetup.checked;
        });
    }


    function displayOnlyActiveMeetups() {

      var meetupPlaces = localStorageService.get('meetupList');
      
      if (meetupPlaces == null) {
        return initLocalStorageMeetupPlaces();
      }
      return getLSItems();

    }

    $scope.places = displayOnlyActiveMeetups();

    $scope.getDirections = function(pointA, pointB) {
      // obj for meetups on Search View
      var placesObj = $scope.places;

      // if meetup is true, return 
      function isPlaceSelected(place) {
        if (place.checked) {
          return place;
        }
      }

      // taking place object, filtering, and just returning id
      var typeID = placesObj.filter(isPlaceSelected).map(function(place){
        return place.id;
      });

      // clear alert message when there is an option 
      if (pointB.length > 0) {
        $scope.alertMessage = '';
      }

      // reroute user to map page with query string
      if (pointB.length == 0) {
        $scope.error = true;
        $scope.alertMessage = 'Please type in a Point B location.';
        return;
      }
      else if (pointA === undefined || pointA.length === 0) {
        $location.url('/tabs/map?pointA=undefined&pointB=' + pointB + '&typeID=' + typeID);
      } 
      else {
        $location.url('/tabs/map?pointA=' + pointA + '&pointB=' + pointB + '&typeID=' + typeID); 
      } 
    };

});