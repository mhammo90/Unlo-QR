const { addPoints, pointsCheck } = require(relPath("./points.js"));
const { unblockChild } = require(relPath("../admin/gatewayAdmin.js"));

function completeTask(cName, points) {
	if (!pointsCheck(cName)) {
		addPoints(cName, points);
	}
	if (pointsCheck(cName)) {
		unblockChild(cName);
		return;
	}
}

module.exports = { completeTask };
