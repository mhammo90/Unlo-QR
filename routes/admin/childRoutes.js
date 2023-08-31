// REQUIRES AND IMPORTS //
const express = require("express");
const router = express.Router();
const { deleteChild, createChild } = require(relPath("./js/admin/childAdmin"));
const { childrenFirewallRules } = require(relPath("./js/admin/gatewayAdmin"));

// CREATE CHILD (/create/child) //
router.post("/create", async (req, res) => {
	try {
		var { childName, childIp, childRefreshInterval, childMaxPoints } = req.body;
		await createChild(childName, childIp, childRefreshInterval, childMaxPoints);
		var message = `Child: ${childName} created!`;
		await notifyAlert(message, "Unlo-QR: Child CREATED");
		await childrenFirewallRules();
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
		var message = error;
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	}
});

// DELETE CHILD //
router.post("/delete/:name", async (req, res) => {
	try {
		var name = req.params.name;
		await deleteChild(name);
		var message = `Child: ${name} Deleted!`;
		await notifyAlert(message, "Unlo-QR: Child DELETED");
		res.redirect(`/?message=${encodeURIComponent(message)}`);
	} catch (error) {
		console.error(`An Error has occured: ${error}`);
	}
});

module.exports = router;
