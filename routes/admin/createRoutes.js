// REQUIRES AND IMPORTS //
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

// IMPORT CREATE FUNCTIONS //
const createTask = require(relPath("./js/admin/createTask"));
const createChild = require(relPath("./js/admin/createChild"));

// CREATE CHILD (/create/child) //
router.post("/child", (req, res) => {
	createChild(req.body.name, req.body.ip, req.body.refreshInterval, req.body.maxPoints);
	res.status(201).send(`${req.body.name} successfully created`);
});

// CREATE TASKS (/create/task) //
router.post("/task", (req, res) => {
	createTask(req.body.name, req.body.points);
	res.status(201).send(`${req.body.name} successfully created`);
});

module.exports = router;
