// Table Data Gateway
var tdg = require('../TDG/itemsGateway');
// Identity Mapper
var imap = require('../IMAP/identitymap');
// Unit of Work
var uow = require('../uow/uow');
// Database Connection
const pool = require('../db');

// ======================================== //
// = GET LIST OF ALL ITEMS IN THE CATALOG = //
// ======================================== //
// used in viewing the entire catalog page
module.exports.getCatalog = async function() {
    try {        
        let foundCatalog = await imap.findFullCatalog();
        let result;
        // if full catalog found in imap
        if (foundCatalog){
            //console.log("----------------------------------------------");
            //console.log("Catalog has already been loaded into the IMAP:");
            result = await imap.getFullCatalog();
            //console.log("Loading "+result.items.length+" items from the IMAP");
            //console.log("----------------------------------------------");
            // console.log(result);
        // else get full catalog from imap
        } else{
            // console.log("----------------------------------------------");
            // console.log("Catalog was not found in the IMAP:");
            result = await tdg.getCatalog();
            // console.log("Loading "+result.items.length+" items from the DB");
            // console.log("----------------------------------------------");
            // console.log(result);
            await imap.loadFullCatalog(result);
        }
        return await result;
    } catch (err) {
        console.error(err);
        // res.render('error', { error: err });
    }
}

//Get list of filtered catalog items by alphabets type = 1 is for ascending and type = 2 is for descending
module.exports.getFilteredCatalog = async function(type) {
    try {
        //let foundCatalog = imap.checkFullCatalog();
        let result = await tdg.getFilteredCatalog(type);

        // if full catalog not found in imap, get from tdg
        //if (!foundCatalog)
        return await result;

        // else get full catalog from imap

    } catch (err) {
        console.error(err);
        // res.render('error', { error: err });
    }
}

// ====================================== //
// ===== INSERT A NEW ITEM INTO DB ====== //
// ====================================== //
// insert into the items table first, then use the PSQL function to retrieve
// the items_item_id_seq (item_id) that was just inserted to create a new item.
module.exports.insertNewItem = async function(req, discriminator) {
    try {
        // get the item fromt he html form
        let temp = await this.getItemFromForm(req);
        temp.discriminator = discriminator;
        let shit = [];
        shit[0] = temp;

        let newItem = {"results": shit};
        // console.log(newItem);
        // console.log(newItem.results);
        await uow.registerNew(newItem);
        await this.commitToDb();                            
        // return await tdg.insertNewItem(newItem,req, discriminator);
    } catch (err) {
        console.error(err);
    }
};

// ====================================== //
// ===== GET ITEM BASED ON ITEM_ID ====== //
// ====================================== //
// used in view single item page
// IMAP.find
// if found IMAP.get() 
// if not found IMAP.add() then IMAP.get()
module.exports.getItemById = async function(item_id) {
    try {
        let itemIdArray = await tdg.getAllIds();
        let item;
        let foundInImap = await imap.find(item_id);

        if(foundInImap){
                console.log("-------------------------------------");
                console.log("Found Item In IMAP: loading from IMAP");
                item = await imap.get(item_id);
                await uow.registerClean(item);
                console.log(item.results);
                console.log("-------------------------------------");
                // If item found in IMAP, get from IMAP
        } else {
            let getFromTDG = await tdg.getItemByID(item_id);
            await imap.addItemToMap(getFromTDG);
            await uow.registerClean(getFromTDG);
            console.log("---------------------------------------");
            console.log("Item not found in IMAP: Loading from DB");
            item = await imap.get(item_id);
            // console.log(item.results[0]);
            // console.log("---------------------------------------");
        }
        item.itemIdArray = itemIdArray;
        // console.log(item.itemIdArray);
        return await item;
    } catch (err) {
        console.error(err);
    }
}


//Check if this is the last item
module.exports.isLastItem = async function (item_id){
    return await imap.isLastItem(item_id);
}

// ====================================== //
// ====== UPDATE AN EXISTING ITEM ======= //
// ====================================== //
module.exports.updateItem = async function(req, item_id) {
    try {
        // get the item from the html form
        let updatedItem = await this.getItemFromForm(req);
        console.log("UPDATED: " + updatedItem.title);
        await imap.updateItem(updatedItem, item_id); // Update item on Imap.
        let item = await imap.get(item_id);
        await uow.registerDirty(item); // <<<<<< DIRTY THE ITEM
        this.commitToDb();
        // return tdg.updateItem(updatedItem, item_id, discriminator); // Update the item in the DB
    } catch (err) {
        console.error(err);
    }
}

// ====================================== //
// ======== Search Items Handler ======== //
// ====================================== //
module.exports.getSearchResults = async function(searched, isItemId) {
    try {
        let search = searched.toLowerCase();
        let result = await tdg.getSearchResults(search, isItemId);
        // console.log("Search result:", result);
        console.log("Searching for: \""+searched+"\"");
        return await result;
    } catch (err) {
        console.error(err);
    }
}

// ====================================== //
// ====== Search Items Handler ======= //
// ====================================== //
module.exports.getSearchResultsTransactions = async function(req) {
    try {
        let searched = req.body.search;
        let search = searched.toLowerCase();
        let result;
        result = await tdg.getSearchResultTransactions(search, req);
        return await result;
    } catch (err) {
        console.error(err);
    }
}

// ======================================= //
// ===== Delete an Item from the DB ====== //
// ======================================= //
// DELETE an ITEM from the database which
// cascades down to delete the corresponding
// book, magazine, movie or music
module.exports.deleteItem = async function (item_id){
    try {
        let item = await imap.get(item_id);
        await imap.deleteItemFromMap(item_id); // Delete item from Imap.
        await uow.registerDeleted(item);
        this.commitToDb();
        // await tdg.deleteItem(item_id);
    } catch (err) {
        console.error(err);
    }        
}

// ====================================== //
// === GET NEW ITEM FROM THE HTML FORM == //
// ====================================== //
// get a new item passed in from the HTML FORM
module.exports.getItemFromForm = async function(req) {
    let newItem;
    try {
        newItem = await {
            // book and magazine related attributes
            "title": req.body.title,
            "author": req.body.author,
            "format": req.body.format,
            "pages": req.body.pages,
            "publisher": req.body.publisher,
            "language": req.body.language,
            "isbn10": req.body.isbn10,
            "isbn13": req.body.isbn13,
            "loanable": req.body.loanable,
            "loan_period": req.body.loan_period,
            // movie related attributes
            "director": req.body.director,
            "producers": req.body.producers,
            "subtitles": req.body.subtitles,
            "dubbed": req.body.dubbed,
            "actors": req.body.actors,
            "release_date": req.body.release_date,
            "run_time": req.body.run_time,
            // music related attributes
            "artist": req.body.artist,
            "type": req.body.type,
            "label": req.body.label,
            "asin": req.body.asin,
            //common attribute
            "quantity": req.body.quantity
        }
        return await newItem;
    } catch (err) {
        console.error(err);
    }
}
// ===============================================//
// === GET ALL TRANSACTIONS MADE ON THE SYSTEM == //
// ============================================== //
module.exports.getTransactionItems = async function() {
    try {        
        
        let result = await tdg.getAllTransactions();
        await imap.loadFullTransactionTable(result);
        return await result;
    } catch (err) {
        console.error(err);
    }
}

module.exports.getUserTransactionItems = async function(email) {
    try {        
        let result = await tdg.getAllUserTransactions(email);
        await imap.loadFullTransactionTable(result);
        return await result;
    } catch (err) {
        console.error(err);
    }
}

module.exports.filterTransactions = async function(req, asc) {
    try {        
        let result = await tdg.filterTransactions(req, asc);
        await imap.filterTransactionTable(result);

        return await result;
    } catch (err) {
        console.error(err);
    }
}

// ============================================== //
// ========== FLUSH THE IMAP ON LOGOUT ========== //
// ============================================== //
module.exports.flushImap = async function() {
    try{
        await imap.resetImap();
    }catch(err){
        console.error(err);
    }
}

// ============================================== //
// ============= UoW CRUD FUNCTIONS ============= //
// ============================================== //
module.exports.commitToDb = async function(){ 
    try{
        let uowArray = await uow.commit();
        
        // Limit the number of open connections to only 1, for all CRUD operations!
        
        const client = await pool.connect();

        // debug purposes
        // for(j in uowArray){
        //     console.log(uowArray[j].results[0].title + " deletebit: " + uowArray[j].results.deletebit);
        //     console.log(uowArray[j].results[0].title + " cleanbit: " + uowArray[j].results.cleanbit);
        //     console.log(uowArray[j].results[0].title + " newbit: " + uowArray[j].results.newbit);
        // }

        //
        console.log("----------------------------------------------");
        for (i in uowArray){
            // console.log("UoW Array item: " + uowArray[i].results[0].title);
            if(uowArray[i].results.cleanbit == true){ // READ useless?
                // console.log("Found clean bit, do nothing as item has only been read ID = ["+uowArray[i].results[0].item_id+"]");
                //If we decide to implement something in for the Clean bit, remember to set back to false when registering dirty, new, delete
                //Now when we registerDirty, clean remains TRUE.
            }
            if(uowArray[i].results.dirtybit == true){ // UPDATE for items registeredDirty in the UoW
                let updateItem = uowArray[i].results[0];
                let item_id = uowArray[i].results[0].item_id; 
                let discriminator = uowArray[i].results[0].discriminator;
                let query = await tdg.updateItem(updateItem, item_id, discriminator); 
                client.query(query);
            }
            if(uowArray[i].results.newbit == true){ // CREATE for items registeredNew in the UoW
                let newItem = uowArray[i].results[0];
                let discriminator = uowArray[i].results[0].discriminator;                                
                let result = await tdg.insertNewItem(newItem, discriminator);
                await client.query(result.itemQuery);
                await client.query(result.discriminatorQuery);
                console.log("Item created: " + uowArray[i].results[0].title)
                
                // get the item_id from the items_item_id_seq auto generated postgres table
                let itemId = await client.query(await tdg.getMostRecentItemId());
                itemId = itemId.rows[0].item_id;
                // get the full item from the TDG
                let getFromTDG = await tdg.getItemByID(itemId, discriminator);
                // add the newly created item into the imap
                await imap.addItemToMap(getFromTDG);
            }
            if(uowArray[i].results.deletebit == true){ // DELETE for items registeredDeleted in the UoW
                let item_id = uowArray[i].results[0].item_id;
                let result = await tdg.deleteItem(item_id);
                // console.log("Item deleted: " + uowArray[i].results[0].title)
                client.query(result);
            }
        }
        client.release();
        console.log("----------------------------------------------");

        await uow.rollback(); // clear the UoW after completing CRUD operations
    }catch(err){
        console.error(err);

    }
}