import * as fs from 'fs';
import { RequestResponse } from 'request';
const request = require('request');
const EventEmitter = require('events');

interface Client {
	clienttype: string;
}

interface Diff {
	[key: string]: any
}

class FileHandler extends EventEmitter {
	constructor() {
		super();
		this.shouldUpdate.bind(this);
	}

	updateTimer = setInterval(this.update.bind(this), 120000);

	async shouldUpdate() {
		if (!fs.existsSync('vatsimData.json')) await this.initialUpdate();

		const file = fs.readFileSync('vatsimData.json');
		const parsed = JSON.parse(file.toString());
		const oldDT = Date.parse(parsed.updated_date);

		const dateDifference = Date.now() - oldDT;
		const minutes = Math.floor(dateDifference / 60000);

		if (minutes >= 2) await this.update();

		return false;
	}

	async update(): Promise<any> {
		fs.copyFile('vatsimData.json', 'oldData.json', (err) => {
			if (err) console.log(err);
		});
		let body = await this.downloadFile();
		const parsedJSON = JSON.parse(body);

		parsedJSON.updated_date = new Date();
		const json = JSON.stringify(parsedJSON);
		fs.writeFileSync('vatsimData.json', json);
		const oldFile = fs.readFileSync('oldData.json');
		const newFile = fs.readFileSync('vatsimData.json');
		const oldParsed = JSON.parse(oldFile.toString());
		const newParsed = JSON.parse(newFile.toString());
		const diff: Diff = compareJson.map(oldParsed.clients, newParsed.clients);
		const result: {
			[key: string]: any
			created?: Array<Client>
		} = {};
		for (const {type, data} of Object.values(diff)) {
			if (result[type]) {
				result[type].push(data);
			 } else {
				result[type] = [data];
			 }
		}
		if (result.created) {
			var newPilots = [];
			var newControllers = [];
			for (let i = 0; i < result.created.length; i++) {
				const client = result.created[i];
				if (client.clienttype == 'PILOT') {
					newPilots.push(client);
				} else if(client.clienttype == 'ATC') {
					newControllers.push(client);
				}
			}
			if (newControllers.length > 0){
				(process.emit as Function)('newController', newControllers);
			}
			if (newPilots.length > 0) {
				(process.emit as Function)('newPilot', newPilots);
			}
		}
	}

	async initialUpdate() {
		let body = await this.downloadFile();
		const parsedJSON = JSON.parse(body);

		parsedJSON.updated_date = new Date();
		const json = JSON.stringify(parsedJSON);
		fs.writeFileSync('vatsimData.json', json);
	}

	downloadFile(): Promise<any> {
		return new Promise((resolve, reject) => {
			request('http://cluster.data.vatsim.net/vatsim-data.json', (error: RequestResponse, response: RequestResponse, body: RequestResponse) => {
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
	  };
}();

export default FileHandler;