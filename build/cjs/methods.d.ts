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
    qnh_i_hg: number;
    qnh_mb: number;
}
declare class DataHandler {
    private fileHandler;
    constructor();
    /**
     * Get connected client count.
     *
     * @param {string} type Type of client to return (all, pilots or controllers).
     *
     * @returns {Number} The number of clients based on the type.
     */
    getCount(type: string): Promise<number | undefined>;
    /**
     * Get information for clients relating to a given airport ICAO.
     *
     * @param {string} airport Airport ICAO code to get information for.
     *
     * @returns {Array} An array containing all clients relating to a given airport ICAO.
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
    getFlightInfo(callsign: string): Promise<Client>;
    /**
     * Get all connected pilots.
     *
     * @returns {Array} An array containing all connected pilots.
     */
    getClients(): Promise<Array<Client>>;
    /**
     * Get the flight information for a connected pilot.
     *
     * @param {Number} cid The VATSIM CID of the connected pilot.
     *
     * @returns {Object} An object containing flight information.
     */
    getClientDetails(cid: number): Promise<Client>;
    /**
     * Get all the connected supervisors.
     *
     * @returns {Array} An array containing all connected supervisors.
     */
    getSupervisors(): Promise<Array<Client>>;
    /**
     * Get all the connected controllers.
     *
     * @returns {Array} An array containing all connected controllers.
     */
    getControllers(): Promise<Array<Client>>;
}
export default DataHandler;
