// REQUIRE AND IMPORT EXPRESS //
const express = require("express");
const mainApp = express();
const bodyParser = require("body-parser");

// ROUTES FILES //
const mainRoutes = require(relPath("./routes/main/mainRoutes"));
const addRoutes = require(relPath("./routes/main/addRoutes"));

// SET EJS AND PAGES FOLDER //
mainApp.set("views", relPath("./pages/main"));
mainApp.set("view engine", "ejs");

// SET PUBLIC SHARED FOLDER //
mainApp.use(express.static(relPath("./public/main")));
mainApp.use(express.urlencoded({ extended: true }));

// SET BODYPARSER PROPERTIES //
mainApp.use(bodyParser.urlencoded({ extended: false }));
mainApp.use(bodyParser.json());

// SET ROUTES //
mainApp.use("/", mainRoutes);
//mainApp.use("/add", addRoutes);

// EXPORT mainAPP //
module.exports = mainApp;
