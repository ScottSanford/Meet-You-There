angular.module('MapController', [])

.controller('GoogleMapCtrl', function(
  $scope, $rootScope, $state, $q, $stateParams, $ionicLoading, 
  GoogleMaps, localStorageService, $ionDrawerVerticalDelegate, 
  $cordovaSms, $cordovaToast, $cordovaAppAvailability, 
  $cordovaInAppBrowser, $ionicPlatform, $cordovaGeolocation) {
  
      // bug fix for Blank Map when user taps on tab
      if ($state.current.name == 'tabs.map') {
        $rootScope.clickMap = function() {
          return;
        }
      }

      var directionsDisplay;
      var map;
      var marker;
      var service;
      var infowindow;
      var polyline = null;
      var userLocation;


      getUserLocation().then(function(userLocation){
          initialize(userLocation);
      });

      function getUserLocation() {

        // add loading icon
        $scope.loading = $ionicLoading.show({
            template: '<img src="common/img/coffee.GIF" class="loading-icon">' 
        });

        var deferred = $q.defer();


          $ionicPlatform.ready(function(){
              $cordovaGeolocation
                .getCurrentPosition()
                .then(function (position) {

                  userLocation = {
                      lat: position.coords.latitude, 
                      lng: position.coords.longitude
                  };

                  localStorageService.set('userLocation', userLocation);

                  deferred.resolve(userLocation);

              }, function(){
                  // if user does not give App access to GeoLocation
                  userLocation = {
                       lat: 33.8090, 
                       lng: -117.9190
                  }

                  localStorageService.set('userLocation', userLocation);

                  deferred.resolve(userLocation);


              });
          });
        
        $ionicLoading.hide();
        return deferred.promise;

      };

      function initialize(userLocation) {

        // set variables for parameters
        var pointA = $stateParams.pointA;
        var pointB = $stateParams.pointB;

        // fix bug issue when pointA=?pointB
        if (typeof pointA === 'undefined') {
          pointA = 'undefined';
        }

        $scope.pointB = pointB;

        // show basic map
        if (!$stateParams.pointB) {
          GoogleMaps.initGoogleMap(userLocation);
          $ionicLoading.hide();     

          // // save map to local storage for search view
        }

        if ($stateParams.pointB) {
          
          localStorageService.set('mapUrl', window.location.hash);
          var stringIDs    = $stateParams.typeID;
          var typeID       = stringIDs.split(',');
           
          GoogleMaps.initGoogleMap(userLocation);

          GoogleMaps.calcRoute(pLine, userLocation, googleMap.map, pointA, pointB, typeID).then(function(results){


            var mLocation = results[0].mLocation;

            getETA(mLocation); 
            $scope.results = results;

            results.forEach(function(value,i){
              if (value.rating == undefined) {
                value.rating = 0;
              }
              if (value.price_level == undefined) {
                value.price_level = 0;
              }
              var thumbIcon = 'thumbIcon';
              value[thumbIcon] = GoogleMaps.customMarker(value).thumb;
            });

            $ionicLoading.hide();

          }, function(error){
            console.log(error);

          });

          $ionicLoading.hide();
                
        }

        $scope.predicate  = 'rating';
        $scope.reverse    = true;
        $scope.ratingArrow      = true;
        $scope.priceArrow = true;

        $scope.order = function(predicate) {

          $scope.rateActive = false;
          $scope.priceActive = false;

          $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;

          if (predicate == 'rating') {
            $scope.ratingArrow = ($scope.predicate === predicate) ? !$scope.ratingArrow : false;
            $scope.rateActive = true;  
          
          } else {
            $scope.priceArrow = ($scope.predicate === predicate) ? !$scope.priceArrow : false; 
            $scope.priceActive = true;
          }

          $scope.predicate = predicate;

        };

        function getETA (midpoint) {

            var directionsService = new google.maps.DirectionsService();
            var start = pointA != "undefined" ? pointA : userLocation;
            var end = midpoint;

            var driving = google.maps.DirectionsTravelMode.DRIVING
            var travelLocalStorage = localStorageService.get('travelMode');
            
            var travelType = travelLocalStorage != null ? travelLocalStorage : driving

            var request = {
                origin: start,
                destination: end,
                travelMode: travelType
            };

            directionsService.route(request, function(response, status) {
              if (status == google.maps.DirectionsStatus.OK) {

                var eta = response.routes[ 0 ].legs[ 0 ].duration.text;
                $scope.eta = eta;
                
              }
            });

        }

        $scope.noresults = 'Sorry, no meetups found! Try adjusting the MeetPoint or search radius under the Settings tab.';

        // document.addEventListener("deviceready", function() {

          $scope.getMoreInfo = function(placeId) {
            
            GoogleMaps.googleGetPlaceDetails(placeId, googleMap.map).then(function(url) {

              var options = {
                location: 'yes',
                clearcache: 'yes',
                toolbarposition: 'top',
                closebuttoncaption: 'Close'
              };

              $cordovaInAppBrowser.open(url, '_system', options)
                    .then(function(event) {
                      // success
                    })
                    .catch(function(event) {
                      // error
                    });

            });
      
          };

          // }, false);

          document.addEventListener("deviceready", function() {

            $scope.openGoogleMapsApp = function(address) {

                var stringAddress = address.split(' ').join('+');

                var googleTravel = localStorageService.get('travelMode');
                var appleTravel = localStorageService.get('appleMode');

                var googleMode = googleTravel != null ? googleTravel : 'driving';
                var appleMode = appleTravel != null ? appleTravel : 'd';

                var googleScheme = 'comgooglemaps://?saddr=' + userLocation.lat + ',' + userLocation.lng + '&daddr=' + stringAddress + '&directionsmode=' + googleMode;
                var appleScheme  = 'http://maps.apple.com/?saddr=' + userLocation.lat + ',' + userLocation.lng + '&daddr=' + stringAddress + '&dirflg=' + appleMode;
                
                $cordovaAppAvailability.check('comgooglemaps://')
                  .then(function(){
                      navigator.startApp.start(googleScheme, function(message){
                        console.log(message);
                      });
                  }, function(){
                      navigator.startApp.start(appleScheme, function(message){
                        console.log(message);
                      });
                  });
            };
            
          });

      }; // initUserLocation();

      $scope.toggleDrawer = function() {
        $ionDrawerVerticalDelegate.toggleDrawer();
      }

      // $$ expensive ratings (put in service)
      $scope.ratingStates = [
        {stateOn: 'glyphicon-usd', stateOff: 'glyphicon-usd'},
        {stateOn: 'glyphicon-usd', stateOff: 'glyphicon-usd'},
        {stateOn: 'glyphicon-usd', stateOff: 'glyphicon-usd'},
        {stateOn: 'glyphicon-usd', stateOff: 'glyphicon-usd'},
        {stateOn: 'glyphicon-usd', stateOff: 'glyphicon-usd'}
      ]

      document.addEventListener("deviceready", function() {

        var options = {
          replaceLineBreaks: false, // true to replace \n by a new line, false by default
        };
       
        $scope.sendTextMessage = function(name, address) {

          var sms = {
            number: '', 
            message: "Meet You There:" + "\n" + name + "\n" + address
          }
       
          $cordovaSms
            .send(sms.number, sms.message, options)
            .then(function() {

            }, function(error) {

            });
        }

      });

});