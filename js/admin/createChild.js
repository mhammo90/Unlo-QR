// REQUIRES and IMPORTS //
const fs = require("fs").promises;
const { Child, childDataLoc } = require(relPath("./js/admin/childAdmin"));
const path = require("path");

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

module.exports = createChild;
