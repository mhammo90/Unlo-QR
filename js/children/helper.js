// REQUIRES AND IMPORTS //
const fs = require("fs");
const { childDataLoc, updateChild, importChild } = require(relPath("./js/admin/childAdmin"));

// SET status TO "unblocked" (0) OR "blocked" (1) //
function setStatus(cName, status) {
	if (status === 0) {
		updateChild(cName, "status", "unblocked");
	} else if (status === 1) {
		updateChild(cName, "status", "blocked");
	} else {
		console.error("Unknown Status");
		return;
	}
}

// SET unblockTime AS now AND blockTime FROM refreshInterval //
function setTimes(cName) {
	var date = new Date();
	var unblockTime = date.getTime();
	var child = importChild(cName);
	updateChild(cName, "unblockTime", unblockTime);
	var interval = child.refreshInterval;
	var millis = interval * 3600 * 1000;
	var blockTime = unblockTime + millis;
	updateChild(cName, "blockTime", blockTime);
}

// GET BLOCK TIME (FORMAT: 0 == Date String, 1 == Enoch Milliseconds) //
function getBlockTime(cName, format) {
	var blockTime = importChild(cName.blockTime);
	if (format === 0) {
		return blockTime;
	} else if (format === 1) {
		var date = new Date(blockTime);
		return date;
	}
}

// GET STATUS //
function getStatus(cName) {
	var status = importChild(cName).status;
	return child.status;
}

// CHECK WHETHER INTERVAL EXCEEDED (returns TRUE / FALSE) //
function checkBlockInterval(cName) {
	if (getStatus(cName) === "unblocked") {
		getBlockTime(cName, 1);
		var now = Date.now();
		if (now < block) {
			return false;
		} else if (now > block) {
			return true;
		} else {
			return;
		}
	} else {
		return;
	}
}

// GET CHILD IP //
function getIP(cName) {
	var ip = importChild(cName).ip;
	return ip;
}

// GET ALL CHILD NAMES //
function getAllChildNames() {
	const children = [];
	const files = fs.readdirSync(childDataLoc);
	files.forEach((file) => {
		var name = file.slice(0, -5);
		children.push(name);
	});
	return children;
}
// WHO IP - returns NAME of IP owner
function whoIP(ip) {
	var names = getAllChildNames();
	names.forEach((child) => {
		let obj = importChild(child);
		var childIP = child.ip;
		if (childIP === ip) {
			return child;
		}
	});
}
// COMPLETE TASK //
function completeTask(cName, points) {
	addPoints(cName, points);
}

// GET CURRENT POINTS//
function getPoints(cName) {
	var curr = importChild(cName).currentPoints;
	return curr;
}
// GET MAX POINTS //
function getMax(cName) {
	var max = importChild(cName).maxPoints;
	return max;
}
// SET CURRENT POINTS //
function setPoints(cName, points) {
	updateChild(cName, "currentPoints", points);
}

// SET POINTS TO 0 //
function refreshPoints(cName) {
	setPoints(cName, 0);
}

// ADD POINTS //
function addPoints(cName, points) {
	var curr = getPoints(cName);
	var newP = curr + points;
	setPoints(cName, newP);
}

// POINTS CHECK - IF CURRENT > MAX = TRUE
function pointsCheck(cName) {
	var current = getPoints(cName);
	var max = getMax(cName);
	if (current >= max) {
		return true;
	} else {
		return false;
	}
}

module.exports = {
	setStatus,
	setTimes,
	checkBlockInterval,
	getBlockTime,
	getStatus,
	getIP,
	getAllChildNames,
	whoIP,
	completeTask,
	addPoints,
	pointsCheck,
	getPoints,
	getMax,
	setPoints,
	refreshPoints,
};
