// REQUIRES AND IMPORT //
const qr = require("qrcode");

// CLASSES //
class Task {
	constructor(id = Math.floor(Math.random() * 90000000) + 10000000, taskName, taskPoints, qrCode = "") {
		this.id = id;
		this.taskName = taskName;
		this.taskPoints = taskPoints;
		this.qrCode = qrCode;
	}
	createQR() {
		return new Promise((resolve, reject) => {
			const data = `{"taskName":${this.taskName},"taskPoints":${this.taskPoints}}`;
			const options = {
				errorCorrectionLevel: "H",
			};
			qr.toDataURL(data, options)
				.then((qrOUT) => {
					this.qrCode = qrOUT;
					resolve();
				})
				.catch((err) => {
					console.error(err);
					reject(err);
				});
		});
	}
	showQR() {
		if (!this.qrCode) {
			console.error("QR code is not available.");
			return;
		}
		return this.qrCode;
	}
}

module.exports = Task;
