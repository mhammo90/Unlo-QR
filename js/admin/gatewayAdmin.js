// REQUIRES AND IMPORTS //

// READD RELPATH AFTER TESTING
const {
	getIP,
	setStatus,
	setTimes,
	getStatus,
	checkBlockInterval,
	getAllChildNames,
	refreshPoints,
} = require("./js/children/helper");
const iptables = require("iptables");

function fwConsole(message) {
	console.log(`\x1b[1;36mFIREWALL:\x1b[0m ${message}`);
}

function newFWChain(chain) {
	iptables.newRule({ chain: chain, action: "-N" });
}
function newFWNATChain(chain) {
	iptables.newRule({ chain: chain, action: "-t nat -N" });
}

function newTopJumpRule(chain, target) {
	const chain1 = chain + " 1";
	iptables.newRule({ chain: chain1, action: "-I", target: target });
}

function newTopNATJumpRule(chain, target) {
	const chain1 = chain + " 1";
	iptables.newRule({ chain: chain1, action: "-t nat -I", target: target });
}

const customChains = ["UNLOCKER_IN", "UNLOCKER_FW", "UNLOCKER_PRE"];

function newFirewallSetup() {
	fwConsole("NEW FIREWALL SETUP INITIATED");
	newFWChain(customChains[0]);
	fwConsole("CUSTOM INPUT CHAIN CREATED");
	newTopJumpRule("INPUT", customChains[0]);
	fwConsole("CUSTOM INPUT chain linked to INPUT via Jump Rule");
	newFWChain(customChains[1]);
	fwConsole("CUSTOM FORWARD CHAIN CREATED");
	newTopJumpRule("FORWARD", customChains[1]);
	fwConsole("CUSTOM FORWARD chain linked to FORWARD via Jump Rule");
	newFWNATChain(customChains[2]);
	fwConsole("CUSTOM PREROUTING NAT CHAIN CREATED");
	newTopNATJumpRule("PREROUTING", customChains[2]);
	fwConsole("CUSTOM PREROUTING NAT chain linked to PREROUTING NAT via Jump Rule ");
}

function flushCustomChains() {
	function flush(chain) {
		iptables.newRule({ chain: chain, action: "-F" });
	}
	function flushNAT(chain) {
		iptables.newRule({ chain: chain, action: "-t nat -F" });
	}

	flush(customChains[0]);
	fwConsole(`${customChains[0]} FLUSHED`);
	flush(customChains[1]);
	fwConsole(`${customChains[1]} FLUSHED`);
	flushNAT(customChains[2]);
	fwConsole(`${customChains[2]} FLUSHED`);
}

function adminRules(adminIP, adminPort) {
	const inChain = customChains[0];
	iptables.allow({ chain: inChain, protocol: "tcp", source: adminIP, dport: adminPort });
	fwConsole(`${adminIP} allowed to ${adminPort} for Admin Access`);
	iptables.drop({ chain: inChain, protocol: "tcp", dport: adminPort });
	fwConsole(`All other IP addresses blocked from ${adminPort} for security`);
}

function addRedirectTraffic(childIP, port) {
	iptables.newRule({
		chain: customChains[2],
		protocol: "tcp",
		source: childIP,
		dport: port,
		target: `REDIRECT --to-port ${process.env.USER_PORT}`,
	});
}

function removeRedirectTraffic(childIP, port) {
	iptables.deleteRule({
		chain: customChains[2],
		protocol: "tcp",
		source: childIP,
		dport: port,
		target: `REDIRECT --to-port ${process.env.USER_PORT}`,
	});
}

function blockFW(childIP) {
	iptables.reject({ chain: customChains[1], protocol: "tcp", source: childIP });
}

function allowFW(childIP) {
	iptables.allow({ chain: customChains[1], protocol: "tcp", source: childIP });
}

async function blockTraffic(cName) {
	try {
		const ip = await getIP(cName);
		addRedirectTraffic(ip, 80);
		fwConsole(`Port 80 redirected for ${ip} to ${process.env.USER_PORT}`);
		addRedirectTraffic(ip, 443);
		fwConsole(`Port 443 redirected for ${ip} to ${process.env.USER_PORT}`);
		blockFW(ip);
		fwConsole(`${ip} traffic blocked`);
	} catch (error) {
		console.error(`An error has occured while blocking traffic: ${error}`);
	}
}

async function unblockTraffic(cName) {
	try {
		const ip = await getIP(cName);
		removeRedirectTraffic(ip, 80);
		fwConsole(`Port 80 redirection removed for ${ip}`);
		removeRedirectTraffic(ip, 443);
		fwConsole(`Port 443 redirection removed for ${ip}`);
		allowFW(ip);
		fwConsole(`${ip} traffic allowed`);
	} catch (error) {
		console.error(`An error has occured while unblocking traffic: ${error}`);
	}
}

async function initialGeneralRules() {
	try {
		fwConsole("Initial general rules configuration....");
		const inChain = customChains[0];
		const fwChain = customChains[1];
		flushCustomChains();
		fwConsole("Custom Chains Flushed");
		adminRules(process.env.ADMIN_IP, process.env.ADMIN_PORT);
		iptables.allow({ chain: inChain, protocol: "tcp", dport: process.env.USER_PORT });
		fwConsole(`Allow all to ${process.env.USER_PORT}`);
		iptables.reject({ chain: fwChain, protocol: "tcp" });
		fwConsole("Reject all Forward");
	} catch (error) {
		console.error(`An error occured with the general initial rules: ${error}`);
	}
}

async function initialChildRules() {
	try {
		fwConsole(`Initial Child Rules Configuration....`);
		const children = await getAllChildNames();
		for (const child of children) {
			const status = await getStatus(child);
			if (status === "UNBLOCKED") {
				fwConsole(`${cName} is Unblocked - Unblocked Traffic Rules`);
				await unblockTraffic(child);
			} else {
				fwConsole(`${cName} is Blocked - Blocked Traffic Rules`);
				await blockTraffic(child);
			}
		}
	} catch (error) {
		console.error(`An error has occurred with the initial child rules: ${error}`);
	}
}

async function startFirewall() {
	fwConsole("-- STARTING FIREWALL --");
	try {
		await initialGeneralRules();
		await initialChildRules();
		fwConsole(" ** FIREWALL STARTED **");
		refreshTimer();
	} catch (error) {
		console.error(`An error has occured starting the firewall: ${error}`);
	}
}

// BLOCK CHILD //
async function blockChild(cName) {
	const childIP = getIP(cName);
	try {
		await blockTraffic(cName);
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
		await unblockTraffic(cName);
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

async function refreshChild(cName) {
	try {
		fwConsole(`Refresh child started for ${cName}`);
		await refreshPoints(cName);
		await notifyAlert(`Points Refreshed for ${cName}`);
		await blockChild(cName);
		fwConsole(`Refresh child complete for ${cName}`);
	} catch (error) {
		console.error(`An error occured with refreshChild: ${error}`);
	}
}

// REFRESH FUNCTIONS //
// CHECKS FOR REFRESH AND RUNS REFRESH ON CONDITION //
async function refreshLogic(cName) {
	try {
		const status = await getStatus(cName);
		const intervalExc = await checkBlockInterval(cName);
		// IF UNBLOCKED && INTERVAL NOT EXCEEDED //
		if (status === "unblocked" && !intervalExc) {
			return;
		}
		// IF BLOCKED //
		else if (status === "blocked") {
			return;
		}
		// IF UNBLOCK && INTERVAL EXCEEDED //
		else if (status === "unblocked" && intervalExc) {
			await refreshChild(cName);
		}
	} catch (error) {
		console.error(`An error occured while running refreshLogic: ${error}`);
	}
}

// ITERATES THROUGH ALL CHILDREN AND PERFROMS REFRESHCHECK() ON ALL CHILDREN //
async function refreshHelper() {
	const children = await getAllChildNames();
	const refreshes = children.map((child) => refreshLogic(child));
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
module.exports = { startFirewall, unblockChild, blockChild };
