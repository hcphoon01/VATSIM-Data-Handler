const fs = require('fs');
const request = require('request');
const EventEmitter = require('events');

class DataHandler extends EventEmitter {
	constructor() {
		super();
		this.shouldUpdate.bind(this);
	}

	updateTimer = setInterval(this.update.bind(this), 120000);

	async shouldUpdate() {
		if (!fs.existsSync('vatsimData.json')) await this.initialUpdate();

		const file = fs.readFileSync('vatsimData.json');
		const parsed = JSON.parse(file);
		const oldDT = Date.parse(parsed.updated_date);

		const dateDifference = Date.now() - oldDT;
		const minutes = Math.floor(dateDifference / 60000);

		if (minutes >= 2) await this.update();

		return false;
	}

	async update() {
		fs.copyFile('vatsimData.json', 'oldData.json', (err) => {
			if (err) console.log(err);
		});
		let body = await this.downloadFile();
		const parsedJSON = JSON.parse(body);

		parsedJSON.updated_date = new Date();
		const json = JSON.stringify(parsedJSON);
		fs.writeFileSync('vatsimData.json', json, function(err, result) {
			if(err) console.log(err);
		});
		const oldFile = fs.readFileSync('oldData.json');
		const newFile = fs.readFileSync('vatsimData.json');
		const oldParsed = JSON.parse(oldFile);
		const newParsed = JSON.parse(newFile)
		const diff = compareJson.map(oldParsed, newParsed);
		const result = {}
		for (const {type, data} of Object.values(diff.controllers)) {
			if (result[type]) {
				result[type].push(data)
			 } else {
				result[type] = [data]
			 }
		}
		if (result.created) {
			this.emit('newController', result.created)
		}
	}

	async initialUpdate() {
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
		let airportInfoPilots = [];
		let airportInfoControllers = [];

		parsed.pilots.forEach(pilot => {
			if (pilot.plan.departure === airport || pilot.plan.arrival === airport) {
				airportInfoPilots.push(pilot);
			}
		});

		parsed.controllers.forEach(controller => {
			if (controller.callsign.includes(airport) && controller.frequency !== 99998) {
				airportInfoControllers.push(controller);
			}
			else if (controller.callsign.includes(airport.substr(1) + '_') && controller.frequency !== 99998 ** airport.startsWith('K')) {
				airportInfoControllers.push(controller);
			}
		});
		let airportInfo = {};
		airportInfo['pilots'] = airportInfoPilots;
		airportInfo['controllers'] = airportInfoControllers;

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

	async getFlightInfo(callsign) {
		const parsed = await this.loadFile();
		let pilotDetails = [];

		parsed.pilots.forEach(pilot => {
			if (pilot.callsign == callsign) {
				pilotDetails.push(pilot);
			}
		})
		return pilotDetails[0];
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

var compareJson = function() {
	return {
		VALUE_CREATED: 'created',
		VALUE_UPDATED: 'updated',
		VALUE_DELETED: 'deleted',
		VALUE_UNCHANGED: 'unchanged',
		map: function(obj1, obj2) {
		  if (this.isFunction(obj1) || this.isFunction(obj2)) {
			console.log('Invalid argument. Function given, object expected.');
		  }
		  if (this.isValue(obj1) || this.isValue(obj2)) {
			return {
			  type: this.compareValues(obj1, obj2),
			  data: obj1 === undefined ? obj2 : obj1
			};
		  }
	
		  var diff = {};
		  for (var key in obj1) {
			if (this.isFunction(obj1[key])) {
			  continue;
			}
	
			var value2 = undefined;
			if (obj2[key] !== undefined) {
			  value2 = obj2[key];
			}
	
			diff[key] = this.map(obj1[key], value2);
		  }
		  for (var key in obj2) {
			if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
			  continue;
			}
	
			diff[key] = this.map(undefined, obj2[key]);
		  }
	
		  return diff;
	
		},
		compareValues: function (value1, value2) {
		  if (value1 === value2) {
			return this.VALUE_UNCHANGED;
		  }
		  if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
			return this.VALUE_UNCHANGED;
		  }
		  if (value1 === undefined) {
			return this.VALUE_CREATED;
		  }
		  if (value2 === undefined) {
			return this.VALUE_DELETED;
		  }
		  return this.VALUE_UPDATED;
		},
		isFunction: function (x) {
		  return Object.prototype.toString.call(x) === '[object Function]';
		},
		isArray: function (x) {
		  return Object.prototype.toString.call(x) === '[object Array]';
		},
		isDate: function (x) {
		  return Object.prototype.toString.call(x) === '[object Date]';
		},
		isObject: function (x) {
		  return Object.prototype.toString.call(x) === '[object Object]';
		},
		isValue: function (x) {
		  return !this.isObject(x) && !this.isArray(x);
		}
	  }
}();

module.exports = DataHandler;