//      mLab-deployed mongoDB for heroku
//      https://www.mlab.com/databases/heroku_h6txg0bh


var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
require("dotenv").config()
var PORT = process.env.PORT || 3000;
var app = express();


app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
console.log("connection: "+MONGODB_URI)

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

app.get("/", function (req, res) {
    db.Article.find({
        summary: {
            $exists: true
        }
    }).limit(20)
        .then(function (dbArticles) {
            let scraped = false
            if (dbArticles.length > 0){
                scraped = true
            }
            res.render("index", {
                articles: dbArticles,
                scraped: scraped
            })
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/scrape", function (req, res) {
    let target = "http://www.nytimes.com"
    axios.get(target).then(function (response) {
        var $ = cheerio.load(response.data);

        let test = []
        $("article").each(function (i, element) {
            let result = {}
            result.title = $(this).find("h2")['0']['children'][0]['data'];
            result.link = target+$(this).find("a")['0'].attribs.href;
            result.summary = $(this).find("p").text() //|| $(this).find("li").text();
            
            test.push(result)
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
        console.log(test)
        res.send("Scrape Complete")
    });
});



app.get("/articles/:id", function (req, res) {
    db.Article.findOne({
            _id: req.params.id
        })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});


app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// app.delete("/drop", function(req,res) {
//     // mongoose.connection.db.dropCollection('Articles', function (err, result) {
//     //     if (err) throw err.stack;
//     //     mongoose.connection.db.dropCollection('Notes', function (err, result) {
//     //         if(err) throw err.stack;
//     //         console.log(result)
//     //         res.send("Collections dropped.")
//     //     });
//     // });

// })


app.listen(PORT, function () {
    console.log("App running on http://localhost:" + PORT);
});


