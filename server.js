'use strict';

// REQUIRE LIBRARIES /////
require('dotenv').config();
const express = require('express'); 
const cors = require('cors');
const app = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL); //server becomes client, connects to database
// INTERACT WITH APIs /////
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

client.on('error', err=> console.error(err)); //confirms if you are up and running
app.use(cors());

// PATHS /////
//  path to location
let weatherArray = [];
let trailsArray = [];


// LOCATION /////
const locationFunction = require('./modules/location.js');
app.get('/location', locationFunction);



// WEATHER /////
// //getting the weather forecast for location
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


// TRAILS /////
// getting trails data 
app.get('/trails', trailsFunction);
function trailsFunction (request, response){
  
      let latitude = request.query.latitude;
      let longitude = request.query.longitude;
      const trailsUrl = `https://hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
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
app.get('/movies', movieFunction);
function movieFunction (request, response){

  const city = request.query.search_query;
  const moviesUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}`; 
    return superagent.get(moviesUrl)
    .then(data => {
        let moviesList = data.body.results.map( value => {
        return new MovieData(value);
        });

        response.status(200).json(moviesList);

// MOVIES ERROR HANDLER /////
    })
    .catch(err => {
      console.log(err);
      response.status(500).send('Movies are playing');
    });
}

// MOVIES CONSTRUCTOR /////
function MovieData(movie) {
  this.title = movie.original_title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}


// YELP //////
// getting yelp data
app.get('/yelp', yelpFunction);
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




// const errorHandler = (error, request, response) => {
//   response.status(500).send(error);
// }


//  ACTIVATE the PORT /////
client.connect()
.then (app.listen(PORT,() => console.log(`Listening on port ${PORT}`)));
