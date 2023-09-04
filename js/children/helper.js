// REQUIRES AND IMPORTS //
const fs = require("fs");
const path = require("path");
const { childDataLoc, updateChild, importChild } = require(relPath("./js/admin/childAdmin"));

// SET status TO "unblocked" (0) OR "blocked" (1) //
async function setStatus(cName, status) {
	try {
		if (status === 0) {
			await updateChild(cName, "status", "unblocked");
		} else if (status === 1) {
			await updateChild(cName, "status", "blocked");
		} else {
			console.error("Unknown Status");
			return;
		}
	} catch (error) {
		console.error(`An Error Occured while setting the status: ${error}`);
	}
}

// SET unblockTime AS now AND blockTime FROM refreshInterval //
async function setTimes(cName) {
	try {
		var date = new Date();
		var unblockTime = date.getTime();
		var child = await importChild(cName);
		await updateChild(cName, "unblockTime", unblockTime);
		var interval = child.refreshInterval;
		var millis = interval * 3600 * 1000;
		var blockTime = unblockTime + millis;
		await updateChild(cName, "blockTime", blockTime);
	} catch (error) {
		console.error(`An Error occured while setting the blocktimes: ${error}`);
	}
}

// GET BLOCK TIME (FORMAT: 0 == Date String, 1 == Enoch Milliseconds) //
async function getBlockTime(cName, format) {
	try {
		var blockTime = await importChild(cName.blockTime);
		if (format === 0) {
			return blockTime;
		} else if (format === 1) {
			var date = new Date(blockTime);
			return date;
		}
	} catch (error) {
		console.error(`An Error occured while retrieving the block time: ${error}`);
	}
}

// GET STATUS //
async function getStatus(cName) {
	try {
		const child = await importChild(cName);
		return child.status;
	} catch (error) {
		console.error(`An Error occurred retrieving the status: ${error}`);
		return null;
	}
}

// CHECK WHETHER INTERVAL EXCEEDED (returns TRUE / FALSE) //
async function checkBlockInterval(cName) {
	try {
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
	} catch (error) {
		console.error(`An error occured while retrieving the blocked interval: ${error}`);
	}
}

// GET CHILD IP //
async function getIP(cName) {
	try {
		var child = await importChild(cName);
		return child.ip;
	} catch (error) {
		console.error(`An error occured while retrieving the child ip: ${error}`);
	}
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
		var allChildren = await Promise.all(children.map(async (child) => await importChild(child)));
		return allChildren;
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
	}
}

// WHO IP - returns NAME of IP owner
async function whoIP(ip) {
	try {
		var names = await getAllChildNames();
		for (const name of names) {
			const child = await importChild(name);
			if (child && child.ip === ip) {
				return name;
			}
		}
		return null;
	} catch (error) {
		console.error(`An error occured while retrieving name: ${error}`);
	}
}

// COMPLETE TASK //
async function completeTask(cName, points) {
	try {
		await addPoints(cName, points);
	} catch (error) {
		console.error(`An error occured while COMPLETING THE TASK: ${error}`);
	}
}

// GET CURRENT POINTS//
async function getPoints(cName) {
	try {
		var child = await importChild(cName);
		return child.currentPoints;
	} catch (error) {
		console.error(`An error occured while retreiving points: ${error}`);
	}
}
// GET MAX POINTS //
async function getMax(cName) {
	try {
		var child = await importChild(cName);
		return child.maxPoints;
	} catch (error) {
		console.error(`An error occured while retreiving points: ${error}`);
	}
}
// SET CURRENT POINTS //
async function setPoints(cName, points) {
	try {
		await updateChild(cName, "currentPoints", points);
	} catch (error) {
		console.error(`An error occured while setting points: ${error}`);
	}
}

// SET POINTS TO 0 //
async function refreshPoints(cName) {
	try {
		await setPoints(cName, 0);
	} catch (error) {
		console.error(`An error occured while refreshing: ${error}`);
	}
}

// ADD POINTS //
async function addPoints(cName, points) {
	try {
		var curr = await getPoints(cName);
		var newP = curr + points;
		await setPoints(cName, newP);
	} catch (error) {
		console.error(`An error occured while setting points: ${error}`);
	}
}

// POINTS CHECK - IF CURRENT > MAX = TRUE
async function pointsCheck(cName) {
	try {
		var current = await getPoints(cName);
		var max = await getMax(cName);
		if (current >= max) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		console.error(`An error occured while checking the points: ${error}`);
	}
}

// MODULE EXPORTS //
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
