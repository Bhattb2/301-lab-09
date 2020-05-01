'use strict';

require('dotenv').config();
const superagent = require('superagent');
const client = require('./client');


function weatherFunction (request, response){
  
    const { latitude, longitude } = request.query;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key}`;
    superagent.get(url).then(weatherResponse => {
      
      const data = weatherResponse.body.data;
      console.log(data)
      const results = data.map(item => {
        return new Weather(item)
      });
      response.send(results);
    
   })
        .catch(err => {
          console.log(err);
          response.status(500).send('Weather Broke');
        });
  
  }
   
  
  // WEATHER CONSTRUCTOR /////
  function Weather(day) {
      // console.log(day.forecast)
  this.forecast = day.weather.description;
  this.time = day.datetime;
  }
  

module.exports = weatherFunction; 