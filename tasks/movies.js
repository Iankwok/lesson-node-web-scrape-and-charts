var Yakuza   = require('yakuza');
var cheerio  = require('cheerio');
var mongoose = require('mongoose');
var Movie    = require('../app/models/movie');
var config   = require('../config/config');
mongoose.connect(config.db);

Yakuza.scraper('movie');
Yakuza.agent('movie', 'imdb').plan(['top250']);
Yakuza.task('movie', 'imdb', 'top250').main(function (task, http, params) {
  // your logic for retrieving the html and extrating data here
})

Yakuza.task('movie', 'imdb', 'top250').main(function (task, http, params) {
  console.log(params) // {someParams: "someParams"}
  var url = 'http://www.imdb.com/chart/top?ref_=nv_mv_250_6';

  // Get the html document
  http.get(url, function (error, res, html){
    if (error) { return task.fail(error); } // required

    var $ = cheerio.load(html);
    var movies = $("tbody.lister-list > tr")
    var moviesList =[];

    movies.each(function (index, movie){
      movie = $(movie);

      var img, title, rating;

      img = movie.find('.posterColumn > a > img').attr("src");
      title = movie.find('.titleColumn > a').html() + " "
      + movie.find('.titleColumn > span').html();
      rating = parseFloat(movie.find('.imdbRating > strong').html());

      moviesList.push({
        img: img,
        title: title,
        rating: rating
      });
    });
    return task.success({message: "Completed top 250" , moviesList: moviesList}); // required event listener
  });


}).builder(function (job){
  // if you have passed in data to your job and you want to use it in your task, then you need to have this.
  return job.params;
});

var top250 = Yakuza.job('movie', 'imdb', {someParams: "someParams"}).enqueue('top250');

// when task is completed, parse the data in
top250.on('task:top250:success', function (task) {
  console.log(task.data.message);
  console.log(task.data.moviesList);
  var moviesList = task.data.moviesList;
  moviesList.forEach(function (movie){
    saveMovie(movie);
  })
});
// actually execute the Job
top250.run();

  function saveMovie (movieInfo) {
    Movie.findOneAndUpdate({title: movieInfo.title}, movieInfo, function (error, movie){
      if(error){return console.log(error);}
      if(!movie) {
        movie = new Movie(movieInfo);
        movie.save(function (error) {
          if (error) {return console.log(error);}
          return console.log("Movie Created >>>" + movie.title);
        });
      } else {
        return console.log("Movie Updated >>>" + movie.title);
      }
    });
  }




