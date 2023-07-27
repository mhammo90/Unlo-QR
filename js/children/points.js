// REQUIRES AND IMPORTS //
const fs = require("fs");
const { childDataLoc, updateChild, importChild } = require(relPath("./js/admin/childAdmin"));

// GET CURRENT POINTS//
function getPoints(cName) {
	var curr = importChild(cName).currentPoints;
	return curr;
}
// GET MAX POINTS //
function getMax(cName) {
	var max = importChild(cName).maxPoints;
	return max;
}
// SET CURRENT POINTS //
function setPoints(cName, points) {
	updateChild(cName, "currentPoints", points);
}

// SET POINTS TO 0, SET STATUS TO BLOCKED //
function refresh(cName) {
	setPoints(cName, 0);
	setStatus(cName, 1);
}

// ADD POINTS //
function addPoints(cName, points) {
	var curr = getPoints(cName);
	var newP = curr + points;
	setPoints(cName, newP);
}

// POINTS CHECK - IF CURRENT > MAX = TRUE
function pointsCheck(cName) {
	var current = getPoints(cName);
	var max = getMax(cName);
	if (current >= max) {
		return true;
	} else {
		return false;
	}
}

module.exports = { addPoints, pointsCheck, getPoints, getMax, setPoints, refresh };
