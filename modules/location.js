'use strict';

require('dotenv').config();
const superagent = require('superagent');
const client = require('./client');


function locationFunction (request, response) {
  console.log('in the locationFunction')
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
        // console.log(results);
        if (results.rowCount) {
            // console.log(`${city} came from database request`);
            console.log(results.rows[0],'line 44');
            response.send(results.rows[0]);
        } 
        else {
            superagent.get(url)
            .query(queryStringParams)
            .then( data => {
                // console.log(dataclient.query)
              let locationData = data.body[0];
              // console.log(locationData);
              let location = new Location(city,locationData);
              // console.log(location)
              // console.log(`${city} came from API`);
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


module.exports = locationFunction;  