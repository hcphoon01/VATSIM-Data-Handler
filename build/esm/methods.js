var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import FileHandler from "./fileHandler";
const fileHandler = new FileHandler();
export class DataHandler {
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
    getCount(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
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
        });
    }
    /**
     * Get information for clients relating to a given airport ICAO.
     *
     * @param {string} airport Airport ICAO code to get information for.
     *
     * @returns {Array | undefined} An array containing all clients relating to a given airport ICAO.
     */
    getAirportInfo(airport) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!airport) {
                return undefined;
            }
            else {
                let airportInfo = {};
                const parsed = yield this.fileHandler.loadFile();
                let airportInfoControllers = [];
                let airportInfoPilots = parsed.pilots.filter((pilot) => {
                    var _a, _b;
                    return ((_a = pilot.flight_plan) === null || _a === void 0 ? void 0 : _a.departure) === airport ||
                        ((_b = pilot.flight_plan) === null || _b === void 0 ? void 0 : _b.arrival) === airport;
                });
                airportInfo["pilots"] = airportInfoPilots;
                for (let i = 0; i < parsed.controllers.length; i++) {
                    const client = parsed.controllers[i];
                    if (client.callsign.includes(airport) &&
                        client.frequency !== "199.998") {
                        airportInfoControllers.push(client);
                    }
                    else if (client.callsign.includes(airport.substr(1) + "_") &&
                        client.frequency !== "199.998" &&
                        airport.startsWith("K")) {
                        airportInfoControllers.push(client);
                    }
                }
                airportInfo["controllers"] = airportInfoControllers;
                for (let i = 0; i < parsed.atis.length; i++) {
                    const atis = parsed.atis[i];
                    if (atis.callsign.includes(airport)) {
                        airportInfo["atis"] = atis;
                    }
                }
                return airportInfo;
            }
        });
    }
    /**
     * Get the most popular airports based on client count
     *
     * @returns {Array} An array containing the top 10 most popular airports.
     */
    getPopularAirports() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
            let airportList = [];
            let newAirport;
            for (let i = 0; i < parsed.pilots.length; i++) {
                const pilot = parsed.pilots[i];
                if (pilot.flight_plan && pilot.flight_plan.departure !== null) {
                    newAirport = true;
                    airportList.forEach((airport) => {
                        var _a;
                        if (airport.id === ((_a = pilot.flight_plan) === null || _a === void 0 ? void 0 : _a.departure)) {
                            airport.count++;
                            newAirport = false;
                        }
                    });
                    if (newAirport) {
                        airportList.push({
                            id: (_a = pilot.flight_plan) === null || _a === void 0 ? void 0 : _a.departure,
                            count: 1,
                        });
                    }
                }
                if (pilot.flight_plan && pilot.flight_plan.arrival !== null) {
                    newAirport = true;
                    airportList.forEach((airport) => {
                        var _a;
                        if (airport.id === ((_a = pilot.flight_plan) === null || _a === void 0 ? void 0 : _a.arrival)) {
                            airport.count++;
                            newAirport = false;
                        }
                    });
                    if (newAirport) {
                        airportList.push({
                            id: (_b = pilot.flight_plan) === null || _b === void 0 ? void 0 : _b.arrival,
                            count: 1,
                        });
                    }
                }
            }
            airportList.sort((a, b) => b.count - a.count);
            return airportList.slice(0, 10);
        });
    }
    /**
     * Get the flight information for given callsign.
     *
     * @param {String} callsign The callsign to get the flight information for.
     *
     * @returns {Object} An object containing flight information.
     */
    getFlightInfo(callsign) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
            let pilot = parsed.pilots.filter((obj) => obj.callsign === callsign);
            return pilot[0];
        });
    }
    /**
     * Get all connected pilots.
     *
     * @returns {Array} An array containing all connected pilots.
     */
    getClients() {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
            return parsed.pilots;
        });
    }
    /**
     * Get the flight information for a connected pilot.
     *
     * @param {Number} cid The VATSIM CID of the connected pilot.
     *
     * @returns {Object} An object containing flight information.
     */
    getClientDetails(cid) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
            let pilot = parsed.pilots.filter((obj) => obj.cid == cid);
            return pilot[0];
        });
    }
    /**
     * Get all the connected supervisors.
     *
     * @returns {Array} An array containing all connected supervisors.
     */
    getSupervisors() {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
            let supervisorList = [];
            parsed.controllers.map((controller) => {
                if (controller.rating === 11 || controller.rating === 12) {
                    supervisorList.push(controller);
                }
            });
            return supervisorList;
        });
    }
    /**
     * Get all the connected controllers.
     *
     * @returns {Array} An array containing all connected controllers.
     */
    getControllers() {
        return __awaiter(this, void 0, void 0, function* () {
            const parsed = yield this.fileHandler.loadFile();
            let controllerList = [];
            parsed.controllers.map((controller) => {
                if (controller.facility !== 0) {
                    controllerList.push(controller);
                }
            });
            return controllerList;
        });
    }
}
const handler = new DataHandler();
export { handler };
