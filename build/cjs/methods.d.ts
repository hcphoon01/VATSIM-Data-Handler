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
export declare class DataHandler {
    private fileHandler;
    constructor();
    /**
     * Get connected client count.
     *
     * @param {string} type Type of client to return (all, pilots or controllers).
     *
     * @returns {Number | undefined} The number of clients based on the type.
     */
    getCount(type: string): Promise<number | undefined>;
    /**
     * Get information for clients relating to a given airport ICAO.
     *
     * @param {string} airport Airport ICAO code to get information for.
     *
     * @returns {Array | undefined} An array containing all clients relating to a given airport ICAO.
     */
    getAirportInfo(airport: string): Promise<Object | undefined>;
    /**
     * Get the most popular airports based on client count
     *
     * @returns {Array} An array containing the top 10 most popular airports.
     */
    getPopularAirports(): Promise<Array<Object>>;
    /**
     * Get the flight information for given callsign.
     *
     * @param {String} callsign The callsign to get the flight information for.
     *
     * @returns {Object} An object containing flight information.
     */
    getFlightInfo(callsign: string): Promise<Pilot>;
    /**
     * Get all connected pilots.
     *
     * @returns {Array} An array containing all connected pilots.
     */
    getClients(): Promise<Array<Pilot>>;
    /**
     * Get the flight information for a connected pilot.
     *
     * @param {Number} cid The VATSIM CID of the connected pilot.
     *
     * @returns {Object} An object containing flight information.
     */
    getClientDetails(cid: number): Promise<Pilot>;
    /**
     * Get all the connected supervisors.
     *
     * @returns {Array} An array containing all connected supervisors.
     */
    getSupervisors(): Promise<Array<Controller>>;
    /**
     * Get all the connected controllers.
     *
     * @returns {Array} An array containing all connected controllers.
     */
    getControllers(): Promise<Array<Controller>>;
}
declare const handler: DataHandler;
export { handler };
