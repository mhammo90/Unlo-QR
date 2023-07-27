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

// GET TASK AS OBJECT FROM ID - returns Task OBJECT //
function getTask(taskID) {
	const file = require(`${taskDataLoc}/${taskID}.json`);
	var task = new Task(file.id, file.taskName, file.taskPoints, file.qrCode);
	return task;
}

// GET ALL TASKS AS OBJECTS AND RETURN THEM AS AN ARRAY - returns ARRAY//
function getAllTasks() {
	tasksArr = [];
	var tasks = getTaskIDs();
	tasks.forEach((task) => {
		var info = getTask(task);
		tasksArr.push(info);
	});
	return tasksArr;
}

// EXPORT getTaskIDs(), getTask(), getAllTasks() //
module.exports = { getTaskIDs, getTask, getAllTasks };
