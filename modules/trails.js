'use strict';

require('dotenv').config();
const superagent = require('superagent');
const client = require('./client');


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


module.exports = trailsFunction;