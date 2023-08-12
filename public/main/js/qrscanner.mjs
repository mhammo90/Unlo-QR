import QrScanner from "./qr-scanner/qr-scanner.min.js";

const qrVideo = document.getElementById("qr-video");
const qrBtn = document.getElementById("qr-btn");
const clsBtn = document.getElementById("cls-btn");

function supported() {
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		return false;
	} else {
		return true;
	}
}

async function postRequest(data) {
	try {
		const response = await fetch("/complete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			alert("Network Response NOT OK");
		}

		const respData = await response.json();
		alert(respData.message);
	} catch (error) {
		alert(error);
	}
}

async function completeTask(taskQRString) {
	try {
		const { taskName, taskPoints } = await JSON.parse(taskQRString);
		const data = {
			taskName,
			taskPoints,
		};
		const check = confirm(`Complete ${taskName} for ${taskPoints} points?`);
		if (check) {
			const post = await postRequest(data);
			const lastTask = JSON.stringify(data);
			window.localStorage.setItem("lastTask", lastTask);
		}
	} catch (error) {
		console.errror(error);
	}
}

const qrScanner = new QrScanner(
	qrVideo,
	(result) => {
		qrScanner.stop();
		completeTask(result.data);
	},
	{ preferredCamera: "environment" }
);

async function scanQRCode() {
	try {
		await qrScanner.start();
	} catch (error) {
		console.error("Error accessing the camera");
		console.error(error);
	}
}

async function qrscan() {
	if (supported && !qrScanner._active) {
		try {
			scanQRCode();
		} catch (error) {
			console.error("QR ERROR");
		}
	}
}

function qrstop() {
	if (qrScanner._active) {
		qrScanner.stop();
	}
}

qrBtn.addEventListener("click", qrscan);
clsBtn.addEventListener("click", qrstop);
