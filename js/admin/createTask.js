// REQUIRES and IMPORTS //
const fs = require("fs").promises;
const path = require("path");
const { Task, taskDataLoc } = require(relPath("./js/admin/tasksAdmin"));

// CREATE TASK (ASYNC) //
async function createTask(name, points) {
	var newTask = new Task(undefined, name, points);
	await newTask.createQR();
	var output = JSON.stringify(newTask, null, 2);
	var filePath = path.join(taskDataLoc, `${newTask.id}.json`);
	try {
		fs.writeFile(filePath, output, "utf-8");
		console.log(`${newTask.name} created succesfully with ${newTask.id}`);
	} catch (error) {
		console.error(`Error creating Task: ${error}`);
	}
}

module.exports = createTask;
