const session = require("express-session");

const sessionConfig = session({
  secret: "secret",
  resave: true,
  saveUninitialized: true,
});

module.exports = sessionConfig;
