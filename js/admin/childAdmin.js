// REQUIRES //
const fs = require("fs").promises;
const path = require("path");

// IMPORT CLASS //
const Child = require(relPath("./js/classes/Child"));

// DATA LOCATION //
const childDataLoc = relPath("./data/children");

// IMPORT CHILD (ASYNC) //
async function importChild(cName) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var filePath = path.join(childDataLoc, `${name}.json`);
	try {
		const data = await fs.readFile(filePath, "utf-8");
		const child = JSON.parse(data);
		const rValue = new Child(
			child.name,
			child.ip,
			child.refreshInterval,
			child.maxPoints,
			child.status,
			child.currentPoints,
			child.blockTime,
			child.unblockTime
		);
		return rValue;
	} catch (error) {
		console.error(`Error Importing ${name}: ${error}`);
		return null;
	}
}

// UPDATE CHILD (ASYNC) //
async function updateChild(cName, key, value) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var filePath = path.join(childDataLoc, `${name}.json`);
	try {
		var child = await importChild(name);
		if (!child) {
			console.error(`Child ${name} not found.`);
			return;
		}
		if (child[key] === value) {
			return;
		} else {
			child.update(key, value);
			var output = JSON.stringify(child, null, 2);
			try {
				await fs.writeFile(filePath, output, "utf-8");
				console.log(`${name} updated successfully: ${key}`);
			} catch (error) {
				console.error(`Error updating ${name}: ${error}`);
			}
		}
	} catch (error) {
		console.error(`An occured while updating the child ${name}: ${error}`);
	}
}

// DELETE CHILD FUNCTION (ASYNC)
async function deleteChild(cName) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var filePath = path.join(childDataLoc, `${name}.json`);
	try {
		await fs.unlink(filePath);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
	}
}

// CREATE CHILD (ASYNC) //
async function createChild(name, ip, refresh, max) {
	var newChild = new Child(name, ip, refresh, max);
	var filePath = path.join(childDataLoc, `${newChild.name}.json`);
	var output = JSON.stringify(newChild, null, 2);
	try {
		await fs.writeFile(filePath, output, "utf-8");
		console.log(`${newChild.name} created Successfully`);
	} catch (error) {
		console.error(`Error creating child: ${error}`);
	}
}

// MODULE EXPORTS //
module.exports = { createChild, importChild, updateChild, deleteChild, Child, childDataLoc };
