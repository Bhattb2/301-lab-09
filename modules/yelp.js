'use strict';

require('dotenv');
const superagent = require('superagent');
const client = require('./client');


function yelpFunction (request, response){

    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
    
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`; 
      return superagent.get(yelpUrl)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(data => {
        console.log(data.body)
          let yelpResult = data.body.businesses.map( yelp => {
          return new YelpData(yelp);
          });
          // console.log('yelp data', yelpData)
  
          response.status(200).json(yelpResult);
  
  // YELP ERROR HANDLER /////
      })
      .catch(err => {
        console.log(err);
        response.status(500).send('Yelp is yelping');
      });
  }
  
  // YELP CONSTRUCTOR /////
  function YelpData(city) {
    this.name = city.name,
    this.image_url = city.image_url,
    this.price = city.price,
    this.rating = city.rating,
    this.url = city.url;
  }


  module.exports = yelpFunction;