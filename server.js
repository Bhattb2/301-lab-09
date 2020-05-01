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
let weatherArray = [];
let trailsArray = [];


// LOCATION /////
const locationFunction = require('./modules/location.js');
app.get('/location', locationFunction);


// WEATHER /////
// //getting the weather forecast for location
const weatherFunction = require('./modules/weather.js');
app.get('/weather', weatherFunction);


// TRAILS /////
// getting trails data 
const trailsFunction = require('./modules/trails.js');
app.get('/trails', trailsFunction);


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
