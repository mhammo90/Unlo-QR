// REQUIRES AND IMPORTS //
const fs = require("fs");
const { taskDataLoc, importTask } = require(relPath("./js/admin/tasksAdmin"));

// GET A LIST OF ALL THE TASK IDS - returns ARRAY //
async function getTaskIDs() {
	try {
		const tasks = await fs.promises.readdir(taskDataLoc);
		return tasks.map((task) => task.slice(0, -5));
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
	}
}

// GET ALL TASK NAMES - returns ARRAY //
async function getTaskNames() {
	var names = [];
	try {
		const ids = await getTaskIDs();
		for (const id in ids) {
			var task = await importTask(id);
			names.push(task.taskName);
		}
		return names;
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
	}
}

// GET ALL TASKS AS OBJECTS AND RETURN THEM AS AN ARRAY - returns ARRAY//
async function getAllTasks() {
	try {
		var ids = await getTaskIDs();
		var tasks = await Promise.all(ids.map(async (id) => await importTask(id)));
		return tasks;
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
	}
}

// SHOW TASK QR CODE - returns QRCODE base64 STRING //
async function showTaskQR(taskID) {
	try {
		const task = await importTask(taskID);

		return task.showQR();
	} catch (error) {
		console.error(`An error occured while showing the QR code: ${error}`);
	}
}

// EXPORT getTaskIDs(), getTask(), getAllTasks() //
module.exports = { getTaskIDs, getTaskNames, getAllTasks, showTaskQR };
