// IMPORTS AND REQUIRES //
require("dotenv").config();
const express = require("express");

// RELATIVE PATH TO ABSOLUTE PATH //
const path = require("path");
function relPath(rel) {
	if (!rel) {
		return;
	}
	const abs = path.resolve(rel);
	return abs;
}
global.relPath = relPath;

// PORTS SET BY .env or MANUALLY
const adminPort = process.env.ADMIN_PORT || 8081;
const mainPort = process.env.MAIN_PORT || 8080;

// IMPORT MAINAPP //
const mainApp = require(relPath("./server/mainApp"));

// mainApp LISTENING //
mainApp.listen(mainPort, () => {
	console.log("Server listening on port " + mainPort);
});

// IMPORT ADMINAPP //
const adminApp = require(relPath("./server/adminApp"));

// adminApp LISTENING //
adminApp.listen(adminPort, () => {
	console.log("Admin Appication running on port " + adminPort);
});
