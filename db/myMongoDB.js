const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = "sephoraCol";
const COL_NAME = "store";

//console.log("ObjectId", ObjectId);

async function getStore(query, page, pageSize) {
  console.log("Get Store",query);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      store_location : { $regex : `${query}` , $options : "i" }
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .find(queryObj)
      .sort({ store_id : 1})
      .limit(pageSize)
      .skip((page-1) * pageSize)
      .toArray();

  } finally {
    client.close();
    }
  }

async function getStoreCount(query) {

  console.log("getStoreCount",query);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      store_location : { $regex : `${query}` , $options : "i" }
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .find(queryObj)
      .count();

  } finally {
    client.close();
    }
  }

async function getStoreByID(store_id) {
   console.log('getStoreByID', store_id);

   const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      _id: new ObjectId(store_id),
      //store_id: store_id
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .findOne(queryObj);

  } finally {
    client.close();
    }
  }

async function updateStoreByID(store_id, sto) {

  console.log('update store', store_id, sto);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      //store_id : store_id
      _id: new ObjectId(store_id)
    };

    if (typeof sto.purchase_id === "string"){
      sto.purchase_id = sto.purchase_id.split(",")
        .map(p => p.trim());
    }

    const stores = client.db("sephoraCol").collection("store");
  
    return await stores.updateOne(queryObj, { $set : sto });
  } catch (e) {
    console.log("Error", e);
  } finally {
    client.close();
    }
 }


async function deleteStoreByID(store_id) {

  console.log('delete store');

  const client = new MongoClient(uri);

  const queryObj = { _id: new ObjectId(store_id) }; 

  try {
    await client.connect();

    const stores = client.db("sephoraCol").collection("store");
  
    const result = await stores.deleteOne(queryObj);

    return result;

  } catch (e) {
    console.log("Error", e);
    return null; 
  } finally {
    client.close();
  }
}

async function insertStore(sto) {

  console.log('insert store', sto);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    if (typeof sto.purchase_id === "string"){
      sto.purchase_id = sto.purchase_id.split(",")
        .map(p => p.trim());
    }

    sto.product = new Array();

    const stores = client.db("sephoraCol").collection("store");
  
    const result = await stores.insertOne(sto);
  } catch (e) {
    console.log("Error", e);
  } finally {
    client.close();
    }
}

async function getProduct(store_id) {
  
  console.log('getProduct', store_id);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      store_id : store_id
    };

    return await client.db(DB_NAME).collection(COL_NAME).find( { store_id : { "product.name" : {} } } )
  } finally {
    client.close();
    }
  }

async function addProductToStoreID(store_id, product) {

  console.log('addProduct', store_id, product);

  const client = new MongoClient(uri);

  const queryObj = {
    _id: new ObjectId(store_id)
  }; 

  try {
    await client.connect();

    const stores = client.db("sephoraCol").collection("store");
  
    return await stores.updateOne( queryObj, { $push: { product : product } } );
  } catch (e) {
    console.log("Error", e);
  } finally {
    client.close();
    }
 }

async function removeProduct(store_id, product_id) {
  console.log('remove product', store_id, product_id);

  const client = new MongoClient(uri);

  const queryObj = { 
    _id: new ObjectId(store_id) 
  }; 

  try {
    await client.connect();

    const stores = client.db("sephoraCol").collection("store");
  
    const result = await stores.updateOne ( queryObj, { $pull : { product : { id: product_id } } } );

    return result;

  } catch (e) {
    console.log("Error", e);
    return null; 
  } finally {
    client.close();
  }
}

module.exports.getStore = getStore;
module.exports.insertStore = insertStore;
module.exports.getStoreCount = getStoreCount;
module.exports.getStoreByID = getStoreByID;
module.exports.updateStoreByID = updateStoreByID;
module.exports.deleteStoreByID = deleteStoreByID;
module.exports.getProductByStoreID = getProduct;
module.exports.addProductToStoreID = addProductToStoreID;
module.exports.removeProduct = removeProduct;
