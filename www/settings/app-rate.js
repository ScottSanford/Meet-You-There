angular.module('AppRateService', [])

.factory('AppRate', function() {
  
  var prefs = {
     language: 'en',
     appName: 'Meet Me There',
     iosURL: 'com.mediafly.meet-you-there', 
     openStoreInApp: true
  } 

  return prefs;

});