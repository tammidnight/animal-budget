require("dotenv/config");
require("./db");
const express = require("express");
const hbs = require("hbs");
const app = express();
require("./config")(app);

// default value for title local
const projectName = "animal-budget";
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}`;

// creating an express session
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 24 * 60 * 60,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost/animal-budget",
      ttl: 24 * 60 * 60,
    }),
  })
);

// Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const user = require("./routes/user.routes");
app.use("/", user);

const wallet = require("./routes/wallet.routes");
app.use("/", wallet);

// To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
