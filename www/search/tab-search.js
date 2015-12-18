angular.module('SearchController', [])

.controller('SearchCtrl', function(
  $scope, $state, $rootScope, $q, $location, 
  localStorageService, GoogleMaps, Meetups, 
  $cordovaGeolocation) {


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
        console.log('places ::> ', places);
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

        fixRoutingAddress(pointB).then(function(result){
            $scope.pointBError = false;
            $scope.typeError = false;

            // obj for meetups on Search View
            var placesObj = $scope.places;

            // if meetup is true, return 
            function isPlaceSelected(place) {
              if (place.checked) {
                return place;
              }
            }

            // check if meetup places are all NOT checked
            function isAllFalse(meetup) {
                return !meetup.checked;
            }

            var allFalseMeetups = placesObj.every(isAllFalse);

            // taking place object, filtering, and just returning id
            var typeID = placesObj.filter(isPlaceSelected).map(function(place){
              return place.id;
            });

            // first check if both PointB && meetups exist
            if (
              (pointB.length == 0 && $scope.places.length == 0) || 
              (pointB.length == 0 && allFalseMeetups)
               ) {

              $scope.pointBError = true;
              $scope.pointBErrorMessage = 'Please type in a Point B location.';

              $scope.typeError = true;
              $scope.typeErrorMessage = 'Please select a meetup place.';

              return;
            }

            // if one is false, see if pointB.length == true
            if (pointB.length == 0) {
              $scope.pointBError = true;
              $scope.pointBErrorMessage = 'Please type in a Point B location.';
              return;
            }

            else if (allFalseMeetups) {

              $scope.typeError = true;
              $scope.typeErrorMessage = 'Please select a meetup place.';

              return;
            }

            // else, see if user has a type of place checked from Settings
            else if ($scope.places.length == 0) {

              $scope.typeError = true;
              $scope.typeErrorMessage = 'Please select a meetup place.';

              return;

            } 

            pointB = result;
            console.log('with commas ==> ',pointB);
            pointB = pointB.replace(/,/g ,'');
            if (pointB.indexOf('#') !== -1 ) {
              pointB.replace('#' ,'');
              console.log('no commas ==> ',pointB);
            }

            // reroute user to map page with query string
            if (pointA === undefined || pointA.length === 0) {
              $location.url('/tabs/map?pointA=undefined&pointB=' + pointB + '&typeID=' + typeID);
            } else {
              $location.url('/tabs/map?pointA=' + pointA + '&pointB=' + pointB + '&typeID=' + typeID); 
            } 
        });

       
          
    };

    function fixRoutingAddress(pointB) {
        var deferred = $q.defer();
        var styles = [{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}];

        // // Create a new StyledMapType object
        var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});
        
        // options for Google Maps
        var userLocation = localStorageService.get('userLocation');
        var myOptions = {
          zoom: 14,
          mapTypeControlOptions: {
          mapTypeId: [google.maps.MapTypeId.ROADMAP,'map_style']
          },
          center: userLocation, 
          disableDefaultUI: true
        }

        // google map
        map = new google.maps.Map(document.getElementById("testmap"), myOptions);

        var request = {
          placeId: pointB
        }

        var service = new google.maps.places.PlacesService(map);

        service.getDetails(request, function(place, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {

              console.log(place.formatted_address);
              var pointB = place.formatted_address;
              deferred.resolve(pointB);

          }
        });
        return deferred.promise;
    }

});