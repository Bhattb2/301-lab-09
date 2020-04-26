'use strict';

// REQUIRE LIBRARIES /////
require('dotenv').config();
const express = require('express'); 
const cors = require('cors');
const app = express();
const pg = require('pg');

// INTERACT WITH APIs /////
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL); //server becomes client, connects to database
client.on('error', err=> console.error(err)); //confirms if you are up and running
app.use(cors());

// PATHS /////
//  path to location
let weatherArray = [];
let trailsArray = [];


// LOCATION /////

app.get('/location', locationFunction);
function locationFunction (request, response) {
  const url = 'https://us1.locationiq.com/v1/search.php';
  let city = request.query.city;
  const queryStringParams = {
      key: process.env.GEOCODE_API_KEY,
      q: city,
      format: 'json',
      limit: 1,
  };

  const searchSQL = ` SELECT * FROM locations WHERE search_query = $1`;
  const searchValues = [city];
  return client.query(searchSQL, searchValues)
    .then(results => {
      if (results.rowCount) {

        response.send(results.rows[0]);
      } 
      else {
        superagent.get(url)
          .query(queryStringParams)
          .then( data => {
            let locationData = data.body[0];
            let location = new Location(city,locationData);
            let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING * `;
            let saveVal = [location.search_query, location.formatted_query, location.latitude, location.longitude];
            console.log(saveVal, 'line 58');
            client.query(SQL, saveVal)
              .then( () => {
                // response.json(result);
                response.send(location);
              });
          });
      }
    
  })
}

// LOCATION CONSTRUCTOR to get information from geo.json file /////
function Location (city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
  
}


// WEATHER /////
// //getting the weather forecast for location
app.get('/weather', weatherFunction);
function weatherFunction (request, response){
  
      let latitude = request.query.latitude;
      let longitude = request.query.longitude;
      const weatherUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;
      return superagent.get(weatherUrl)
      .then(result => {
          let weatherData = result.body.daily.data;
          let weather = weatherData.map( day => {
         return new WeatherConstructor(day);
        });
      
        response.status(200).json(weather);
    
      })
      .catch(err => {
        console.log(err);
        response.status(500).send('Weather Broke');
      });

    }
 

// WEATHER CONSTRUCTOR /////
function WeatherConstructor(day) {
this.forecast = day.summary;
this.time = new Date(day.time*1000).toString();
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

  // let latitude = request.query.latitude;
  // let longitude = request.query.longitude;
  const city = request.query.city;
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




// const errorHandler = (error, request, response) => {
//   response.status(500).send(error);
// }


//  ACTIVATE the PORT /////
client.connect()
.then (app.listen(PORT,() => console.log(`Listening on port ${PORT}`)));

