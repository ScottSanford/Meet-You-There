angular.module('SearchController', [])

.controller('SearchCtrl', function($scope, $state, $rootScope, $q, $location, localStorageService, Meetups, $cordovaGeolocation, GoogleMaps) {


    // reroute user to Map Tab
    $scope.$on('$ionicView.afterEnter', function(){
      $rootScope.clickMap = function() {

        var lsUrl = localStorageService.get('mapUrl');
        console.log('search ==> ', lsUrl);
        
        if (lsUrl === '#/tabs/search' || lsUrl === '#/tabs/settings') {
          console.log('Local Stroage change on me!! :( ');
          $location.url('/tabs/map');
          return;
        }

        if (lsUrl) {

          var url = lsUrl.substring(2);
          $location.url(url);

        } else {

          $location.url('/tabs/map');

        }
      }  
    });


    // check to see if Local Storage has MeetupList
    checkLocalStorage();

    function checkLocalStorage() {
        var meetups = localStorageService.get('meetupList');
        if (meetups == null) {
          localStorageService.set('meetupList', Meetups.types);
        }   
    }


    displayUserAddress().then(function(address){

      $scope.userLocation = address;

    });      
  

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

    };

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

    };


    function getLSItems() {
        return localStorageService.get('meetupList').filter(function(meetup){
          return meetup.checked;
        });
    };

    $scope.$on('$ionicView.afterEnter', function(){

      $scope.places = getLSItems();
      
    });


    // ngClick 'Meet Me There' Button
    $scope.getDirections = function(pointA, pointB) {

        // obj for meetups on Search View
        var placesObj = $scope.places;

        // if meetup is true, return 
        function isPlaceSelected(place) {
          if (place.checked) {
            return place;
          } else {
            console.log('error, please select!');
            $scope.typeError = true;
            $scope.typeErrorMessage = 'Please select a meetup place.';
            return;
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
          // console.log($scope.place);
          $scope.pointBError = true;
          $scope.pointBErrorMessage = 'Please type in a Point B location.';
          return;
        } else if (pointA === undefined || pointA.length === 0) {
          $location.url('/tabs/map?pointA=undefined&pointB=' + pointB + '&typeID=' + typeID);
        } else {
          $location.url('/tabs/map?pointA=' + pointA + '&pointB=' + pointB + '&typeID=' + typeID); 
        } 
          
    };

});