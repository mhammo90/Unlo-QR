const express = require("express");
const { unblockChild } = require(relpath("./js/admin/gatewayAdmin"));
const router = express.Router();
const { whoIP, getStatus, pointsCheck, completeTask } = require(relPath("./js/children/helper"));

// ERRORS //
function error401(req, res) {
	return res
		.status(401)
		.send(
			`<body style="text-align:center; margin-left: 100px; margin-right: 100px;  border: 5px red solid; background: black"><div style="background:darkred"><h4 style="color: white; margin-top:0">401 ERROR</h4><h2 style="color:red;">Unauthorised <br>IP Address<br> Detected</h2><h3 style="color:blue; margin-bottom:0">${req.ip}</h3></div></body>`
		);
}

// MAIN INTERFACE
router.get("/", (req, res) => {
	const currentChild = whoIP(req.ip);
	const childStatus = getStatus(currentChild);
	if (!currentChild) {
		error401(req, res);
	} else {
		res.render("index", { status: childStatus });
	}
});

// COMPLETE TASK ROUTE //
router.post("/complete", (req, res) => {
	// CHECK CURRENT CHILD //
	const currentChild = whoIP(req.ip);
	if (currentChild) {
		try {
			const { taskName, taskPoints } = req.body;
			// COMPLETE TASK //
			completeTask(currentChild, taskPoints);
			const message = `${taskName} Completed. Earned ${taskPoints} points`;
			notifyAlert(message);
			// POINTS CHECK //
			// IF TRUE THEN UNLOCK //
			if (pointsCheck(currentChild)) {
				unblockChild(currentChild);
				res.render("index", { status: "unblocked", message: message });
			} else {
				// ELSE CONTINUE //
				res.render("index", { status: "blocked", message: message });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Server Error" });
		}
	} else {
		error401(req, res);
	}
});

module.exports = router;
