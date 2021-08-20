const express = require("express");
const router = express.Router();
var crypto = require("crypto");

const myDBRedis = require("../db/myRedisDB.js");

/* GET home page. */
router.get("/new", async function (req, res) {
  const msg = req.query.msg || null;
  res.render("./pages/signup", { msg, user: req.user });
});

router.post("/", async (req, res, next) => {
  try {

  await myDBRedis.createUser(req.body.username, req.body.password, req.body.name);
  res.redirect("/?msg='User created'");
  }catch(err){
    next(err);
  }
 
});


//   const salt = crypto.randomBytes(16);

//   crypto.pbkdf2(
//     req.body.password,
//     salt,
//     10000,
//     32,
//     "sha256",
//     async function (err, hashedPassword) {
//       if (err) {
//         return next(err);
//       }
//       try {
//         await myDBRedis.createUser(
//           req.body.username,
//           hashedPassword.toString("base64"),
//           req.body.name,
//           salt.toString("base64")
//         );
//         res.redirect("/?msg='User created'");
//       } catch (err) {
//         next(err);
//       }
//     }
//   );
// });

module.exports = router;