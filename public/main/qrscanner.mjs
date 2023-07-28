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

function completeTask(taskQRString) {
	try {
		const { taskName, taskPoints } = JSON.parse(taskQRString);
		const data = {
			taskPoints,
		};
		const check = confirm("Complete ", taskName, " for ", taskPoints, " ?");
		if (check) {
			fetch("/complete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})
				.then((response) => {
					if (!response.ok) {
						alert("Network Response NOT OK");
					}
					alert(response.json());
				})
				.then((data) => {
					alert("Task completed successfully!", data);
				})
				.catch((error) => {
					// Handle errors
					alert("Error completing task:", error);
				});
		} else {
			return;
		}
	} catch (error) {
		alert("Invalid JSON input:", error);
	}
}

const qrScanner = new QrScanner(
	qrVideo,
	(result) => {
		qrScanner.stop();
		completeTask(result);
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

function qrscan() {
	if (supported && !qrScanner._active) {
		scanQRCode();
	}
}

function qrstop() {
	if (qrScanner._active) {
		qrScanner.stop();
	}
}

qrBtn.addEventListener("click", qrscan);
clsBtn.addEventListener("click", qrstop);
