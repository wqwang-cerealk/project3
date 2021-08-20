const express = require("express");
const router = express.Router();

const myDBRedis = require("../db/myRedisDB.js");

/* GET home page. */
router.get("/history", async function (req, res) {
  console.log("Getting top three now");

  try{
    return await myDBRedis.getTopThreeScore();
  }catch(err){
    next(err);
  }
  res.render("./pages/history");
});



router.post('/history/edit', async (req, res, next) => {
  const store_id = req.body.store_id;
  const score = req.body.addedScore;

  console.log('post&edit', { store_id, score });

  try {
    let updateRes = await myDBRedis.editScore(store_id, score);

    if (updateResult.matchedCount && updateResult.modifiedCount === 1) {
      res.redirect('/history/?msg=Updated');
    } else {
      res.redirect('/history/?msg=Error Updating');
    }
  } catch (err) {
    next(err);
  }
});

router.get('/store/history/delete', async (req, res, next) => {
  const store_id = req.params.store_id;

  try {
    let deleteResult = await myDBRedis.deleteEditHistory(store_id));
    console.log('delete', deleteResult);

    if (deleteResult.deletedCount === 1) {
      res.redirect('/history/?msg=Deleted');
    } else {
      res.redirect('/history/?msg=Error Deleting');
    }
  } catch (err) {
    next(err);
  }
});