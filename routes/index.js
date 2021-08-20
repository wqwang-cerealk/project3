const express = require('express');
const router = express.Router();

const myDb = require('../db/myMongoDB.js');
const myRedis = require('../db/myRedisDB.js');

/* GET home page. */
router.get('/', async function (req, res) {
  //const store = await myDb.getStore();
  //console.log("got store", store);

  //res.render("./pages/index", { store });
  res.redirect('/store');
});

router.get('/store', async (req, res, next) => {
  console.log('store', req.user);

  const query = req.query.q || '';
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 12;
  const msg = req.query.msg || null;
  try {
    let store = await myDb.getStore(query, page, pageSize);
    let total = await myDb.getStoreCount(query);
    res.render('./pages/index', {
      store,
      query,
      msg,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

//get recently edit store list
router.get('/editStoreList', async (req, res, next) => {
  try {
    let editStore = await myRedis.getEditHistory();
    res.render('./pages/editListPage', { editStore });
  } catch (err) {
    next(err);
  }
});

//edit store
router.get('/store/:store_id/edit', async (req, res, next) => {
  const store_id = req.params.store_id;
  console.log('store_id', { store_id });

  const msg = req.query.msg || null;
  try {
    let sto = await myDb.getStoreByID(store_id);
    console.log('edit store', { sto });

    await myRedis.addToList(sto);

    res.render('./pages/editStore', { sto, msg });
  } catch (err) {
    next(err);
  }
});

router.post('/store/:store_id/edit', async (req, res, next) => {
  const store_id = req.params.store_id;
  const sto = req.body;

  console.log('post&edit', { store_id, sto });

  try {
    let updateResult = await myDb.updateStoreByID(store_id, sto);

    if (updateResult.matchedCount && updateResult.modifiedCount === 1) {
      res.redirect('/store/?msg=Updated');
    } else {
      res.redirect('/store/?msg=Error Updating');
    }
  } catch (err) {
    next(err);
  }
});

//add product to a store
router.post('/store/:store_id/addProduct', async (req, res, next) => {
  console.log('Add product', req.body);
  const store_id = req.params.store_id;
  const product = {
    id: req.body.product_id,
    name: req.body.product_name,
    category: req.body.type,
  };

  console.log('The added product is', req.body);

  try {
    let updateResult = await myDb.addProductToStoreID(store_id, product);
    console.log('update', updateResult);

    if (updateResult && updateResult.modifiedCount === 1) {
      res.redirect(`/store/${store_id}/edit?msg=Product Added`);
    } else {
      res.redirect(`/store/${store_id}/edit?msg=Error adding product`);
    }
  } catch (err) {
    next(err);
  }
});

//remove product from store
router.get(
  '/store/:store_id/removeProduct/:product_id',
  async (req, res, next) => {
    const store_id = req.params.store_id;
    const product_id = req.params.product_id;
    console.log('Product_name type is ', typeof product_id);
    // if (typeof product_id !== 'string'){
    //   product_id = product_id.toString();
    // }
    console.log('remove product is: ', store_id, product_id);

    try {
      let updateResult = await myDb.removeProduct(store_id, product_id);
      console.log('update', updateResult);

      if (updateResult && updateResult.modifiedCount === 1) {
        res.redirect(`/store/${store_id}/edit?msg=Product Deleted`);
      } else {
        res.redirect(`/store/${store_id}/edit?msg=Error deleting product`);
      }
    } catch (err) {
      next(err);
    }
  }
);

//delete a store
router.get('/store/:store_id/delete', async (req, res, next) => {
  const store_id = req.params.store_id;

  try {
    let deleteResult = await myDb.deleteStoreByID(store_id);
    console.log('delete', deleteResult);

    if (deleteResult.deletedCount === 1) {
      res.redirect('/store/?msg=Deleted');
    } else {
      res.redirect('/store/?msg=Error Deleting');
    }
  } catch (err) {
    next(err);
  }
});

//create a store
router.post('/createStore', async (req, res, next) => {
  const sto = req.body;

  try {
    let newStores = await myDb.insertStore(sto);

    //console.log("next step")

    res.redirect('/store/' + sto._id + '/edit');

    //if(newStores.insertedCount === 1 && newStores.insertedId === _id)

    res.redirect('/store/?msg=Inserted');
  } catch (err) {
    //res.redirect("/store/?err=Error inserting");
    next(err);
  }
});

module.exports = router;
