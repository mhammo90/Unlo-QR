// REQUIRES AND IMPORTS //
const express = require("express");
const router = express.Router();
const { importChild, updateChild } = require(relPath("./js/admin/childAdmin"));
const { getAllChildren, getStatus } = require(relPath("./js/children/helper"));
const { unblockChild, blockChild } = require(relPath("./js/admin/gatewayAdmin"));

// RETURN ALL CHILDREN (JSON) //
router.get("/", async (req, res) => {
	const children = await getAllChildren();
	res.json(children);
});

// RETURN SINGLE CHILD (JSON) //
router.get("/:name", async (req, res) => {
	var name = req.params.name;
	const child = await importChild(name);
	res.json(child);
});

// UPDATE KEY = VALUE PAIRS FOR CHILD //
router.post("/:name/update/:key/:value", async (req, res) => {
	var name = req.params.name;
	var key = req.params.key;
	var value = req.params.value;
	await updateChild(name, key, value);
	res.send(`${name} : ${key} updated to ${value}`);
});

// MANUAL OVERIDE FOR TOGGLE BLOCK STATUS //
// 0 - unblock //
// 1 - block //
router.post("/:name/status/:status", async (req, res) => {
	var name = req.params.name;
	var status = req.params.status;
	var currStat = getStatus(name);
	if ((status === 1 || status === "block") && currStat === "unblocked") {
		blockChild(name);
	} else if ((status === 0 || status === "unblock") && currStat === "blocked") {
		unblockChild(name);
	} else {
		res.send("0 / unblock || 1 / block");
	}
});

module.exports = router;
