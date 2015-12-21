angular.module('SettingsController', [])

.controller('SettingsCtrl', function(
  $scope, $rootScope, $state, $location, 
  localStorageService,  EmailComposer, Meetups, AppRate,
  $cordovaEmailComposer, $cordovaAppRate, $cordovaDialogs) {

  // reroute user to Map Tab
  $scope.$on('$ionicView.afterEnter', function(){

    $rootScope.clickMap = function() {

      var lsUrl = localStorageService.get('mapUrl');

      if (lsUrl === '#/tabs/settings' || lsUrl === '#/tabs/search') {
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

  // **** NEW FEATURE TO BE ADDED LATER**** ////////////////////////////
  // Save Work and Home Address

  // var home = localStorageService.get('home');
  // var work = localStorageService.get('work');

  // if (home == undefined) {
  //   $scope.userHomeAddress = 'Enter your home address';
  // } 

  // if (work == undefined) {
  //   $scope.userWorkAddress = 'Enter your work address'; 
  // } else {

  //   var homeAdd = localStorageService.get('home').formatted_address;
  //   var workAdd = localStorageService.get('work').formatted_address;

  //   $scope.userHomeAddress = homeAdd;
  //   $scope.userWorkAddress = workAdd;

  // }

  // $scope.saveChanges = function(homeAddress, workAddress) {
  //   console.log("Home Address :: " , homeAddress);
  //   console.log("Work Address :: " , workAddress);
  //   localStorageService.set('home', homeAddress);
  //   localStorageService.set('work', workAddress);
  // }


  // Meetup Logic Starts here
  // Meetup View

  function initMeetupList() {

      var lsKeys = localStorageService.deriveKey();
      var meetupPlaces = localStorageService.get('meetupList');

      for (var i=0; i< lsKeys.length; i++) {

        if (meetupPlaces) {

          var lsList = localStorageService.get('meetupList');
          return lsList;

        } else {

          localStorageService.set('meetupList', Meetups.types);
          return Meetups.types;

        }
      }    
  };

  $scope.meetups = initMeetupList();

  $scope.updateLocalStorage = function(meetup) {

    var meetupList = localStorageService.get('meetupList');

    meetupList.forEach(function(m){
      if (m.id === meetup.id) {
        m.checked = meetup.checked;
      }
    })

    localStorageService.set('meetupList', meetupList);

  };

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// TRAVEL MODE VIEW /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

  $scope.travelModes = [
      {
        text: 'Driving', 
        value: google.maps.TravelMode.DRIVING,
        appleValue: 'd'
      },
      {
        text: 'Transit', 
        value: google.maps.TravelMode.TRANSIT,
        appleValue: 'r'
      },    
      {
        text: 'Walking', 
        value: google.maps.TravelMode.WALKING,
        appleValue: 'w'
      },
      {
        text: 'Bicycling', 
        value: google.maps.TravelMode.BICYCLING, 
        appleValue: 'd'
      }
  ];

  var travelLS = localStorageService.get('travelMode');
  $scope.radio = {
    checked: travelLS !== null ? travelLS : google.maps.TravelMode.DRIVING 
  }

  $scope.changedTravelMode = function(mode, apple) {
    
    localStorageService.set('travelMode', mode);
    localStorageService.set('appleMode', apple);

  }

  /////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////// RADIUS RANGE  VIEW ///////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  $scope.changedRadiusRange = function(range) {

    localStorageService.set('radiusRange', range);
    
  }

  var rRange = localStorageService.get('radiusRange');

  $scope.radiusRange = rRange !== null ? rRange : 1600;

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// CUSTOMIZE MIDPOINT VIEW //////////////////////////
///////////////////////////////////////////////////////////////////////////////

  $scope.changedMidpoint = function(midpoint) {

    localStorageService.set('midpointPercentage', midpoint);

  }

  var mpPercentage = localStorageService.get('midpointPercentage');

  $scope.midpointPercentage = mpPercentage !== null ? mpPercentage : 50;

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// RATE APP /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

    // document.addEventListener('deviceready', function(){

        // Rate the App
        $scope.rateApp = function() {

          $cordovaAppRate.promptForRating(true).then(function(){

            $cordovaAppRate.setPreferences(AppRate);

          }, function(){
            console.log('Oops! Something went wrong :(');
          });


        }

    // });

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// EMAIL VIEW ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


  document.addEventListener('deviceready', function(){

    // Give Feedback 
    $scope.giveFeedback = function() {

      $cordovaEmailComposer.isAvailable().then(function(){

        $cordovaEmailComposer.open(EmailComposer).then(function(){

        });

      }, function(){
        console.log('Error, the plugin is not available');
      });

    }

  });


})

// fix for Travel Mode ion radio buttons
.directive('ionRadioFix', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    transclude: true,
    template:
      '<label class="item item-radio">' +
        '<input type="radio" name="radio-group">' +
        '<div class="radio-content">' +
          '<div class="item-content disable-pointer-events" ng-transclude></div>' +
          '<i class="radio-icon disable-pointer-events icon ion-checkmark"></i>' +
        '</div>' +
      '</label>',

    compile: function(element, attr) {
      if (attr.icon) {
        var iconElm = element.find('i');
        iconElm.removeClass('ion-checkmark').addClass(attr.icon);
      }

      var input = element.find('input');
      angular.forEach({
          'name': attr.name,
          'value': attr.value,
          'disabled': attr.disabled,
          'ng-value': attr.ngValue,
          'ng-model': attr.ngModel,
          'ng-disabled': attr.ngDisabled,
          'ng-change': attr.ngChange,
          'ng-required': attr.ngRequired,
          'required': attr.required
      }, function(value, name) {
        if (angular.isDefined(value)) {
            input.attr(name, value);
          }
      });

      return function(scope, element, attr) {
        scope.getValue = function() {
          return scope.ngValue || attr.value;
        };
      };
    }
  };
});

