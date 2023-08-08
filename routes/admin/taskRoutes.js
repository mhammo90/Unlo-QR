// IMPORTS AND REQUIRES //
const express = require("express");
const router = express.Router();
const { getAllTasks, showTaskQR } = require(relPath("./js/tasks/tasks.js"));
const { importTask } = require(relPath("./js/admin/tasksAdmin"));

// RETURN ALL TASKS (JSON) //
router.get("/", async (req, res) => {
	const tasks = await getAllTasks();
	res.json(tasks);
});

// RETURN SINGLE TASK (JSON) //
router.get("/:id", async (req, res) => {
	var id = req.params.id;
	const task = await importTask(id);
	res.json(task);
});

// RETURN QR WITH <IMG> TAGS //
router.get("/:id/qr", async (req, res) => {
	var id = req.params.id;
	const qr = await showTaskQR(id);
	res.send(`<img src="${qr}"></img>`);
});

module.exports = router;
