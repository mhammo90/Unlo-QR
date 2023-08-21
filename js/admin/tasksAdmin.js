// REQUIRES //
const fs = require("fs").promises;
const path = require("path");

// IMPORT CLASS //
var Task = require(relPath("./js/classes/Task"));
// DATA LOCATION //
var taskDataLoc = relPath(process.env.TASK_DATA) || relPath("./data/tasks");

// IMPORT TASK AS OBJECT //
async function importTask(taskID) {
	var filePath = path.join(taskDataLoc, `${taskID}.json`);
	try {
		const file = await fs.readFile(filePath, "utf-8");
		const task = JSON.parse(file);
		return new Task(task.id, task.taskName, task.taskPoints, task.qrCode);
	} catch (error) {
		console.error(`Error Importing Task: ${error}`);
	}
}

// CREATE TASK (ASYNC) //
async function createTask(name, points) {
	var newTask = new Task(undefined, name, points);
	await newTask.createQR();
	var output = JSON.stringify(newTask, null, 2);
	var filePath = path.join(taskDataLoc, `${newTask.id}.json`);
	try {
		fs.writeFile(filePath, output, "utf-8");
		console.log(`${newTask.taskName} created succesfully with ${newTask.id}`);
	} catch (error) {
		console.error(`Error creating Task: ${error}`);
	}
}

// DELETE TASK (ASYNC) //
async function deleteTask(id) {
	var filePath = path.join(taskDataLoc, `${id}.json`);
	try {
		await fs.unlink(filePath);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
	}
}

// MODULE EXPORTS //
module.exports = { Task, taskDataLoc, importTask, createTask, deleteTask };
