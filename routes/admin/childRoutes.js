// REQUIRES AND IMPORTS //
const express = require("express");
const router = express.Router();
const { importChild, updateChild } = require(relPath("./js/admin/childAdmin"));
const { getAllChildren } = require(relPath("./js/children/helper"));

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
router.post("/:name/:key/:value", async (req, res) => {
	var name = req.params.name;
	var key = req.params.key;
	var value = req.params.value;
	await updateChild(name, key, value);
	res.send(`${name} : ${key} updated to ${value}`);
});

module.exports = router;
