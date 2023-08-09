// REQUIRES AND IMPORTS //
const fs = require("fs");
const path = require("path");
const { childDataLoc, updateChild, importChild } = require(relPath("./js/admin/childAdmin"));

// SET status TO "unblocked" (0) OR "blocked" (1) //
async function setStatus(cName, status) {
	if (status === 0) {
		await updateChild(cName, "status", "unblocked");
	} else if (status === 1) {
		await updateChild(cName, "status", "blocked");
	} else {
		console.error("Unknown Status");
		return;
	}
}

// SET unblockTime AS now AND blockTime FROM refreshInterval //
async function setTimes(cName) {
	var date = new Date();
	var unblockTime = date.getTime();
	var child = await importChild(cName);
	await updateChild(cName, "unblockTime", unblockTime);
	var interval = child.refreshInterval;
	var millis = interval * 3600 * 1000;
	var blockTime = unblockTime + millis;
	await updateChild(cName, "blockTime", blockTime);
}

// GET BLOCK TIME (FORMAT: 0 == Date String, 1 == Enoch Milliseconds) //
async function getBlockTime(cName, format) {
	var blockTime = await importChild(cName.blockTime);
	if (format === 0) {
		return blockTime;
	} else if (format === 1) {
		var date = new Date(blockTime);
		return date;
	}
}

// GET STATUS //
async function getStatus(cName) {
	var status = await importChild(cName).status;
	return status;
}

// CHECK WHETHER INTERVAL EXCEEDED (returns TRUE / FALSE) //
async function checkBlockInterval(cName) {
	var status = await getStatus(cName);
	if (status === "unblocked") {
		var block = await getBlockTime(cName, 1);
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
async function getIP(cName) {
	var ip = await importChild(cName).ip;
	return ip;
}

// GET ALL CHILD NAMES //
async function getAllChildNames() {
	try {
		const children = await fs.promises.readdir(childDataLoc);
		return children.map((child) => child.slice(0, -5));
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
		return [];
	}
}

// GET ALL CHILDREN //
async function getAllChildren() {
	try {
		const children = await getAllChildNames();
		return children.map((child) => importChild(child));
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
	}
}

// WHO IP - returns NAME of IP owner
async function whoIP(ip) {
	var names = await getAllChildNames();
	for (const name of names) {
		const child = await importChild(name);
		if (child && child.ip === ip) {
			return name;
		}
	}
	return null;
}

// COMPLETE TASK //
async function completeTask(cName, points) {
	await addPoints(cName, points);
}

// GET CURRENT POINTS//
async function getPoints(cName) {
	var curr = await importChild(cName).currentPoints;
	return curr;
}
// GET MAX POINTS //
async function getMax(cName) {
	var max = await importChild(cName).maxPoints;
	return max;
}
// SET CURRENT POINTS //
async function setPoints(cName, points) {
	await updateChild(cName, "currentPoints", points);
}

// SET POINTS TO 0 //
async function refreshPoints(cName) {
	await setPoints(cName, 0);
}

// ADD POINTS //
async function addPoints(cName, points) {
	var curr = await getPoints(cName);
	var newP = curr + points;
	await setPoints(cName, newP);
}

// POINTS CHECK - IF CURRENT > MAX = TRUE
async function pointsCheck(cName) {
	var current = await getPoints(cName);
	var max = await getMax(cName);
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
	getAllChildren,
};
