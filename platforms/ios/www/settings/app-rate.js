angular.module('AppRateService', [])

.factory('AppRate', function() {
  
  var prefs = {
     language: 'en',
     appName: 'Meet Me There',
     iosURL: '1061762897', 
     openStoreInApp: true
  } 

  return prefs;

});