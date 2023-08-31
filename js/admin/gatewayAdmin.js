const { emit } = require("process");

// REQUIRES AND IMPORTS //
const { getIP, setStatus, setTimes, getStatus, checkBlockInterval, getAllChildNames, refreshPoints } = require(relPath(
	"./js/children/helper"
));
function fwConsole(message) {
	console.log(`\x1b[1;36mFIREWALL:\x1b[0m ${message}`);
}

const promisify = require("util").promisify;
const exec = promisify(require("child_process").exec);

async function iptablesExec(command) {
	try {
		const commandStr = "iptables-legacy " + command;
		await exec(commandStr, { stdio: ["ignore", "ignore", "ignore"] });
	} catch (error) {
		fwConsole(`FirewallExec Error: ${error}`);
	}
}

async function ruleCheck(chain, rule) {
	try {
		await exec(`iptables-legacy -C ${chain} ${rule}`, {
			stdio: ["ignore", "ignore", "ignore"],
		});
		return true;
	} catch (error) {
		fwConsole(`${rule} failed ruleCheck`);
	}
}

async function chainCheck(chain, nat) {
	try {
		if (nat === true) {
			var str = `-t nat -L ${chain}`;
		} else {
			var str = `-L ${chain}`;
		}
		await exec(`iptables-legacy ${str}`, { stdio: ["ignore", "ignore", "ignore"] });
		return true;
	} catch (error) {
		fwConsole(`${chain} failed chainCheck`);
	}
}

async function newFWChain(chain) {
	try {
		const check = await chainCheck(chain);
		if (!check) {
			const str = `-N ${chain}`;
			iptablesExec(str);
			fwConsole(`CUSTOM ${chain} CREATED`);
		}
	} catch (error) {
		console.error(`newFWChain Error: ${error}`);
	}
}

async function newFWNATChain(chain) {
	try {
		const check = await chainCheck(chain, true);
		if (!check) {
			const str = `-t nat -N ${chain}`;
			iptablesExec(str);
			fwConsole(`CUSTOM NAT ${chain} CREATED`);
		}
	} catch (error) {
		console.error(`newFWNATChain Error: ${error}`);
	}
}

async function newTopJumpRule(chain, target) {
	try {
		const check = await ruleCheck(chain, `-j ${target}`);
		if (!check) {
			const str = `-I ${chain} 1 -j ${target}`;
			iptablesExec(str);
			fwConsole(`CUSTOM ${chain} --> ${target} JUMP RULE CREATED`);
		}
	} catch (error) {
		console.error(`newTopJumpRule Error: ${error}`);
	}
}

async function newTopNATJumpRule(chain, target) {
	try {
		const check = await ruleCheck(chain, `-t nat -j ${target}`);
		if (!check) {
			const str = `-t nat -I ${chain} 1 -j ${target}`;
			iptablesExec(str);
			fwConsole(`CUSTOM NAT ${chain} --> ${target} JUMP RULE CREATED`);
		}
	} catch (error) {
		console.error(`newTopNATJumpRule Error: ${error}`);
	}
}

const customChains = ["UNLOCKER_IN", "UNLOCKER_FW", "UNLOCKER_PRE"];

async function newRule(chain, rule, action) {
	try {
		const str = `-A ${chain} ${rule} -j ${action}`;
		const check = await ruleCheck(chain, str);
		if (!check) {
			await iptablesExec(`${str}`);
			fwConsole(`${action} ${rule} created in ${chain}`);
		}
	} catch (error) {
		console.error(`An error occured while creating ${action} ${rule}:${error}`);
	}
}

async function firewallSetup() {
	fwConsole("NEW FIREWALL SETUP INITIATED");
	try {
		await newFWChain(customChains[0]);
		await newTopJumpRule("INPUT", customChains[0]);
		await newFWChain(customChains[1]);
		await newTopJumpRule("FORWARD", customChains[1]);
		await newFWNATChain(customChains[2]);
		await newTopNATJumpRule("PREROUTING", customChains[2]);
		fwConsole("MEW FIREWALL SETUP COMPLETE");
	} catch (error) {
		console.error(`An error occurred setting up the firewall`);
	}
}

async function flushCustomChains() {
	try {
		async function flush(chain) {
			try {
				const str = `-F ${chain}`;
				await iptablesExec(str);
			} catch (error) {
				console.error(`An error occured while flushing ${chain}: ${error}`);
			}
		}
		async function flushNAT(chain) {
			try {
				const str = `-t nat -F ${chain}`;
				await iptablesExec(str);
			} catch (error) {
				console.error(`An error occured while flushing nat ${chain}: ${error}`);
			}
		}

		flush(customChains[0]).then(fwConsole(`${customChains[0]} FLUSHED`));
		flush(customChains[1]).then(fwConsole(`${customChains[1]} FLUSHED`));
		flushNAT(customChains[2]).then(fwConsole(`${customChains[2]} FLUSHED`));
	} catch (error) {
		console.error(`An error occured flushing the custom chains: ${error}`);
	}
}

async function adminRules(adminIP, adminPort) {
	try {
		const inChain = customChains[0];
		const allowStr = `-A ${inChain} -p tcp --dport ${adminPort} -s ${adminIP} -j ACCEPT`;
		const dropStr = `-A ${inChain} -p tcp --dport ${adminPort} -j DROP`;
		await iptablesExec(allowStr);
		fwConsole(`${adminIP} allowed to ${adminPort} for Admin Access`);
		await iptablesExec(dropStr);
		fwConsole(`All other IP addresses blocked from ${adminPort} for security`);
	} catch (error) {
		console.error(`An error occured with Admin Rules: ${error}`);
	}
}

async function redirectTraffic(childIP, port, method) {
	try {
		const natChain = customChains[2];
		const astr = `-t nat -A ${natChain} -p tcp -s ${childIP} --dport ${port} -j REDIRECT --to-port ${process.env.USER_PORT}`;
		const dstr = `-t nat -D ${natChain} -p tcp -s ${childIP} --dport ${port} -j REDIRECT --to-port ${process.env.USER_PORT}`;

		if (method === "add") {
			const check = await ruleCheck(natChain, astr);
			if (!check) {
				await iptablesExec(astr);
				fwConsole(`Redirect added for ${childIP}`);
			}
		} else if (method === "remove") {
			const check = await ruleCheck(natChain, astr);
			if (check) {
				await iptablesExec(dstr);
				fwConsole(`Redirect deleted for ${childIP}`);
			}
		} else {
			console.error("add OR remove");
		}
	} catch (error) {
		console.error(`An error occured with the redirectTraffic function: ${error}`);
	}
}

async function toggleForward(childIP, status) {
	const fwChain = customChains[1];
	const accStr = `-I ${fwChain} 1 -p tcp -s ${childIP} -j ACCEPT`;
	const delStr = `-D ${fwChain} -p tcp -s ${childIP} -j ACCEPT`;
	try {
		if (status === "allow") {
			const check = await ruleCheck(fwChain, accStr);
			if (!check) {
				await iptablesExec(accStr);
				fwConsole(`Forwaring allowed for ${childIP}`);
			}
		} else if (status === "block") {
			const check = await ruleCheck(fwChain, accStr);
			if (check) {
				await iptablesExec(delStr);
				fwConsole(`Forwarding blocked for ${childIP}`);
			}
		} else {
			console.error("allow OR block");
		}
	} catch (error) {
		console.error(`An error occured whilst toggling forward rule: ${error}`);
	}
}

async function blockTraffic(cName) {
	try {
		const ip = await getIP(cName);
		await redirectTraffic(ip, 80, "add");
		fwConsole(`Port 80 redirected for ${ip} to ${process.env.USER_PORT}`);
		await redirectTraffic(ip, 443, "add");
		fwConsole(`Port 443 redirected for ${ip} to ${process.env.USER_PORT}`);
		await toggleForward(ip, "block");
		fwConsole(`${ip} traffic blocked`);
	} catch (error) {
		console.error(`An error has occured while blocking traffic: ${error}`);
	}
}

async function unblockTraffic(cName) {
	try {
		const ip = await getIP(cName);
		await redirectTraffic(ip, 80, "remove");
		fwConsole(`Port 80 redirection removed for ${ip}`);
		await redirectTraffic(ip, 443, "remove");
		fwConsole(`Port 443 redirection removed for ${ip}`);
		await toggleForward(ip, "allow");
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
		await flushCustomChains();
		fwConsole("Custom Chains Flushed");
		await adminRules(process.env.ADMIN_IP, process.env.ADMIN_PORT);
		const allowAll = `-p tcp --dport ${process.env.USER_PORT}`;
		const rejectForward = `-p tcp`;
		await newRule(inChain, allowAll, "ACCEPT");
		fwConsole(`Allow all to ${process.env.USER_PORT}`);
		await newRule(fwChain, rejectForward, "REJECT");
		fwConsole("Reject all Forward");
	} catch (error) {
		console.error(`An error occured with the general initial rules: ${error}`);
	}
}

async function childrenFirewallRules() {
	try {
		fwConsole(`Initial Child Rules Configuration....`);
		const children = await getAllChildNames();
		for (const child of children) {
			const status = await getStatus(child);
			if (status === "UNBLOCKED") {
				fwConsole(`${child} is Unblocked - Unblocked Traffic Rules`);
				await unblockTraffic(child);
			} else {
				fwConsole(`${child} is Blocked - Blocked Traffic Rules`);
				await blockTraffic(child);
			}
		}
	} catch (error) {
		console.error(`An error has occurred with children firewall rules: ${error}`);
	}
}

async function startFirewall() {
	fwConsole("-- STARTING FIREWALL --");
	try {
		await firewallSetup();
		await initialGeneralRules();
		await childrenFirewallRules();
		fwConsole(" ** FIREWALL STARTED **");
		refreshTimer();
	} catch (error) {
		console.error(`An error has occured starting the firewall: ${error}`);
	}
}

// BLOCK CHILD //
async function blockChild(cName) {
	try {
		const childIP = getIP(cName);
		await blockTraffic(childIP);
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
	try {
		const childIP = getIP(cName);
		await unblockTraffic(childIP);
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
		await childrenFirewallRules;
	} catch (error) {
		console.error(`RefreshHelper Error: ${error}`);
	}
}

// EXECUTES REFRESHHELPER EVERY 30 MINS //
function refreshTimer() {
	setInterval(refreshHelper, 1800000);
	console.log("\x1b[33mrefreshTimer:\x1b[0m \x1b[32mRefresh Interval \x1b[32;4mStarted\x1b[0m");
}

// MODULE EXPORTS //
module.exports = { startFirewall, unblockChild, blockChild, childrenFirewallRules };
