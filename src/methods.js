const Handler = require('./fileHandler');
const fileHandler = new Handler();

class DataHandler {
    constructor() {
		this.fileHandler = fileHandler;
    }

    /**
     * Get connected client count.
     * 
     * @param {String} type Type of client to return (all, pilots or controllers).
     * 
     * @returns {Number} The number of clients based on the type.
     */

    async getCount(type) {
		const parsed = await this.fileHandler.loadFile();
		switch (type){
			case 'all':
				return (parsed.clients.length);
			case 'pilots':
				let pilots = parsed.clients.filter(obj => obj.clienttype == 'PILOT');

				return pilots.length;
			case 'controllers':
				let controllers = parsed.clients.filter(obj => obj.clienttype == 'ATC');

				return controllers.length;
			default:
				return undefined;
		}
	}

    /**
     * Get information for clients relating to a given airport ICAO.
     * 
     * @param {String} airport Airport ICAO code to get information for.
     * 
     * @returns {Array} An array containing all clients relating to a given airport ICAO.
     */
	async getAirportInfo(airport) {
        if (!airport) {
            return undefined;
        } else {
            const parsed = await this.fileHandler.loadFile();
		let airportInfoPilots = [];
		let airportInfoControllers = [];

		for (let i = 0; i < parsed.clients.length; i++) {
			const client = parsed.clients[i];
			if(client.clienttype == 'PILOT'){
				if (client.planned_depairport === airport || client.planned_destairport === airport) {
					airportInfoPilots.push(client);
				}
			} else if(client.clienttype == 'ATC'){
				if (client.callsign.includes(airport) && client.frequency !== 99998) {
					airportInfoControllers.push(client);
				}
				else if (client.callsign.includes(airport.substr(1) + '_') && client.frequency !== 99998 ** airport.startsWith('K')) {
					airportInfoControllers.push(client);
				}
			}
		}

		let airportInfo = {};
		airportInfo['pilots'] = airportInfoPilots;
		airportInfo['controllers'] = airportInfoControllers;

		return airportInfo;
        }
	}

    /**
     * Get the most popular airports based on client count
     * 
     * @returns {Array} An array containing the top 10 most popular airports.
     */

	async getPopularAirports() {
		const parsed = await this.fileHandler.loadFile();
		let airportList = [];
		let newAirport;

		for (let i = 0; i < parsed.clients.length; i++) {
			const pilot = parsed.clients[i];
			if(pilot.clienttype == 'PILOT'){
				if (pilot.planned_depairport !== null) {
					newAirport = true;
					airportList.forEach(airport => {
						if (airport.id === pilot.planned_depairport) {
							airport.count++;
							newAirport = false;
						}
					});
					if (newAirport) {
						airportList.push({
							id: pilot.planned_depairport,
							count: 1
						});
					}
				}
				if (pilot.planned_destairport !== null) {
					newAirport = true;
					airportList.forEach(airport => {
						if (airport.id === pilot.planned_destairport) {
							airport.count++;
							newAirport = false;
						}
					});
					if (newAirport) {
						airportList.push({
							id: pilot.planned_destairport,
							count: 1
						});
					}
				}
			}
		}

		airportList.sort((a, b) => b.count - a.count);

		return(airportList.slice(0,10));
	}

    /**
     * Get the flight information for given callsign.
     * 
     * @param {String} callsign The callsign to get the flight information for.
     * 
     * @returns {Object} An object containing flight information.
     */

	async getFlightInfo(callsign) {
		const parsed = await this.fileHandler.loadFile();
		let pilotDetails = [];

		const pilots = parsed.clients.filter(obj => obj.clienttype == 'PILOT');

		for (let i = 0; i < pilots.length; i++) {
			const pilot = pilots[i];
			if (pilot.callsign == callsign) {
				pilotDetails.push(pilot);
			}
		}

		return pilotDetails[0];
    }
    
    /**
     * Get all connected pilots.
     * 
     * @returns {Array} An array containing all connected pilots.
     */

	async getClients() {
		const parsed = await this.fileHandler.loadFile();
		return parsed.clients.filter(obj => obj.clienttype == 'PILOT');
    }
    
    /**
     * Get the flight information for a connected pilot.
     * 
     * @param {Number} cid The VATSIM CID of the connected pilot.
     * 
     * @returns {Object} An object containing flight information.
     */

	async getClientDetails(cid) {
		const parsed = await this.fileHandler.loadFile();
		let pilotDetails = [];

		const pilots = parsed.clients.filter(obj => obj.clienttype == 'PILOT');

		pilots.forEach(pilot => {
			if (pilot.cid == cid){
				pilotDetails.push(pilot);
			}
		});
		return pilotDetails[0];
    }
    
    /**
     * Get all the connected supervisors.
     * 
     * @returns {Array} An array containing all connected supervisors.
     */

	async getSupervisors() {
		const parsed = await this.fileHandler.loadFile();
		let supervisorList = [];

		const controllers = parsed.clients.filter(obj => obj.clienttype == 'ATC');

		controllers.map(controller => {
			if (controller.rating === 11 || controller.rating === 12){
				supervisorList.push(controller);
			}
		});

		return supervisorList;
	}

    /**
     * Get all the connected controllers.
     * 
     * @returns {Array} An array containing all connected controllers.
     */

	async getControllers() {
		const parsed = await this.fileHandler.loadFile();
		let controllerList = [];

		const controllers = parsed.clients.filter(obj => obj.clienttype == 'ATC');

		controllers.map(controller => {
			if (controller.frequency != 99998){
				controllerList.push(controller);
			}
		});
		
		return controllerList;
	}
}

module.exports = DataHandler;