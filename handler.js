const fs = require('fs');
const request = require('request');

class DataHandler {
	constructor() {
		this.shouldUpdate();
	}

	async shouldUpdate() {
		if (!fs.existsSync('vatsimData.json')) await this.update();

		const file = fs.readFileSync('vatsimData.json');
		const parsed = JSON.parse(file);
		const oldDT = Date.parse(parsed.updated_date);

		const dateDifference = Date.now() - oldDT;
		const minutes = Math.floor(dateDifference / 60000);

		if (minutes > 2) await this.update();

		return false;
	}

	async update() {	
		let body = await this.downloadFile();
		const parsedJSON = JSON.parse(body);

		parsedJSON.updated_date = new Date();
		const json = JSON.stringify(parsedJSON);
		fs.writeFileSync('vatsimData.json', json, function(err, result) {
			if(err) console.log(err);
		});
	}

	downloadFile() {
		return new Promise((resolve, reject) => {
			const urlList = [
				'http://us.data.vatsim.net/vatsim-data.json',
				'http://eu.data.vatsim.net/vatsim-data.json',
				'http://apac.data.vatsim.net/vatsim-data.json'
			];
			const url = urlList[Math.floor(Math.random()*urlList.length)];
			request(url, (error, response, body) => {
				if (error) reject(error);

				if (response.statusCode !== 200) {
					reject('Invalid status code <' + response.statusCode + '>');
				}

				resolve(body);
			});
		});
	}

	async loadFile(){
		await this.shouldUpdate();
		return(JSON.parse(fs.readFileSync('vatsimData.json', {encoding:'utf-8'})));
	}

	async getCount(type) {
		const parsed = await this.loadFile();
		switch (type){
			case 'all':
				return (parsed.pilots.length + parsed.controllers.length);
			case 'pilots':
				return (parsed.pilots.length);
			case 'controllers':
				return (parsed.controllers.length);
			default:
				return undefined;
		}
	}

	async getAirportInfo(airport = null) {
		const parsed = await this.loadFile();
		let airportInfo = [];

		parsed.pilots.forEach(pilot => {
			if (pilot.plan.departure === airport || pilot.plan.arrival === airport) {
				airportInfo.push(pilot);
			}
		});

		parsed.controllers.forEach(controller => {
			if (controller.callsign.includes(airport) && controller.frequency !== 99998) {
				airportInfo.push(controller);
			}
		});
		return airportInfo;
	}

	async getPopularAirports() {
		const parsed = await this.loadFile();
		let airportList = [];
		let newAirport;

		parsed.pilots.forEach(pilot => {
			if (pilot.plan.departure !== '') {
				newAirport = true;
				airportList.forEach(airport => {
					if (airport.id === pilot.plan.departure) {
						airport.count++;
						newAirport = false;
					}
				});
				if (newAirport) {
					airportList.push({
						id: pilot.plan.departure,
						count: 1
					});
				}
			}
			if (pilot.plan.arrival !== '') {
				newAirport = true;
				airportList.forEach(airport => {
					if (airport.id === pilot.plan.arrival) {
						airport.count++;
						newAirport = false;
					}
				});
				if (newAirport) {
					airportList.push({
						id: pilot.plan.arrival,
						count: 1
					});
				}
			}
		});

		airportList.sort((a, b) => b.count - a.count);

		return(airportList.slice(0,10));
	}

	async getClientDetails(cid) {
		const parsed = await this.loadFile();
		let pilotDetails = [];

		parsed.pilots.forEach(pilot => {
			if (pilot.member.cid === cid){
				pilotDetails.push(pilot);
			}
		});
		return pilotDetails[0];
	}

	async getSupervisors() {
		const parsed = await this.loadFile();
		let supervisorList = [];

		parsed.controllers.map(controller => {
			if (controller.rating === 11 || controller.rating === 12){
				supervisorList.push(controller);
			}
		});

		return supervisorList;
	}
}

module.exports = DataHandler;