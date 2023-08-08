const express = require("express");
const router = express.Router();

const { getAllChildNames } = require(relPath("./js/children/child"));
const { getTaskIDs } = require(relPath("./js/tasks/tasks.js"));

// "/" ADMIN ROUTE //
router.get("/", async (req, res) => {
	const tasksTotal = await getTaskIDs().length;
	const childrenTotal = await getAllChildNames().length;
	res.render("index", { tasksTotal, childrenTotal });
});

module.exports = router;
