// REQUIRES //
const fs = require("fs").promises;
const path = require("path");

// IMPORT CLASS //
const Child = require(relPath("./js/classes/Child"));
// DATA LOCATION //
const childDataLoc = relPath(process.env.CHILD_DATA) || relPath("./data/children");

// IMPORT CHILD (ASYNC) //
async function importChild(cName) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var filePath = path.join(childDataLoc, `${name}.json`);
	try {
		const data = await fs.readFile(filePath, "utf-8");
		const child = JSON.parse(data);
		return new Child(
			child.name,
			child.ip,
			child.refreshInterval,
			child.maxPoints,
			child.status,
			child.currentPoints,
			child.blockTime,
			child.unblockTime
		);
	} catch (error) {
		console.error(`Error Importing ${name}: ${error}`);
		return null;
	}
}

// UPDATE CHILD (ASYNC) //
async function updateChild(cName, key, value) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var filePath = path.join(childDataLoc, `${name}.json`);
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
			console.log(`${name} updated successfully`);
		} catch (error) {
			console.error(`Error updating ${name}: ${error}`);
		}
	}
}

module.exports = { importChild, updateChild, Child, childDataLoc };
