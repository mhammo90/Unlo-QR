// IMPORTS AND DOM ELEMENTS //
import QrScanner from "./qr-scanner/qr-scanner.min.js";
const qrVideo = document.getElementById("qr-video");
const qrBtn = document.getElementById("qr-btn");
const clsBtn = document.getElementById("cls-btn");

// CHECK IF CAMERA IS SUPPORTED [QR CODE FUNCTION] //
function supported() {
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		return false;
	} else {
		return true;
	}
}

// SENDS DATA FROM QR TO SERVER AND REDIRECTS TO INCLUDE MESSAGE //
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
		console.log(`Server Responsed: ${respData}`);
		window.location.replace(`/?message=${encodeURIComponent(respData.message)}`);
	} catch (error) {
		console.error(error);
	}
}

// RETRIEVES JSON DATA FROM QR CODE, CONFIRMS, INITIATES REQUEST AND SAVES LAST TASK TO LOCALSTORAGE //
async function completeTask(taskQRString) {
	try {
		const { taskName, taskPoints } = await JSON.parse(taskQRString);
		const data = {
			taskName,
			taskPoints,
		};
		console.log(data);
		const check = confirm(`Complete ${taskName} for ${taskPoints} points?`);
		if (check) {
			await postRequest(data);
			const lastTask = JSON.stringify(data);
			window.localStorage.setItem("lastTask", lastTask);
		}
	} catch (error) {
		console.error(error);
	}
}

// -- QR READER CODE --  //
// QR SCANNER OBJECT INITIALISATION //
const qrScanner = new QrScanner(
	qrVideo,
	(result) => {
		// ON RESULT //
		clsBtn.click();
		completeTask(result.data);
	},
	// REAR FACING CAMERA ON TABLETS //
	{ preferredCamera: "environment" }
);

// INITIATE SCANNER FUNCTION //
async function scanQRCode() {
	try {
		await qrScanner.start();
	} catch (error) {
		console.error("Error accessing the camera");
		console.error(error);
	}
}

// IF SUPPORTED DEVICE AND QRSCANNER NOT ACTIVE, INITIATE SCANNER //
async function qrscan() {
	if (supported && !qrScanner._active) {
		try {
			scanQRCode();
		} catch (error) {
			console.error("QR ERROR");
		}
	}
}

// IF QRSCANNER IS ACTIVE, STOP QRSCANNER //
function qrstop() {
	if (qrScanner._active) {
		qrScanner.stop();
	}
}

// EVENT LISTENERS FOR BUTTONS TO START AND STOP QR CANVAS OBJECT //
qrBtn.addEventListener("click", qrscan);
clsBtn.addEventListener("click", qrstop);
