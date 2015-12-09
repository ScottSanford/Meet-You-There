angular.module('meetups', [])

.factory('Meetups', function() {
  return {
      types:[
          {
          "name": "Cafe",
          "plural": "Cafes",
          "id": "cafe",
           "checked": true, 
         },        
         {
          "name": "Restaurant",
          "plural": "Restaurants",
          "id": "restaurant",
           "checked": true, 
         }, 
         {
          "name": "Bar",
          "plural": "Bars",
          "id": "bar",
           "checked": true, 
         },        
         {
          "name": "Grocery",
          "plural": "Groceries",
          "id": "grocery_or_supermarket",
          "checked": false, 
        },
        {
          "name": "Gym",
          "plural": "Gyms",
          "id": "gym",
          "checked": false, 
        },
        {
          "name": "Movie Theater",
          "plural": "Movie Theaters",
          "id": "movie_theater",
           "checked": false, 
         },               
         {
          "name": "Police",
          "plural": "Bars",
          "id": "police",
           "checked": false, 
         },        
         {
          "name": "ATM",
          "plural": "ATMs",
          "id": "atm",
           "checked": false, 
         },        
         {
          "name": "Gas Station",
          "plural": "Gas Stations",
          "id": "gas_station",
           "checked": false, 
         }
        ] 
  }
});