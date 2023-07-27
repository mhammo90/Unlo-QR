// REQUIRES and IMPORTS
const fs = require("fs");
const { Child, childDataLoc } = require(relPath("./js/admin/childAdmin"));

// CREATE CHILD
function createChild(name, ip, refresh, max) {
	var newChild = new Child(name, ip, refresh, max);
	var output = JSON.stringify(newChild, null, 2);
	fs.writeFileSync(`${childDataLoc}/${newChild.name}.json`, output);
}

// EXPORT createChild()
module.exports = createChild;
