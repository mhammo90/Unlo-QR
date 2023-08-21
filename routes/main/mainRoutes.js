const express = require("express");
const { unblockChild } = require(relPath("./js/admin/gatewayAdmin"));
const router = express.Router();
const { whoIP, getStatus, getPoints, getMax, pointsCheck, completeTask } = require(relPath("./js/children/helper"));

// ERRORS //
function error401(req, res) {
	return res
		.status(401)
		.send(
			`<body style="text-align:center; margin-left: 100px; margin-right: 100px;  border: 5px red solid; background: black"><div style="background:darkred"><h4 style="color: white; margin-top:0">401 ERROR</h4><h2 style="color:red;">Unauthorised <br>IP Address<br> Detected</h2><h4 style="color:white;"><u>ADMIN:</u> ADD BELOW IP TO ASSOCIATED CHILD TO ALLOW ACCESS TO THIS INTERFACE</h4><h3 style="color:blue; margin-bottom:0">${req.ip}</h3></div></body>`
		);
}

// MAIN INTERFACE
router.get("/", async (req, res) => {
	try {
		const currentChild = await whoIP(req.ip);
		if (!currentChild) {
			error401(req, res);
		} else {
			const childStatus = await getStatus(currentChild);
			const currentPoints = await getPoints(currentChild);
			const maxPoints = await getMax(currentChild);
			const percent = (currentPoints / maxPoints) * 100;
			const message = req.query.message || null;
			res.render("index", {
				status: childStatus,
				currentChild,
				currentPoints,
				maxPoints,
				percent,
				message: message,
			});
		}
	} catch (error) {
		console.error(`An Error Occured: ${error}`);
	}
});

// COMPLETE TASK ROUTE //
router.post("/complete", async (req, res) => {
	// CHECK CURRENT CHILD //
	const currentChild = await whoIP(req.ip);
	if (currentChild) {
		try {
			const { taskName, taskPoints } = req.body;
			// COMPLETE TASK //
			await completeTask(currentChild, taskPoints);
			const message = `${taskName} Completed by ${currentChild}. Earned ${taskPoints} points`;
			await notifyAlert(message, `Unlo-QR: Task COMPLETED by ${currentChild}`);
			// POINTS CHECK //
			// IF TRUE THEN UNLOCK //
			var check = await pointsCheck(currentChild);
			if (check) {
				const unblockMessage = `${currentChild} exceeded Max Points. Unblocking`;
				await notifyAlert(unblockMessage, `Unlo-QR: ${currentChild} Unblocking Started`);
				await unblockChild(currentChild);
				res.status(200).json({ message: unblockMessage });
			} else {
				res.status(200).json({ message });
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
