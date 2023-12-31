// IMPORTS AND REQUIRES //
require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const https = require("https");

// -- GLOBAL FUNCTIONS -- //
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
	console.log(`\x1b[36;4mnotifyAlert:\x1b[0m ${message}`);
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
const serverIP = "0.0.0.0";

// HTTPS CONFIG //
const httpsOptions = {
	key: Buffer.from(process.env.HTTPS_KEY, "base64").toString("ascii"),
	cert: Buffer.from(process.env.HTTPS_CERT, "base64").toString("ascii"),
};

// IMPORT MAINAPP //
const mainApp = require(relPath("./server/mainApp"));

// IMPORT ADMINAPP //
const adminApp = require(relPath("./server/adminApp"));

// IF HTTPS ENABLED IN .ENV //
if (process.env.HTTPS) {
	// mainApp HTTPS LISTENING //
	const mainAppHTTPS = https.createServer(httpsOptions, mainApp);
	mainAppHTTPS.listen(mainPort, serverIP, () => {
		console.log(
			"\x1b[33mCHILD Interface\x1b[0m - \x1b[32mListening on \x1b[0m" +
				`\x1b[97mhttps:// [<server dns name>/"localhost"]:${mainPort}\x1b[0m`
		);
	});
	// adminApp HTTPS LISTENING //
	const adminAppHTTPS = https.createServer(httpsOptions, adminApp);
	adminAppHTTPS.listen(adminPort, serverIP, () => {
		console.log(
			"\x1b[33mADMIN Interface\x1b[0m - \x1b[32mListening on \x1b[0m" +
				`\x1b[97mhttps:// [<server dns name>/"localhost"]:${adminPort}\x1b[0m`
		);
	});
}
// IF HTTPS COMMENTED OUT //
else {
	// mainApp LISTENING //
	mainApp.listen(mainPort, serverIP, () => {
		console.log(
			"\x1b[33mCHILD Interface\x1b[0m - \x1b[32mListening on port \x1b[0m" +
				`\x1b[97mhttp:// [<server dns name>/"localhost"]:${mainPort}\x1b[0m`
		);
	});

	// adminApp LISTENING //
	adminApp.listen(adminPort, serverIP, () => {
		console.log(
			"\x1b[33mADMIN Interface\x1b[0m - \x1b[32mListening on port \x1b[0m" +
				`\x1b[97mhttp:// [<server dns name>/"localhost"]:${adminPort}\x1b[0m`
		);
	});
}

console.log(`\x1b[33mADMIN IP:\x1b[0m \x1b[32m${process.env.ADMIN_IP}\x1b[0m`);

// APP INITIALISATION //
// REQUIRES //

// INTIALISE THE FIREWALL AND SETUP MAIN RULES IF VAR SET //

if (process.env.FIREWALL) {
	const { startFirewall } = require(relPath("./js/admin/gatewayAdmin"));
	startFirewall();
} else {
	console.log(`\x1b[31mFIREWALL CONFIG SKIPPED \x1b[0m -- \x1b[33mFIREWALL VAR NOT SET\x1b[0m`);
}
