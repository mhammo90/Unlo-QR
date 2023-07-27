// IMPORT CLASS
const Child = require(relPath("./js/classes/Child"));
// DATA LOCATION
const childDataLoc = relPath(process.env.CHILD_DATA) || relPath("./data/children");

function importChild(cName) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var child = require(`${childDataLoc}/${name}.json`);
	var childObj = new Child(
		child.name,
		child.ip,
		child.refreshInterval,
		child.maxPoints,
		child.status,
		child.currentPoints,
		child.blockTime,
		child.unblockTime
	);
	return childObj;
}

function updateChild(cName, key, value) {
	var name = cName.charAt(0).toUpperCase() + cName.slice(1);
	var child = importChild(name);
	if (child.key === value) {
		return;
	} else {
		child.update(key, value);
		var output = JSON.stringify(child, null, 2);
		fs.writeFileSync(`${childDataLoc}/${name}.json`, output);
	}
}

module.exports = { importChild, updateChild, Child, childDataLoc };
