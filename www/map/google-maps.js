angular.module('GoogleMapsService', [])

.factory('GoogleMaps', function($q, localStorageService) {
  
  var totalDist = 0;

  var GoogleMaps = {
    POI: null, 
    pLine: null
  }; 

      GoogleMaps.initGoogleMap = function(userLocation) {

          directionsDisplay = new google.maps.DirectionsRenderer();

          var styles = [{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}];

          // // Create a new StyledMapType object
          var styledMap = new google.maps.StyledMapType(styles,
          {name: "Styled Map"});
          
          // options for Google Maps
          var myOptions = {
            zoom: 14,
            mapTypeControlOptions: {
            mapTypeId: [google.maps.MapTypeId.ROADMAP,'map_style']
            },
            center: userLocation, 
            disableDefaultUI: true
          }

          // google map
          map = new google.maps.Map(document.getElementById("map"), myOptions);

          map.mapTypes.set('map_style', styledMap);
          map.setMapTypeId('map_style');

          // place marker on GeoLocation
          marker = new google.maps.Marker({
            position: userLocation, 
            map: map
          });

          var infowindow = new google.maps.InfoWindow();

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent("You are here!"); 
            infowindow.open(map,marker);
          });

          // polyline for later use of MidPoint
          polyline = new google.maps.Polyline({
            path: [],
            strokeColor: '#FF0000',
            strokeWeight: 0
          });

          // // show directions
          directionsDisplay.setMap(map);

          pLine = polyline;
          map = map;

          // return variables for other functions
          return googleMap = {
              pLine: pLine,
              map: map
          };  

      };

      GoogleMaps.calcRoute = function (pLine, userLocation, map, pointA, pointB, typeID) {

          var deferred = $q.defer();
          var directionsService = new google.maps.DirectionsService();
          var start = pointA !== 'undefined' ? pointA : userLocation;
          var end = pointB;

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
              pLine.setPath([]);
              var bounds = new google.maps.LatLngBounds();

              directionsDisplay.setDirections(response);

              // set PolyLine on Google Map
              var path = response.routes[0].overview_path;
              var legs = response.routes[0].legs;
              for (i=0;i<legs.length;i++) {
                var steps = legs[i].steps;
                for (j=0;j<steps.length;j++) {
                  var nextSegment = steps[j].path;
                  for (k=0;k<nextSegment.length;k++) {
                    pLine.getPath().push(nextSegment[k]);
                    bounds.extend(nextSegment[k]);
                  }
                }
              }


              pLine.setMap(map);

              deferred.resolve(GoogleMaps.computeTotalDistance(pLine, response, map, typeID));

            } 

          });    
          return deferred.promise;                 
      };

      GoogleMaps.createMarker = function(latlng, label, map) {
        var contentString = '<b>'+label+'</b>';
        var marker        = new google.maps.Marker({
            position: latlng,
            map: map,
            title: label,
            zIndex: 100000000, 
            icon: 'common/img/marker.png'

        });
        marker.myname  = label;
        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(contentString+"<br>"); 
            infowindow.open(map,marker);
            });
        return marker;
      }; 

      GoogleMaps.computeTotalDistance = function(pLine, response, map, typeID) {

          totalDist = 0;
          var myroute = response.routes[0];
          for (i = 0; i < myroute.legs.length; i++) {
            totalDist += myroute.legs[i].distance.value;
          }

          var midpointPercentage = localStorageService.get('midpointPercentage');

          var percentage = midpointPercentage !== null ? midpointPercentage : 50;

          return GoogleMaps.putMarkerOnRoute(pLine, percentage, map, typeID);

          // totalDist = totalDist / 1000;
      };

      GoogleMaps.putMarkerOnRoute = function(pLine, percentage, map, typeID) {

        var distance = (percentage/100) * totalDist;
        var marker;
        var midpoint = pLine.GetPointAtDistance(distance);

        if (!marker) {

            marker = GoogleMaps.createMarker(midpoint,"MeetPoint", map);
            return GoogleMaps.googleNearbySearch(midpoint, map, typeID);

        } else {                

            marker.setPosition(midpoint);
            return GoogleMaps.googleNearbySearch(midpoint, map, typeID);

        }
      };

      GoogleMaps.googleNearbySearch = function(midpoint, map, typeID) {
        var deferred = $q.defer();
        var service;
        var lsRadius = localStorageService.get('radiusRange');
        var request = {
          location: midpoint, 
          radius: lsRadius != null ? lsRadius : 800, // .50 mile radius
          types: typeID
        }

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, function(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {

              var mLocation = 'mLocation';
              
              var POI = results[i];

              // push midpoint location into object
              POI[mLocation] = request.location;

              var scopePOI = results;

              deferred.resolve(scopePOI);
              
              GoogleMaps.addPOIMarker(POI, map);
            }
          }

        });
        return deferred.promise;

      };

      GoogleMaps.googleGetPlaceDetails = function(id, map) {
        var deferred = $q.defer();

        var request = {
          placeId: id
        }

        service = new google.maps.places.PlacesService(map);

        service.getDetails(request, function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          deferred.resolve(place.url);

        }
        });
        return deferred.promise;
      };

      GoogleMaps.addPOIMarker = function(POI, map) {
          var marker;
          var placeLoc = POI.geometry.location;

          marker   = new google.maps.Marker({
            map: map,
            position: placeLoc,
            icon: {
              url: GoogleMaps.customMarker(POI).marker
            }, 
            zIndex: 1
          });
          infowindow = new google.maps.InfoWindow();
   
  
          google.maps.event.addListener(marker, 'click', function() {
              infowindow.close();
              var link = GoogleMaps.googleGetPlaceDetails(POI.place_id, map).then(function(url){
                  var popupContent =  '<div>' + 
                                        '<div class="marker-name">' + POI.name + '</div>' +   
                                        '<div>' + POI.vicinity + '</div>' +
                                        '<a class="more-info" href="' + url + '"><i class="ion ion-ios-information"></i></a>' +
                                      '</div>';
                  infowindow.setContent(popupContent);
              });
              infowindow.open(map, this);
          });


      };


      GoogleMaps.midPoint = function(midpoint) {
        return midpoint;
      };

      GoogleMaps.customMarker = function(POI) {
          var images = {
            marker: null, 
            thumb: null
          }
          for (var i = 0; i < POI.types.length; i++) {
            if (
              (POI.types[i] === 'restaurant') ||
              (POI.types[i] === 'meal_takeaway') ||
              (POI.types[i] === 'meal_delivery') ||
              (POI.types[i] === 'food')
              ) {
              images.marker = 'common/img/restaurant.png';
              images.thumb = 'common/img/thumb_restaurant.png'
              return images;
            }           
            else if (
              (POI.types[i] === 'cafe') ||
              (POI.types[i] === 'bakery')
              ) {
              images.marker = 'common/img/cafe.png';
              images.thumb = 'common/img/thumb_cafe.png'
              return images;
            }              
            else if (
              (POI.types[i] === 'grocery_or_supermarket') ||
              (POI.types[i] === 'liquor_store') ||
              (POI.types[i] === 'store') ||
              (POI.types[i] === 'home_goods_store') ||
              (POI.types[i] === 'jewelry_store')
              ) {
              images.marker = 'common/img/grocery.png';
              images.thumb = 'common/img/thumb_grocery.png'
              return images;
            }          
            else if (
              (POI.types[i] === 'gym') ||
              (POI.types[i] === 'health')
              ) {
              images.marker = 'common/img/gym.png';
              images.thumb = 'common/img/thumb_gym.png'
              return images;
            } 
            else if (
              (POI.types[i] === 'movie_theater') ||
              (POI.types[i] === 'movie_rental')
              ) {
              images.marker = 'common/img/movies.png';
              images.thumb = 'common/img/thumb_movies.png'
              return images;
            } 
            else if (
              (POI.types[i] === 'bar') ||
              (POI.types[i] === 'night_club')
              ) {
              images.marker = 'common/img/bar.png';
              images.thumb = 'common/img/thumb_bar.png'
              return images;
            }              
            else if (POI.types[i] === 'bowling_alley') {
              images.marker = 'common/img/bowling.png';
              images.thumb = 'common/img/thumb_bowling.png'
              return images;
            }             
            else if (POI.types[i] === 'amusement_park') {
              images.marker = 'common/img/themepark.png';
              images.thumb = 'common/img/thumb_themepark.png'
              return images;
            }
            else if (
              (POI.types[i] === 'atm') ||
              (POI.types[i] === 'bank')
              ) {
                images.marker = 'common/img/atm.png';
                images.thumb = 'common/img/thumb_atm.png'
                return images;
            }              
            else if (POI.types[i] === 'police') {
                images.marker = 'common/img/police.png';
                images.thumb = 'common/img/thumb_police.png'
                return images;
            }             
            else if (POI.types[i] === 'gas_station') {
                images.marker = 'common/img/gas.png';
                images.thumb = 'common/img/thumb_gas.png'
                return images;
            }         
          };
      }

  return GoogleMaps;

});