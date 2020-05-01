'use strict';

require('dotenv').config();
const superagent = require('superagent');
const client = require('./client');


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


module.exports = movieFunction