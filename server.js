var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
require("dotenv").config()
var PORT = 3000;
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
    db.Article.find({}).limit(20)
        .then(function (dbArticles) {
            res.render("index", {
                articles: dbArticles
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


        $("article").each(function (i, element) {
            let result = {}
            result.title = $(this).find("h2")['0']['children'][0]['data'];
            result.link = target+$(this).find("a")['0'].attribs.href;

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
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


app.listen(PORT, function () {
    console.log("App running on http://localhost:" + PORT);
});
