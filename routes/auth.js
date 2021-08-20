var express = require("express");
var passport = require("passport");

var router = express.Router();

/* GET users listing. */
router.get("/login", function (req, res, next) {
  const msg = req.query.msg || null;
  // if (msg) req.session.messages = [msg];
  res.render("./pages/login", { msg, user: req.user});
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })
);

router.get("/logout", function (req, res, next) {
  req.logout();
  res.redirect("/");
});

module.exports = router;