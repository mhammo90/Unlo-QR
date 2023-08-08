// IMPORT CLASS
var Task = require(relPath("./js/classes/Task"));
// DATA LOCATION
var taskDataLoc = relPath(process.env.TASK_DATA) || relPath("./data/tasks");

// IMPORT TASK AS OBJECT //
function importTask(taskID) {
	var task = require(`${taskDataLoc}/${taskID}.json`);
	var taskObj = new Task(task.id, task.taskName, task.taskPoints, task.qrCode);
	return taskObj;
}

// EXPORTS Task, taskDataLoc and importTask()
module.exports = { Task, taskDataLoc, importTask };
