angular.module('EmailComposerService', [])

.factory('EmailComposer', function() {
  
  var email = {
    to: 'ssanford@mediafly.com',
    cc: '',
    subject: 'Feedback for Meet Me There App',
    body: 'Dear App Developers,',
    isHtml: true
  } 

  return email;

});