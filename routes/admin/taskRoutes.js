// IMPORTS AND REQUIRES //
const express = require("express");
const router = express.Router();
const { getAllTasks, showTaskQR } = require(relPath("./js/tasks/tasks.js"));
const { importTask } = require(relPath("./js/admin/tasksAdmin"));

// RETURN ALL TASKS (JSON) //
router.get("/task", (req, res) => {
	const tasks = getAllTasks();
	res.json(tasks);
});

// RETURN SINGLE TASK (JSON) //
router.get("/task/:id", (req, res) => {
	var id = req.params.id;
	const task = importTask(id);
	res.json(task);
});

// RETURN QR WITH <IMG> TAGS //
router.get("/task/:id/qr", (req, res) => {
	var id = req.params.id;
	const qr = showTaskQR(id);
	res.send(`<img src="${qr}"></img>`);
});

module.exports = router;
