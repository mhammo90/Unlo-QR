// REQUIRE AND IMPORT EXPRESS //
const express = require("express");
const adminApp = express();
const bodyParser = require("body-parser");

// ROUTE FILES //
const adminRoutes = require(relPath("./routes/admin/adminRoutes"));
const createRoutes = require(relPath("./routes/admin/createRoutes"));

// SET EJS AND PAGES FOLDER //
adminApp.set("views", relPath("./pages/admin"));
adminApp.set("view engine", "ejs");

// SET PUBLIC SHARED FOLDER //
adminApp.use(express.static(relPath("./public/admin")));
adminApp.use(express.urlencoded({ extended: true }));

// SET BODYPARSER PROPERTIES //
adminApp.use(bodyParser.urlencoded({ extended: false }));
adminApp.use(bodyParser.json());

// SET ROUTES //
adminApp.use("/", adminRoutes);
adminApp.use("/create", createRoutes);

// EXPORT adminApp //
module.exports = adminApp;
