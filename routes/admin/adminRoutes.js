const express = require("express");
const router = express.Router();

const { getAllChildNames } = require(relPath("./js/children/child"));
const { getTaskIDs } = require(relPath("./js/tasks/tasks.js"));

// "/" ADMIN ROUTE //
router.get("/", (req, res) => {
	const tasksTotal = getTaskIDs().length;
	const childrenTotal = getAllChildNames().length;
	res.render("index", { tasksTotal, childrenTotal });
});

module.exports = router;
