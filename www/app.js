// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mmtApp', [
  'ionic', 
  'SearchController',
  'MapController',
  'SettingsController',
  'GoogleMapsService', 
  'AppRateService',
  'EmailComposerService',
  'meetups', 
  'uiGmapgoogle-maps',
  'ngCordova', 
  'ui.bootstrap', 
  'ngAnimate', 
  'ionic.contrib.drawer.vertical', 
  'LocalStorageModule', 
  'ngCordova.plugins.appRate', 
  'ngIOS9UIWebViewPatch', 
  'ion-autocomplete'
])


.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
            $ionicPopup.confirm({
                title: "Internet Disconnected",
                content: "The internet is disconnected on your device."
            })
            .then(function(result) {
                if(!result) {
                    ionic.Platform.exitApp();
                }
            });
        }
    }

  });
})

.config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider, $cordovaAppRateProvider) {

  uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.20', //defaults to latest 3.X anyhow
      libraries: 'places' // Required for SearchBox.
  });

  $stateProvider
    .state('tabs', {
      url:'/tabs',
      abstract: true,
      cache: false,
      templateUrl: 'common/tabs.html'
    })
    .state('tabs.search', {
      cache: true,
      url: '/search',
      views: {
        'tabs-search': {
          templateUrl: 'search/tab-search.html',
          controller: 'SearchCtrl'
        }
      }
    })
    .state('tabs.map', {
        cache: false,
        url: '/map?pointA&pointB&typeID',
        views: {
          'tabs-map': {
            templateUrl: 'map/tab-map.html',
            controller: 'GoogleMapCtrl'
          }
        }
    })
    .state('tabs.settings', {
      url: '/settings',
      cache: true,
      views: {
        'tabs-settings': {
          templateUrl: 'settings/tab-settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('tabs.meetups', {
      url: '/meetups',
      views: {
        'tabs-settings': {
          templateUrl: 'settings/meetups.html', 
          controller: 'SettingsCtrl'
        }
      }
    })    
    .state('tabs.change', {
      url: '/change',
      views: {
        'tabs-settings': {
          templateUrl: 'settings/midpoint-change.html', 
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('tabs.radius', {
      url: '/radius',
      views: {
        'tabs-settings': {
          templateUrl: 'settings/radius-range.html', 
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('tabs.travel', {
      url: '/travel',
      views: {
        'tabs-settings': {
          templateUrl: 'settings/travel-mode.html', 
          controller: 'SettingsCtrl'
        }
      }
    })    
    .state('tabs.favorites', {
      url: '/favorites',
      views: {
        'tabs-settings': {
          templateUrl: 'settings/favorites.html', 
          controller: 'SettingsCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  // default to map view to initiate GeoLocation
  $urlRouterProvider.otherwise('/tabs/map');

});
