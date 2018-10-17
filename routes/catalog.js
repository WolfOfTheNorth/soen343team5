// Config Variables
var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator());
var catalog = require('../models/catalog');
// DB Connection
const pool = require('../db');


// ====================================== //
// ======== Catalog Index Page ========== //
// ====================================== //
router.get('/', async (req, res) => {
    try {
        let list = await catalog.getCatalog();
        res.render('catalog/catalog', { list, title: 'Catalog' });
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
});


// ====================================== //
// == GET Requests for Creating Items === //
// ====================================== //
// Create a new item page
router.get('/createitems', function (req, res, next) {
    res.render('catalog/createitem', { title: 'Create Item' });
});
// Create a new book 
router.get('/createitems/createBook', function (req, res, next) {
    res.render('catalog/createBook', { title: 'Create Item' });
});
// Create a new magazine 
router.get('/createitems/createMagazine', function (req, res, next) {
    res.render('catalog/createMagazine', { title: 'Create Item' });
});
// Create a music 
router.get('/createitems/createMusic', function (req, res, next) {
    res.render('catalog/createMusic', { title: 'Create Item' });
});
// Create a new movie 
router.get('/createitems/createMovie', function (req, res, next) {
    res.render('catalog/createMovie', { title: 'Create Item' });
});


// ====================================== //
// == POST Requests for Creating Items === //
// ====================================== //
// Create a new book: Post request
router.post('/createitems/createbook', function (req, res) {

    const newbook = {
        "title": req.body.title,
        "author": req.body.author,
        "format": req.body.format,
        "pages": req.body.pages,
        "publisher": req.body.publisher,
        "language": req.body.language,
        "isbn10": req.body.isbn10,
        "isbn13": req.body.isbn13,
        "quantity": req.body.quantity
    };

    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('format', 'Format is required').notEmpty();
    req.checkBody('pages', 'Page number is required').notEmpty();
    req.checkBody('publisher', 'Publisher is required').notEmpty();
    req.checkBody('language', 'Language is required').notEmpty();
    req.checkBody('isbn10', 'ISBN10 is required').notEmpty();
    req.checkBody('isbn13', 'ISBN13 is required').notEmpty();
    req.checkBody('quantity', 'Quantity is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('catalog/createBook', { errors: errors });
    } else {
        console.log(newbook);
        catalog.insertNewBook(newbook);
        res.render('catalog/catalog', { title: 'Catalog' });
    }
});


// ====================================== //
// == GET Requests for Updating Items === //
// ====================================== //
router.get('/updateitem/:item_id', async (req, res) => {
    try {
        let results = await catalog.getItem(req.params.item_id);
        let discriminator = await catalog.getDiscriminator(req.params.item_id);
        console.log(discriminator);
        switch (discriminator) {
            case "Book":
                res.render('catalog/updateBook', { results, title: 'Catalog' });
                break;
            case "Magazine":
                res.render('catalog/updateMagazine', { results, title: 'Catalog' });
                break;
            case "Movie":
                res.render('catalog/updateMovie', { results, title: 'Catalog' });
                break;
            case "Music":
                res.render('catalog/updateMusic', { results, title: 'Catalog' });
                break;
            default:
                result = null;
                break;
        }
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
});


// ====================================== //
// == POST Requests for Updating Items === //
// ====================================== //
router.post('/updateitem/:item_id/modify', async (req, res) => {
    let result;
    let newItem;

    try {
        let discriminator = await catalog.getDiscriminator(req.params.item_id);
        console.log(discriminator);
        switch (discriminator) {
            case "Book":
                newItem = {
                    "title": req.body.title,
                    "author": req.body.author,
                    "format": req.body.format,
                    "pages": req.body.pages,
                    "publisher": req.body.publisher,
                    "language": req.body.language,
                    "isbn10": req.body.isbn10,
                    "isbn13": req.body.isbn13,
                    "loanable": req.body.loanable,
                    "loand_period": req.body.loand_period,
                    "quantity": req.body.quantity
                };
                break;
            case "Magazine":
                newItem = {
                    "title": req.body.title,
                    "publisher": req.body.publisher,
                    "language": req.body.language,
                    "isbn10": req.body.isbn10,
                    "isbn13": req.body.isbn13,
                    "loanable": req.body.loanable,
                    "loand_period": req.body.loand_period,
                    "quantity": req.body.quantity
                };
                break;
            case "Movie":
                newItem = {
                    "title": req.body.title,
                    "Publisher": req.body.director,
                    "producers": req.body.producers,
                    "language": req.body.language,
                    "dubbed": req.body.dubbed,
                    "subtitles": req.body.subtitles,
                    "actors": req.body.actors,
                    "release_date": req.body.release_date,
                    "run_time": req.body.run_time,
                    "loanable": req.body.loanable,
                    "loand_period": req.body.loand_period,
                    "quantity": req.body.quantity
                };
                break;
            case "Music":
                newItem = {
                    "title": req.body.title,
                    "artist": req.body.artist,
                    "label": req.body.label,
                    "release_date": req.body.release_date,
                    "asin": req.body.asin,
                    "run_time": req.body.run_time,
                    "loanable": req.body.loanable,
                    "loand_period": req.body.loand_period,
                    "quantity": req.body.quantity
                };
                break;
            default:
                newItem = null;
                break;
        }
        console.log(newItem);
        result = await catalog.updateItem(newItem, req.params.item_id);
        res.redirect('/catalog');
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
});

// router.post('/updatebook/:item_id/modify', async (req, res) => {
//     const newItem = {
//         "title": req.body.title,
//         "author": req.body.author,
//         "format": req.body.format,
//         "pages": req.body.pages,
//         "publisher": req.body.publisher,
//         "language": req.body.language,
//         "isbn10": req.body.isbn10,
//         "isbn13": req.body.isbn13,
//         "loanable": req.body.loanable,
//         "loand_period": req.body.loand_period,
//         "quantity": req.body.quantity
//     };
//     try {
//         let result = await catalog.updateItem(newItem, req.params.item_id);
//         res.redirect('/catalog');
//     } catch (err) {
//         console.error(err);
//         res.render('error', { error: err });
//     }
// });


// router.post('/updatemagazine/:item_id/modify', async (req, res) => {
//     const newItem = {
//         "title": req.body.title,
//         "publisher": req.body.publisher,
//         "language": req.body.language,
//         "isbn10": req.body.isbn10,
//         "isbn13": req.body.isbn13,
//         "loanable": req.body.loanable,
//         "loand_period": req.body.loand_period,
//         "quantity": req.body.quantity
//     };
//     try {
//         let result = await catalog.updateItem(newItem, req.params.item_id);
//         res.redirect('/catalog');
//     } catch (err) {
//         console.error(err);
//         res.render('error', { error: err });
//     }
// });

// router.post('/updatemovie/:item_id/modify', async (req, res) => {
//     const newItem = {
//         "title": req.body.title,
//         "Publisher": req.body.director,
//         "producers": req.body.producers,
//         "language": req.body.language,
//         "dubbed": req.body.dubbed,
//         "subtitles": req.body.subtitles,
//         "actors": req.body.actors,
//         "release_date": req.body.release_date,
//         "run_time": req.body.run_time,
//         "loanable": req.body.loanable,
//         "loand_period": req.body.loand_period,
//         "quantity": req.body.quantity
//     };
//     try {
//         let result = await catalog.updateItem(newItem, req.params.item_id);
//         res.redirect('/catalog');
//     } catch (err) {
//         console.error(err);
//         res.render('error', { error: err });
//     }
// });

// router.post('/updatemusic/:item_id/modify', async (req, res) => {
//     const newItem = {
//         "title": req.body.title,
//         "artist": req.body.artist,
//         "label": req.body.label,
//         "release_date": req.body.release_date,
//         "asin": req.body.asin,
//         "run_time": req.body.run_time,
//         "loanable": req.body.loanable,
//         "loand_period": req.body.loand_period,
//         "quantity": req.body.quantity
//     };
//     try {
//         let result = await catalog.updateItem(newItem, req.params.item_id);
//         res.redirect('/catalog');
//     } catch (err) {
//         console.error(err);
//         res.render('error', { error: err });
//     }
// });

//keep the next line at the end of this script
module.exports = router;
