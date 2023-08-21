// REQUIRES AND IMPORTS //
const { getIP, setStatus, setTimes, getStatus, checkBlockInterval, getAllChildNames, refreshPoints } = require(relPath(
	"./js/children/helper"
));
const iptables = require("iptables");
const { promisify } = require("util");

// PROMISIFY IPTABLES FUNCTIONS //
const iptAllowSync = promisify(iptables.allow);
const iptDropSync = promisify(iptables.drop);
const iptAppendSync = promisify(iptables.newRule);
const iptDeleteSync = promisify(iptables.deleteRule);

// RETURN ALL TRAFFIC RULE FOR SPECIFIC IP OR && PORT //
function allTraffic(ip, port) {
	if (!port) {
		return {
			source: ip,
			sudo: true,
		};
	} else {
		return {
			source: ip,
			dport: port,
			sudo: true,
		};
	}
}
// RETURN REDIRECT RULE FOR SPECIFIED IP AND PORT //
function redirectTraffic(ip, port) {
	return {
		table: "nat",
		chain: "PREROUTING",
		protocol: "tcp",
		source: ip,
		destinationPort: port,
		jump: "REDIRECT",
		toPort: process.env.USER_PORT,
	};
}
// GENERAL FIREWALL RULES ON START //
function intialiseFirewall() {
	// ALLOWED TRAFFIC TO ADMIN PORT //
	iptables.allow(
		{
			protocol: tcp,
			src: process.env.ADMIN_IP,
			dport: process.env.ADMIN_PORT,
			sudo: true,
		},
		(err) => {
			if (err) {
				console.error("Error adding rule:", err);
			} else {
				console.log(
					`\x1b[1;36mFIREWALL:\x1b[0m ${process.env.ADMIN_PORT} FIREWALL RULE ADDED FOR ${process.env.ADMIN_IP}`
				);
			}
		}
	);
	// ALLOWED TRAFFIC TO USER PORT //
	iptables.allow(
		{
			protocol: tcp,
			dport: process.env.USER_PORT,
			sudo: true,
		},
		(err) => {
			if (err) {
				console.error("Error adding rule:", err);
			} else {
				console.log(`\x1b[1;36mFIREWALL:\x1b[0m ALLOW ALL TO ${process.env.USER_PORT} RULE ADDED`);
			}
		}
	);
	// DENIED TRAFFIC TO ADMIN PORT //
	iptables.drop(
		{
			protocol: "tcp",
			dport: process.env.ADMIN_PORT,
			sudo: true,
		},
		(err) => {
			if (err) {
				console.error("Error adding rule:", err);
			} else {
				console.log(`\x1b[1;36mFIREWALL:\x1b[0m DENY ${process.env.ADMIN_PORT} added`);
			}
		}
	);
}

// BLOCK CHILD //
async function blockChild(cName) {
	const childIP = getIP(cName);
	try {
		// REDIRECT HTTP TCP traffic from port 80 to USER_PORT //
		await iptAppendSync(redirectTraffic(childIP, 80));
		// REDIRECT HTTPS TCP traffic from port 443 to USER_PORT //
		await iptAppendSync(redirectRule(childIP, 443));
		// REJECT ALL OTHER TRAFFIC FOR CHILD //
		await iptDropSync(allTraffic(childIP));
		// SET CHILD STATUS TO BLOCKED //
		await setStatus(cName, 1);
		// NOTIFY ALERT //
		await notifyAlert(`${cName} blocked SUCCESSFULLY`);
	} catch (error) {
		console.error(`Error blocking ${cName}: ${error}`);
	}
}

// UNBLOCK CHILD //
async function unblockChild(cName) {
	const childIP = getIP(cName);
	try {
		// REMOVE HTTP TCP REDIRECT //
		await iptDeleteSync(redirectRule(childIP, 80));
		// REMOVE HTTPS TCP REDIRECT //
		await iptDeleteSync(redirectRule(childIP, 443));
		// DELETE REJECT RULE //
		await iptDeleteSync(allTraffic(childIP));
		// ALLOW ALL TRAFFIC RULE //
		await iptAllowSync(allTraffic(childIP));
		// SET CHILD STATUS TO UNBLOCKED //
		await setStatus(cName, 0);
		// SET BLOCKED TIMES TO NOW //
		await setTimes(cName);
		// SEND NOTIFICATION //
		await notifyAlert(`${cName} UNBLOCKED Succesfully`);
	} catch (error) {
		console.error(`Error unblocking ${cName}: ${error}`);
	}
}

// REFRESH FUNCTIONS //
// CHECKS FOR REFRESH AND RUNS REFRESH ON CONDITION //
async function refresh(cName) {
	try {
		const status = await getStatus(cName);
		const intervalExc = await checkBlockInterval(cName);
		// IF UNBLOCKED && INTERVAL NOT EXCEEDED //
		if (status === "unblocked" && !intervalExc) {
			console.log(`The Block Interval for ${cName} has NOT exceeded. REFRESH DEFERRED`);
		}
		// IF BLOCKED //
		else if (status === "blocked") {
			console.log(`${cName} is NOT unblocked. REFRESH DEFERRED`);
		}
		// IF UNBLOCK && INTERVAL EXCEEDED //
		else if (status === "unblocked" && intervalExc) {
			await refreshPoints(cName);
			await notifyAlert(`Points Refreshed for ${cName}`);
			await blockChild(cName);
		}
	} catch (error) {
		console.error(`An error occured while running refresh: ${error}`);
	}
}

// ITERATES THROUGH ALL CHILDREN AND PERFROMS REFRESHCHECK() ON ALL CHILDREN //
async function refreshHelper() {
	const children = await getAllChildNames();
	const refreshes = children.map((child) => refresh(child));
	try {
		await Promise.all(refreshes);
	} catch (error) {
		console.error(`Error: ${error}`);
	}
}

// EXECUTES REFRESHHELPER EVERY 30 MINS //
function refreshTimer() {
	setInterval(refreshHelper, 1800000);
	console.log("\x1b[33mrefreshTimer:\x1b[0m \x1b[32mRefresh Interval \x1b[32;4mStarted\x1b[0m");
}

// MODULE EXPORTS //
module.exports = { intialiseFirewall, unblockChild, blockChild, refreshTimer, refreshHelper, refresh };
