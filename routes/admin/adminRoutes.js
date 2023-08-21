// REQUIRES AND IMPORTS //
const express = require("express");
const router = express.Router();
const { getAllChildren } = require(relPath("./js/children/helper"));
const { getAllTasks } = require(relPath("./js/tasks/tasks.js"));

// "/" ADMIN ROUTE //
router.get("/", async (req, res) => {
	try {
		const tasks = await getAllTasks();
		const children = await getAllChildren();
		const message = req.query.message || null;
		res.render("index", { tasks, children, message });
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
	}
});

module.exports = router;
