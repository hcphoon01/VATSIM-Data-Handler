import FileHandler from './fileHandler';
const fileHandler = new FileHandler();

interface Client {
	callsign: string;
	cid: string;
	realname: string;
	clienttype: string;
	frequency: string;
	latitude: number;
	longitude: number;
	altitude: number;
	groundspeed: number;
	planned_aircraft: string;
	planned_tascruise: string;
	planned_depairport: string;
	planned_altitude: string;
	planned_destairport: string;
	server: string;
	protrevision: number;
	rating: number;
	transponder: number;
	facilitytype: number;
	visualrange: number;
	planned_revision: string;
	planned_flighttype: string;
	planned_deptime: string;
	planned_actdeptime: string;
	planned_hrsenroute: string;
	planned_minenroute: string;
	planned_hrsfuel: string;
	planned_minfiel: string;
	planned_altairport: string;
	planned_remarks: string;
	planned_route: string;
	planned_depairport_lat: number;
	planned_depairport_lon: number;
	planned_destairport_lat: number;
	planned_destairport_lon: number;
	atis_message: string;
	time_last_atis_received: string;
	time_logon: string;
	heading: number;
	qnh_i_hg: number,
	qnh_mb: number;
}

export class DataHandler {

	private fileHandler: FileHandler;

	constructor() {
		this.fileHandler = fileHandler;
	}

	/**
	 * Get connected client count.
	 * 
	 * @param {string} type Type of client to return (all, pilots or controllers).
	 * 
	 * @returns {Number} The number of clients based on the type.
	 */

	async getCount(type: string): Promise<number | undefined> {
		const parsed = await this.fileHandler.loadFile();
		switch (type) {
			case 'all':
				return (parsed.clients.length);
			case 'pilots':
				let pilots = parsed.clients.filter((obj: Client) => obj.clienttype == 'PILOT');

				return pilots.length;
			case 'controllers':
				let controllers = parsed.clients.filter((obj: Client) => obj.clienttype == 'ATC');

				return controllers.length;
			default:
				return undefined;
		}
	}

	/**
	 * Get information for clients relating to a given airport ICAO.
	 * 
	 * @param {string} airport Airport ICAO code to get information for.
	 * 
	 * @returns {Array} An array containing all clients relating to a given airport ICAO.
	 */
	async getAirportInfo(airport: string): Promise<Object | undefined> {
		if (!airport) {
			return undefined;
		} else {
			const parsed = await this.fileHandler.loadFile();
			let airportInfoPilots = [];
			let airportInfoControllers = [];

			for (let i = 0; i < parsed.clients.length; i++) {
				const client = parsed.clients[i];
				if (client.clienttype == 'PILOT') {
					if (client.planned_depairport === airport || client.planned_destairport === airport) {
						airportInfoPilots.push(client);
					}
				} else if (client.clienttype == 'ATC') {
					if (client.callsign.includes(airport) && client.frequency !== 199.998) {
						airportInfoControllers.push(client);
					}
					else if (client.callsign.includes(airport.substr(1) + '_') && client.frequency !== 199.998 && airport.startsWith('K')) {
						airportInfoControllers.push(client);
					}
				}
			}

			let airportInfo: {
				pilots?: Array<Client>;
				controllers?: Array<Client>
			} = {};
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

	async getPopularAirports(): Promise<Array<Object>> {
		const parsed = await this.fileHandler.loadFile();
		let airportList = [];
		let newAirport: boolean;

		for (let i = 0; i < parsed.clients.length; i++) {
			const pilot = parsed.clients[i];
			if (pilot.clienttype == 'PILOT') {
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

		return (airportList.slice(0, 10));
	}

	/**
	 * Get the flight information for given callsign.
	 * 
	 * @param {String} callsign The callsign to get the flight information for.
	 * 
	 * @returns {Object} An object containing flight information.
	 */

	async getFlightInfo(callsign: string): Promise<Client> {
		const parsed = await this.fileHandler.loadFile();
		let pilotDetails = [];

		const pilots = parsed.clients.filter((obj: Client) => obj.clienttype == 'PILOT');

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

	async getClients(): Promise<Array<Client>> {
		const parsed = await this.fileHandler.loadFile();
		return parsed.clients.filter((obj: Client) => obj.clienttype == 'PILOT');
	}

	/**
	 * Get the flight information for a connected pilot.
	 * 
	 * @param {Number} cid The VATSIM CID of the connected pilot.
	 * 
	 * @returns {Object} An object containing flight information.
	 */

	async getClientDetails(cid: number): Promise<Client> {
		const parsed = await this.fileHandler.loadFile();
		let pilotDetails: Array<Client> = [];

		const pilots = parsed.clients.filter((obj: Client) => obj.clienttype == 'PILOT');

		pilots.forEach((pilot: Client) => {
			if (pilot.cid == cid.toString()) {
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

	async getSupervisors(): Promise<Array<Client>> {
		const parsed = await this.fileHandler.loadFile();
		let supervisorList: Array<Client> = [];

		const controllers = parsed.clients.filter((obj: Client) => obj.clienttype == 'ATC');

		controllers.map((controller: Client) => {
			if (controller.rating === 11 || controller.rating === 12) {
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

	async getControllers(): Promise<Array<Client>> {
		const parsed = await this.fileHandler.loadFile();
		let controllerList: Array<Client> = [];

		const controllers = parsed.clients.filter((obj: Client) => obj.clienttype == 'ATC');

		controllers.map((controller: Client) => {
			if (controller.frequency != '199.998') {
				controllerList.push(controller);
			}
		});

		return controllerList;
	}
}

const handler = new DataHandler();
export { handler };