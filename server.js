//here I will reuire my dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

//here I will require the scraping tools I need
var request = require("request");
var cheerio = require("cheerio");




//initializing the app using express
var app = express();

var logger = require('morgan');


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

//connection mongoose & database config aka: this is where mlab docs go
mongoose.connect("mongodb://heroku_0t6j69x7:c6hgu9ijtb4ug2oolum4oiaen1@ds161041.mlab.com:61041/heroku_0t6j69x7");
var db = mongoose.connection;

//logging any errors related to mongoose
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

//no errors, console lets us know successful log in using mongoose
db.once("open", function() {
	console.log("Successful Mongoose Connection");
});

var Note = require('./model/Note.js');
var Article = require('./model/Article.js');

app.get('/', function(req, res) {
    res.send(index.html);
});


app.get("/scrape", function(req, res) {
  
  request("https://www.buzzfeed.com/", function(error, response, html) {
    
    var $ = cheerio.load(html);
   
    $("article h2").each(function(i, element) {

     
      var result = {};

     
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      
      var entry = new Article(result);

     
      entry.save(function(err, doc) {
       
        if (err) {
          console.log(err);
        }
        
        else {
          console.log(doc);
        }
      });

    });
  });
  
  res.send("Scrape Complete");
});




app.get("/articles", function(req, res) {

  Article.find({}, function(error, doc){
    if(error) {
      console.log(error);
    } else {
      res.json(doc);
    }
  });
});


app.get("/articles/:id", function(req, res) {

  Article.findOne({'_id': req.params.id})

  .populate('note')

  .exec(function(error, doc){
    if(error){
      console.log(error);
    } else {
      res.json(doc);
    }
  });
});






app.post("/articles/:id", function(req, res) {

  var newNote = new Note(req.body);

  newNote.save(function(error, doc) {
    if (error){
      res.send(error);
    } else {
      Article.findOneAndUpdate({"id": req.params}, {"note": doc._id })

      .exec(function(err, doc){
        if(err){
          console.log(err);
        } else{
          res.send(doc);
        }
      });
    }
  });
});


//app listening:
app.listen(3000, function(){
	console.log("App running on port 3000!");
})