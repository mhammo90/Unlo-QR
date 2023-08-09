// IMPORTS AND REQUIRES //
require("dotenv").config();
const express = require("express");
const { intialiseFirewall } = require("./js/admin/gatewayAdmin");

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

// NOTIFCATION FUNCTION //
async function notifyAlert(message, title) {
	// CONSOLE LOG //
	console.log(message);
	// IF NTFY_URL .ENV VAR SET //
	if (process.env.NTFY_URL) {
		await fetch(process.env.NTFY_URL, {
			method: "POST",
			body: message,
			headers: {
				Title: title,
			},
		});
	}
}
global.notifyAlert = notifyAlert;

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

//intialiseFirewall()
