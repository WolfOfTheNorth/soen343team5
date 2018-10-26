// DB Connection
const pool = require('../db');

var item = require('../models/item');
//list to be filled with item objects from item.js in models
var itemsList = [];

//below is an example of using the constructor of the object
// item.constructor(item_id, discriminator, properties (as an object));

//Get list of catalog items
module.exports.getCatalog = async function() {
    try {
        const client = await pool.connect();
        let result = [];
        const resultBook = await client.query('SELECT * FROM books ORDER BY item_id ASC');
        const resultMagazine = await client.query('SELECT * FROM magazines ORDER BY item_id ASC');
        const resultMovie = await client.query('SELECT * FROM movies ORDER BY item_id ASC');
        const resultMusic = await client.query('SELECT * FROM music ORDER BY item_id ASC');

        result.resultBooks = { 'resultBooks': (resultBook) ? resultBook.rows : null};
        result.resultMagazines = { 'resultMagazines': (resultMagazine) ? resultMagazine.rows : null};
        result.resultMovies = { 'resultMovies': (resultMovie) ? resultMovie.rows : null};
        result.resultMusics = { 'resultMusics': (resultMusic) ? resultMusic.rows : null};
        client.release();
        //console.log(list);
        return await result;
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
}

//INSERT INTO DB

//insert new book
module.exports.insertNewBook = async function(newItem, item_id) {
    try {
        const client = await pool.connect();
        let discriminator = await this.getDiscriminator(item_id);
        const result = await client.query("INSERT INTO Items (discriminator) VALUES ('Movie');INSERT INTO Movies (item_id, discriminator, quantity, loand_period, loanable, title, director, producers, language, dubbed, subtitles, actors, release_date, run_time) SELECT select_id, 'Movie',3,2,TRUE,'Spiderman 20','Clint Eastwood', 'Michael Kane', 'English', 'English', 'German', 'George Cloney, Brad Pitt', '2001-09-04', 133 FROM (SELECT CURRVAL('items_item_id_seq') select_id)q;"
        );
        client.release();
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
};

//insert new Magazine
module.exports.insertNewMagazine = async function(newItem, item_id) {
    try {
        const client = await pool.connect();
        let discriminator = await this.getDiscriminator(item_id);
        const result = await client.query("INSERT INTO Items (discriminator) VALUES ('Magazine');INSERT INTO Magazine (item_id, discriminator, quantity, loand_period, loanable, title, publisher, language, isbn10, isbn13, release_date) "+"SELECT select_id,'Magazine',"+newItem.quantity+",7,TRUE,'"+newItem.title+"','" +newItem.publisher+ "','" +newItem.release_date+ "'," +newItem.isbn10+ ",'" +newItem.isbn13+ "',' " +newItem.loanable+ "FROM (SELECT CURRVAL('items_item_id_seq') select_id)q;"
        );
        client.release();
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
};

//insert new Music
module.exports.insertNewMusic = async function(newItem, item_id) {
    try {
        const client = await pool.connect();
        let discriminator = await this.getDiscriminator(item_id);
        const result = await client.query("INSERT INTO Items (discriminator) VALUES ('Music');INSERT INTO Music (item_id, discriminator, quantity, loand_period, loanable, title, label, release_date, asin, run_time, artist) "+"SELECT select_id,'Magazine',"+newItem.quantity+",7,TRUE,'"+newItem.title+"','" +newItem.artist+ "','" +newItem.release_date+ "'," +newItem.asin+ ",'" +newItem.run_time+ "',' " +newItem.loanable+ "FROM (SELECT CURRVAL('items_item_id_seq') select_id)q;"
        );
        client.release();
    } catch (err) {
        console.error(err);
        res.render('error', { error: err });
    }
};


/**
 * getItem(item_id, discriminator)
 **/
module.exports.getItem = async function(item_id) {
    try {
        const client = await pool.connect()
        let result;
        let discriminator = await this.getDiscriminator(item_id);
        switch(discriminator) {
            case "Book":
                result = await client.query("SELECT * FROM books WHERE item_id = ($1)", [item_id]);
                break;
            case "Magazine":
                result = await client.query("SELECT * FROM magazines WHERE item_id = ($1)", [item_id]);
                break;
            case "Movie":
                result = await client.query("SELECT * FROM movies WHERE item_id = ($1)", [item_id]);
                break;
            case "Music":
                result = await client.query("SELECT * FROM music WHERE item_id = ($1)", [item_id]);
                break;
            default:
                result = null;
                break;
        }
        const results = { 'results': (result) ? result.rows : null};
        client.release();
        return await results;
    } catch (err) {
        console.error(err);
	}
}

//Getter for discriminator
module.exports.getDiscriminator = async function(item_id) {
    try {
        const client = await pool.connect();
        let result = await client.query(
            "SELECT discriminator FROM Items WHERE item_id=$1;", [item_id]
        );
        var resultJSON = { 'result': (await result) ? await result.rows : null};
        client.release();
        return await resultJSON.result[0].discriminator;
    } catch (err) {
        console.error(err);
    }
}

//getNewItem structure
module.exports.getNewItem = async function(item_id, req) {
    let newItem;
    const discriminator = await this.getDiscriminator(item_id);
    // console.log("getNewItem DISCRIMINATOR: " + discriminator);
    try {
        switch(discriminator) {
            case "Book":
                newItem = await {
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
                newItem = await {
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
                newItem = await {
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
                newItem = await {
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
                console.log("NO OBJECT FOUND");
                break;
        }
        return await newItem;
    } catch (err) {
        console.error(err);
    }
}

// updateItem to database;
module.exports.updateItem = async function(newItem, item_id) {
    try {
        const client = await pool.connect();
        let result;
        let discriminator = await this.getDiscriminator(item_id);
        // console.log(discriminator);
        switch (discriminator) {
            case "Book":
                result = await client.query(
                    "UPDATE books SET " +
                    "title = '"+ newItem.title + "', " +
                    "author = '" + newItem.author + "', " +
                    "format = '" + newItem.format + "', " +
                    "pages = " + newItem.pages + ", " +
                    "language = '" + newItem.language + "', " +
                    "isbn10 = " + newItem.isbn10 + ", " +
                    "isbn13 = " + newItem.isbn13 + ", " +
                    "loanable = '" + newItem.loanable + "', " +
                    "loand_period = " + newItem.loand_period + ", " + 
                    "quantity = "+ newItem.quantity +
                    " WHERE item_id = ($1);", [item_id]  
                );
                // console.log("BOOK SQL");
                break;
            case "Magazine":
                result = await client.query(
                    "UPDATE magazines SET " +
                    "title = '"+ newItem.title + "', " +
                    "publisher = '" + newItem.publisher + "', " +
                    "language = '" + newItem.language + "', " +
                    "isbn10 = " + newItem.isbn10 + ", " +
                    "isbn13 = " + newItem.isbn13 + ", " +
                    "loanable = '" + newItem.loanable + "', " +
                    "loand_period = " + newItem.loand_period + ", " + 
                    "quantity = "+ newItem.quantity +
                    " WHERE item_id = ($1);", [item_id]  
                );
                // console.log("MAGAZINE SQL");
                break;
            case "Movie":
                result = await client.query(
                    "UPDATE movies SET " +
                    "title = '"+ newItem.title + "', " +
                    "director = '" + newItem.director + "', " +
                    "producers = '" + newItem.producers + "', " +
                    "language = '" + newItem.language + "', " +
                    "dubbed = '" + newItem.dubbed + "', " +
                    "subtitles = '" + newItem.subtitles + "', " +
                    "actors = '" + newItem.actors + "', " +
                    "release_date = '" + newItem.release_date + "', " +
                    "run_time = " + newItem.run_time + ", " +
                    "loanable = '" + newItem.loanable + "', " +
                    "loand_period = " + newItem.loand_period + ", " + 
                    "quantity = "+ newItem.quantity +
                    " WHERE item_id = ($1);", [item_id]
                );
                // console.log("MOVIE SQL");
                break;
            case "Music":
                result = await client.query(
                    "UPDATE music SET " +
                    "title = '"+ newItem.title + "', " +
                    "artist = '" + newItem.artist + "', " +
                    "label = '" + newItem.label + "', " +
                    "release_date = '" + newItem.release_date + "', " +
                    "asin = '" + newItem.asin + "', " +
                    "loanable = '" + newItem.loanable + "', " +
                    "loand_period = " + newItem.loand_period + ", " + 
                    "quantity = "+ newItem.quantity +
                    " WHERE item_id = ($1);", [item_id]  
                );
                // console.log("MUSIC SQL");
                break;
            default:
                result = null;
                // console.log("NO SQL");
                break;
        }
        client.release();
    } catch (err) {
        console.error(err);
    }
}