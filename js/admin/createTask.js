// REQUIRES and IMPORTS
const fs = require("fs");
const { Task, taskDataLoc } = require(relPath("./js/admin/tasksAdmin"));

// CREATE TASK
async function createTask(name, points) {
	var newTask = new Task(undefined, name, points);
	await newTask.createQR();
	var output = JSON.stringify(newTask, null, 2);
	fs.writeFileSync(`${taskDataLoc}/${newTask.id}.json`, output);
}

// EXPORT createTask()
module.exports = createTask;
