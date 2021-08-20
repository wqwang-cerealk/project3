var passport = require("passport");
var Strategy = require("passport-local");
var crypto = require("crypto");

var myDBRedis = require("../db/myRedisDB.js");

module.exports = function () {
  // Configure the local strategy for use by Passport.
  //
  // The local strategy requires a `verify` function which receives the credentials
  // (`username` and `password`) submitted by the user.  The function must verify
  // that the password is correct and then invoke `cb` with a user object, which
  // will be set at `req.user` in route handlers after authentication.
  passport.use(
    new Strategy(async function (username, password, cb) {
      console.log("Authenticate", username, password);

      try{
      const user = await myDBRedis.getUser(username);

      if(!user){
        console.log("User not found", username);
        cb(null, false, { message: "Incorrect username or password." });
        return;
      }

      if (user.password !== password) {

        console.log("wrong password", username);

        cb(null, false, { message: "Incorrect username or password." });

        return;
      }

      console.log("login successful", username);

      cb(null,user);
      }catch (err) {
        console.log("Error accessing the redis user db", username);
        cb(err);
      }
      // console.log("Authenticate", username, password);

      // try {
      //   const user = await myDBRedis.getUser(username);

      //   if (!user) {
      //     console.log("User not found", username);
      //     cb(null, false, { message: "Incorrect username or password." });

      //     return;
      //   }

      //   crypto.pbkdf2(
      //     password,
      //     Buffer.from(user.salt, "base64"),
      //     10000,
      //     32,
      //     "sha256",
      //     function (err, hashedPassword) {
      //       if (err) {
      //         return cb(err);
      //       }
      //       if (!crypto.timingSafeEqual(Buffer.from(user.hashedPassword, "base64"), hashedPassword)) {
      //         console.log("Wrong password", username);
      //         return cb(null, false, {
      //           message: "Incorrect username or password.",
      //         });
      //       }

      //       var userLessAttribs = {
      //         username: user.username,
      //         name: user.name,
      //       };
      //       return cb(null, userLessAttribs);
      //     }
      //   );
      // } catch (err) {
      //   console.log("Error accessing the redis user db", username);
      //   cb(err);
      // }

      // db.get(
      //   "SELECT rowid AS id, * FROM users WHERE username = ?",
      //   [username],
      //   function (err, row) {
      //     if (err) {
      //       return cb(err);
      //     }
      //     if (!row) {
      //       return cb(null, false, {
      //         message: "Incorrect username or password.",
      //       });
      //     }

      // }
      // );
    })
  );

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, { username: user.username });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};