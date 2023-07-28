// REQUIRES AND IMPORTS //
const fs = require("fs");
const { taskDataLoc, Task, importTask } = require(relPath("./js/admin/tasksAdmin"));

// GET A LIST OF ALL THE TASK IDS - returns ARRAY //
function getTaskIDs() {
	const taskIds = [];
	const files = fs.readdirSync(taskDataLoc);
	files.forEach((file) => {
		var id = file.slice(0, -5);
		taskIds.push(id);
	});
	return taskIds;
}

// GET ALL TASK NAMES - returns ARRAY //
function getTaskNames() {
	const taskNames = [];
	const ids = getTaskIDs();
	ids.forEach((id) => {
		var task = importTask(id);
		taskNames.push(task);
	});
}

// GET ALL TASKS AS OBJECTS AND RETURN THEM AS AN ARRAY - returns ARRAY//
function getAllTasks() {
	tasksArr = [];
	var tasks = getTaskIDs();
	tasks.forEach((task) => {
		var info = importTask(task);
		tasksArr.push(info);
	});
	return tasksArr;
}

// GET POINTS OF TASK - returns INTEGER //
function getTaskPoints(taskID) {
	return importTask(taskID).taskPoints;
}

// SHOW TASK QR CODE - returns QRCODE base64 STRING //
function showTaskQR(taskID) {
	const task = importTask(taskID);
	return task.showQR();
}

// EXPORT getTaskIDs(), getTask(), getAllTasks() //
module.exports = { getTaskIDs, getTaskNames, getAllTasks, getTaskPoints, showTaskQR };
