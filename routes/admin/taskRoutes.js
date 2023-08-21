// IMPORTS AND REQUIRES //
const express = require("express");
const router = express.Router();
const { showTaskQR } = require(relPath("./js/tasks/tasks.js"));
const { createTask, deleteTask, importTask } = require(relPath("./js/admin/tasksAdmin"));

// RETURN QR WITH <IMG> TAGS //
router.get("/:id/qr/", async (req, res) => {
	try {
		var id = req.params.id;
		const qr = await showTaskQR(id);
		res.send(qr);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
		var message = error;
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	}
});

// DELETE A TASK //
router.post("/delete/:id", async (req, res) => {
	try {
		var id = req.params.id;
		var task = await importTask(id);
		var name = task.taskName;
		await deleteTask(id);
		var message = `Task: ${name} (${id}) Deleted!`;
		await notifyAlert(message, "Unlo-QR: Task DELETED");
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
		var message = error;
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	}
});

// CREATE A TASK //
router.post("/create", async (req, res) => {
	try {
		console.log(req.body);
		var taskName = req.body.taskName;
		var taskPoints = req.body.taskPoints;
		await createTask(taskName, taskPoints);
		var message = `Task: ${req.body.taskName} created!`;
		await notifyAlert(message, "Unlo-QR: Task CREATED");
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
		var message = error;
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	}
});

module.exports = router;
