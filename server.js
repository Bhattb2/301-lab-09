'use strict';

// REQUIRE LIBRARIES /////
require('dotenv').config();
const express = require('express'); 
const cors = require('cors');
const app = express();
const pg = require('pg');
const client = require ('./modules/client');

// INTERACT WITH APIs /////
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;


app.use(cors());

// PATHS /////
//  path to location
// let weatherArray = [];
// let trailsArray = [];


// LOCATION /////
const locationFunction = require('./modules/location.js');
app.get('/location', locationFunction);


// WEATHER /////
// //getting the weather forecast for location
const weatherFunction = require('./modules/weather.js');
app.get('/weather', weatherFunction);


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

//     const data = weatherResponse.body.data;
//     const results = [];
//     data.map(item => results.push(new Weather(item.datetime, item.weather.description)));
//     response.send(results);
//   })

//       .catch(err => {
//         console.log(err);
//         response.status(500).send('Weather Broke');
//       });

// }
 

// WEATHER CONSTRUCTOR /////

function Weather(day) {
    // console.log(day.forecast)
this.forecast = day.weather.description;
this.time = day.datetime;

}


// TRAILS /////
// getting trails data 
const trailsFunction = require('./modules/trails.js');
app.get('/trails', trailsFunction);

function trailsFunction (request, response){
  
      let latitude = request.query.latitude;
      let longitude = request.query.longitude;
      const trailsUrl = `https://hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
      // console.log(trailsUrl)
      return superagent.get(trailsUrl)
      .then(data => {
        // console.log (data);
          
        let trailsList = data.body.trails.map( value => {
         return new Trails(value);
        });
        response.status(200).json(trailsList);

        
// TRAILS ERROR HANDLER /////

      })
      .catch(err => {
        console.log(err);
        response.status(500).send('Trails is Broken');
      });

      }

//  TRAILS CONSTRUCTOR /////
function Trails(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.url = trail.url
  this.conditions = trail.conditionDetails;
  this.condition_date = trail.conditionDate.slice(0,10);
  this.condition_time = trail.conditionDate.slice(11,18);

}



//  MOVIES /////
// getting movies data
const movieFunction = require('./modules/movies.js');
app.get('/movies', movieFunction);


// YELP //////
// getting yelp data
const yelpFunction = require('./modules/yelp.js');
app.get('/yelp', yelpFunction);


// const errorHandler = (error, request, response) => {
//   response.status(500).send(error);
// }


//  ACTIVATE the PORT /////
client.connect()
.then (app.listen(PORT,() => console.log(`Listening on port ${PORT}`)));
