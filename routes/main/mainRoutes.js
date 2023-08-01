const express = require("express");
const router = express.Router();

// Main Route
router.get("/", (req, res) => {
	res.render("index");
});

router.get("/scan", (req, res) => {
	console.log("Scan Accessed");
	res.render("scan");
});

router.post("/complete", (req, res) => {
	// ADD DETECT IP MIDDLEWARE

	try {
		const { taskName, taskPoints } = req.body;
		// ADD COMPLETE TASK CODE

		res.status(200).json({ message: `${taskName} Completed. Earned ${taskPoints} points` });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server Error" });
	}
});

module.exports = router;
