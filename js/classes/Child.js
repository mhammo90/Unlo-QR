class Child {
	constructor(name, ip, refresh, max, status = "blocked", currentPoints = 0, blockTime = "", unblockTime = "") {
		this.name = name;
		this.ip = ip;
		this.refreshInterval = refresh;
		this.maxPoints = max;
		this.status = status;
		this.currentPoints = currentPoints;
		this.blockTime = blockTime;
		this.unblockTime = unblockTime;
	}
	update(key, value) {
		this[key] = value;
	}
}

module.exports = Child;
