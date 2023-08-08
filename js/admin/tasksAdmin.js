// REQUIRES //
const fs = require("fs");
const path = require("path");

// IMPORT CLASS //
var Task = require(relPath("./js/classes/Task"));
// DATA LOCATION //
var taskDataLoc = relPath(process.env.TASK_DATA) || relPath("./data/tasks");

// IMPORT TASK AS OBJECT //
async function importTask(taskID) {
	var filePath = path.join(taskDataLoc, `${taskID}.json`);
	try {
		const file = await fs.promises.readFile(filePath, "utf-8");
		const task = JSON.parse(file);
		return new Task(task.id, task.taskName, task.taskPoints, task.qrCode);
	} catch (error) {
		console.error(`Error Importing Task: ${error}`);
	}
}

// EXPORTS Task, taskDataLoc and importTask()
module.exports = { Task, taskDataLoc, importTask };
