// REQUIRES AND IMPORTS //
const { getIP, setStatus, setTimes, getStatus, checkBlockInterval, getAllChildNames, refreshPoints } = require(relPath(
	"./js/children/helper"
));
const ipTables = require("iptables");

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
	ipTables.allow(
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
				console.log(`${process.env.ADMIN_PORT} FIREWALL RULE ADDED FOR ${process.env.ADMIN_IP}`);
			}
		}
	);
	// ALLOWED TRAFFIC TO USER PORT //
	ipTables.allow(
		{
			protocol: tcp,
			dport: process.env.USER_PORT,
			sudo: true,
		},
		(err) => {
			if (err) {
				console.error("Error adding rule:", err);
			} else {
				console.log(`ALLOW ALL TO ${process.env.USER_PORT} RULE ADDED`);
			}
		}
	);
	// DENIED TRAFFIC TO ADMIN PORT //
	ipTables.drop(
		{
			protocol: "tcp",
			dport: process.env.ADMIN_PORT,
			sudo: true,
		},
		(err) => {
			if (err) {
				console.error("Error adding rule:", err);
			} else {
				console.log(`DENY ${process.env.ADMIN_PORT} added`);
			}
		}
	);
}

// BLOCK CHILD //
function blockChild(cName) {
	const childIP = getIP(cName);
	// REDIRECT HTTP TCP traffic from port 80 to USER_PORT //
	ipTables.append(redirectTraffic(childIP, 80), (err) => {
		if (err) {
			console.error(`Error ADDING HTTP Redirect rule for ${cName}`, err);
		} else {
			console.log(`HTTP Redirect rule for ${cName} ADDED successfully.`);
		}
	});
	// REDIRECT HTTPS TCP traffic from port 443 to USER_PORT //
	ipTables.append(redirectRule(childIP, 443), (err) => {
		if (err) {
			console.error(`Error ADDING HTTPS Redirect rule for ${cName}`, err);
		} else {
			console.log(`HTTPS Redirect rule for ${cName} ADDED successfully.`);
		}
	});
	// REJECT ALL OTHER TRAFFIC FOR CHILD //
	ipTables.reject(allTraffic(childIP), (err) => {
		if (err) {
			console.error(`Error ADDING REJECT ALL rule for ${cName}`, err);
		} else {
			console.log(`REJECT ALL rule for ${cName} ADDED successfully.`);
		}
	});
	// SET CHILD STATUS TO BLOCKED //
	setStatus(cName, 1);
	// NOTIFY ALERT //
	notifyAlert(`${cName} blocked SUCCESSFULLY`);
}
// UNBLOCK CHILD //
function unblockChild(cName) {
	const childIP = getIP(cName);
	// REMOVE HTTP TCP REDIRECT //
	ipTables.delete(redirectRule(childIP, 80), (err) => {
		if (err) {
			console.error(`Error DELETING HTTP Redirect rule for ${cName}`, err);
		} else {
			console.log(`HTTPS Redirect rule for ${cName} DELETED successfully.`);
		}
	});
	// REMOVE HTTPS TCP REDIRECT //
	ipTables.delete(redirectRule(childIP, 443), (err) => {
		if (err) {
			console.error(`Error DELETING HTTPS Redirect rule for ${cName}`, err);
		} else {
			console.log(`HTTPS Redirect rule for ${cName} DELETED successfully.`);
		}
	});
	// DELETE REJECT RULE //
	ipTables.delete(allTraffic(childIP), (err) => {
		if (err) {
			console.error(`Error DELETING REJECT ALL rule for ${cName}`, err);
		} else {
			console.log(`REJECT ALL rule for ${cName} DELETED successfully.`);
		}
	});
	// ALLOW ALL TRAFFIC RULE //
	ipTables.allow(allTraffic(childIP), (err) => {
		if (err) {
			console.error(`Error ADDING ALLOW ALL rule for ${cName}`, err);
		} else {
			console.log(`ALLOW ALL rule for ${cName} ADDED successfully.`);
		}
	});
	// SET CHILD STATUS TO UNBLOCKED //
	setStatus(cName, 0);
	// SET BLOCKED TIMES TO NOW //
	setTimes(cName);
	// SEND NOTIFICATION //
	notifyAlert(`${cName} UNBLOCKED Succesfully`);
}

// REFRESH FUNCTIONS //
// CHECKS FOR REFRESH AND RUNS REFRESH ON CONDITION //
function refresh(cName) {
	const status = getStatus(cName);
	const intervalExc = checkBlockInterval(cName);
	// IF UNBLOCKED && INTERVAL NOT EXCEEDED //
	if (status === "unblocked" && !intervalExc) {
		console.log(`The Block Interval for ${cName} has NOT exceeded. REFRESH DEFERRED`);
	}
	// IF BLOCKED //
	if (status === "blocked") {
		console.log(`${cName} is NOT unblocked. REFRESH DEFERRED`);
	}
	// IF UNBLOCK && INTERVAL EXCEEDED //
	if (status === "unblocked" && intervalExc) {
		refreshPoints(cName);
		notifyAlert(`Points Refreshed for ${cName}`);
		blockChild(cName);
	}
}

// ITERATES THROUGH ALL CHILDREN AND PERFROMS REFRESHCHECK() ON ALL CHILDREN //
function refreshHelper() {
	const children = getAllChildNames();
	for (const child of children) {
		refresh(child);
	}
	console.log("refreshHelper Completed");
	// STARTS REFRESHTIMER
	refreshTimer();
}

// EXECUTES REFRESHHELPER AFTER 30 MINS //
function refreshTimer() {
	setTimeout(refreshHelper, 1800000);
	console.log("refreshTimer Trigerred");
}

module.exports = { intialiseFirewall, unblockChild, blockChild, refreshTimer, refreshHelper, refresh };
