import FileHandler from "./fileHandler";
const fileHandler = new FileHandler();

interface File {
  general: {
    version: number;
    reload: number;
    update: string;
    update_timestamp: string;
    connected_clients: number;
    unique_users: number;
  };
  pilots: Array<Pilot>;
  controllers: Array<Controller>;
  atis: Array<ATIS>;
  servers: Array<Servers>;
  prefiles: Array<Prefiles>;
  facilities: Array<Facilities>;
  ratings: Array<Ratings>;
  pilot_ratings: Array<PilotRatings>;
}

interface Pilot {
  cid: number;
  name: string;
  callsign: string;
  server: string;
  pilot_rating: number;
  latitude: number;
  longitude: number;
  altitude: number;
  groundspeed: number;
  transponder: string;
  heading: number;
  qnh_i_hg: number;
  qnh_mb: number;
  flight_plan?: {
    flight_rules: string;
    aircraft: string;
    aircraft_faa: string;
    aircraft_short: string;
    departure: string;
    arrival: string;
    alternate: string;
    cruise_tas: string;
    altitude: string;
    deptime: string;
    enroute_time: string;
    fuel_time: string;
    remarks: string;
    route: string;
  };
  logon_time: string;
  last_updated: string;
}

interface Controller {
  cid: number;
  name: string;
  callsign: string;
  frequency: string;
  facility: number;
  rating: number;
  server: string;
  visual_range: number;
  text_atis?: Array<string>;
  last_updated: string;
  logon_time: string;
}

interface ATIS {
  cid: number;
  name: string;
  callsign: string;
  frequency: string;
  facility: number;
  rating: number;
  server: string;
  visual_range: number;
  atis_code: string;
  text_atis?: Array<string>;
  last_updated: string;
  logon_time: string;
}

interface Servers {
  ident: string;
  hostname_or_ip: string;
  location: string;
  name: string;
  clients_connection_allowed: number;
}

interface Prefiles {
  cid: number;
  name: string;
  callsign: string;
  flight_plan: {
    flight_rules: string;
    aircraft: string;
    aircraft_faa: string;
    aircraft_short: string;
    departure: string;
    arrival: string;
    alternate: string;
    cruise_tas: string;
    altitude: string;
    deptime: string;
    enroute_time: string;
    fuel_time: string;
    remarks: string;
    route: string;
  };
  last_updated: string;
}

interface Facilities {
  id: number;
  short: string;
  long: string;
}

interface Ratings {
  id: number;
  short: string;
  long: string;
}

interface PilotRatings {
  id: number;
  short_name: string;
  long_name: string;
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
   * @returns {Number | undefined} The number of clients based on the type.
   */

  async getCount(type: string): Promise<number | undefined> {
    const parsed: File = await this.fileHandler.loadFile();
    switch (type) {
      case "all":
        return parsed.general.unique_users;
      case "pilots":
        return parsed.pilots.length;
      case "controllers":
        return parsed.controllers.length;
      default:
        return undefined;
    }
  }

  /**
   * Get information for clients relating to a given airport ICAO.
   *
   * @param {string} airport Airport ICAO code to get information for.
   *
   * @returns {Array | undefined} An array containing all clients relating to a given airport ICAO.
   */
  async getAirportInfo(airport: string): Promise<Object | undefined> {
    if (!airport) {
      return undefined;
    } else {
      let airportInfo: {
        pilots?: Array<Pilot>;
        controllers?: Array<Controller>;
        atis?: ATIS;
      } = {};

      const parsed: File = await this.fileHandler.loadFile();
      let airportInfoControllers = [];

      let airportInfoPilots = parsed.pilots.filter(
        (pilot) =>
          pilot.flight_plan?.departure === airport ||
          pilot.flight_plan?.arrival === airport
      );

      airportInfo["pilots"] = airportInfoPilots;

      for (let i = 0; i < parsed.controllers.length; i++) {
        const client = parsed.controllers[i];
        if (
          client.callsign.includes(airport) &&
          client.frequency !== "199.998"
        ) {
          airportInfoControllers.push(client);
        } else if (
          client.callsign.includes(airport.substr(1) + "_") &&
          client.frequency !== "199.998" &&
          airport.startsWith("K")
        ) {
          airportInfoControllers.push(client);
        }
      }

      airportInfo["controllers"] = airportInfoControllers;

      for (let i = 0; i < parsed.atis.length; i++) {
        const atis = parsed.atis[i];
        if (atis.callsign.includes(airport)) {
          console.log(atis);
          airportInfo["atis"] = atis;
        }
      }

      return airportInfo;
    }
  }

  /**
   * Get the most popular airports based on client count
   *
   * @returns {Array} An array containing the top 10 most popular airports.
   */

  async getPopularAirports(): Promise<Array<Object>> {
    const parsed: File = await this.fileHandler.loadFile();
    let airportList = [];
    let newAirport: boolean;

    for (let i = 0; i < parsed.pilots.length; i++) {
      const pilot = parsed.pilots[i];
      if (pilot.flight_plan && pilot.flight_plan.departure !== null) {
        newAirport = true;
        airportList.forEach((airport) => {
          if (airport.id === pilot.flight_plan?.departure) {
            airport.count++;
            newAirport = false;
          }
        });
        if (newAirport) {
          airportList.push({
            id: pilot.flight_plan?.departure,
            count: 1,
          });
        }
      }
      if (pilot.flight_plan && pilot.flight_plan.arrival !== null) {
        newAirport = true;
        airportList.forEach((airport) => {
          if (airport.id === pilot.flight_plan?.arrival) {
            airport.count++;
            newAirport = false;
          }
        });
        if (newAirport) {
          airportList.push({
            id: pilot.flight_plan?.arrival,
            count: 1,
          });
        }
      }
    }

    airportList.sort((a, b) => b.count - a.count);

    return airportList.slice(0, 10);
  }

  /**
   * Get the flight information for given callsign.
   *
   * @param {String} callsign The callsign to get the flight information for.
   *
   * @returns {Object} An object containing flight information.
   */

  async getFlightInfo(callsign: string): Promise<Pilot> {
    const parsed: File = await this.fileHandler.loadFile();

    let pilot = parsed.pilots.filter((obj: Pilot) => obj.callsign === callsign);

    return pilot[0];
  }

  /**
   * Get all connected pilots.
   *
   * @returns {Array} An array containing all connected pilots.
   */

  async getClients(): Promise<Array<Pilot>> {
    const parsed: File = await this.fileHandler.loadFile();
    return parsed.pilots;
  }

  /**
   * Get the flight information for a connected pilot.
   *
   * @param {Number} cid The VATSIM CID of the connected pilot.
   *
   * @returns {Object} An object containing flight information.
   */

  async getClientDetails(cid: number): Promise<Pilot> {
    const parsed: File = await this.fileHandler.loadFile();

    let pilot = parsed.pilots.filter((obj: Pilot) => obj.cid == cid);

    return pilot[0];
  }

  /**
   * Get all the connected supervisors.
   *
   * @returns {Array} An array containing all connected supervisors.
   */

  async getSupervisors(): Promise<Array<Controller>> {
    const parsed: File = await this.fileHandler.loadFile();
    let supervisorList: Array<Controller> = [];

    parsed.controllers.map((controller: Controller) => {
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

  async getControllers(): Promise<Array<Controller>> {
    const parsed: File = await this.fileHandler.loadFile();
    let controllerList: Array<Controller> = [];

    parsed.controllers.map((controller: Controller) => {
      if (controller.facility !== 0) {
        controllerList.push(controller);
      }
    });

    return controllerList;
  }
}

const handler = new DataHandler();
export { handler };
