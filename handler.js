const fs = require('fs');
const request = require('request');

class DataHandler {
    constructor(overwrite = null) {
        if (this.shouldUpdate() && !overwrite) this.update();
    }

    shouldUpdate() {
        if (!fs.existsSync('vatsimData.json')) return true;

        const file = fs.readFileSync('vatsimData.json');
        const parsed = JSON.parse(file)
        const oldDT = Date.parse(parsed['updated_date']);

        const dateDifference = Date.now() - oldDT;
        const minutes = Math.floor(dateDifference / 60000);

        if (minutes > 2) return true;

        return false; // Make sure that we return at least something if all the other conditions fail
    }

    async update() {
        const body = await this.downloadFile();
        const parsedJSON = JSON.parse(body);

        parsedJSON['updated_date'] = new Date();
        const json = JSON.stringify(parsedJSON);
        fs.writeFileSync('vatsimData.json', json);
    }

    downloadFile() {
        return new Promise((resolve, reject) => {
            request('http://us.data.vatsim.net/vatsim-data.json', (error, response, body) => {
                if (error) reject(error);

                if (response.statusCode != 200) {
                    reject('Invalid status code <' + response.statusCode + '>');
                }

                resolve(body);
            });
        });
    }

    // Retrieves the file and parses it into JSON
    loadFile() {
        return JSON.parse(fs.readFileSync('vatsimData.json'));
    }

    getClientCount() {
        const parsed = this.loadFile();
        return (parsed['pilots'].length + parsed['controllers'].length);
    }

    getPilotCount() {
        const parsed = this.loadFile();
        return parsed['pilots'].length;
    }

    getControllerCount() {
        const parsed = this.loadFile();
        return parsed['controllers'].length;
    }

    getAirportInfo(airport = null) {
        const parsed = this.loadFile();
        let airportInfo = [];

        parsed['pilots'].forEach(pilot => {
            if (pilot['plan']['departure'] === airport || pilot['plan']['arrival'] === airport) {
                airportInfo.push(pilot);
            }
        });

        parsed['controllers'].forEach(controller => {
            if (controller['callsign'].includes(airport) && controller['frequency'] != 99998) {
                airportInfo.push(controller);
            }
        });

        return airportInfo;
    }

    getPopularAirports() {
        const parsed = this.loadFile();
        let airportList = [];
        let newAirport;

        parsed['pilots'].forEach(pilot => {
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
                        id: pilot['plan']['departure'],
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
                        id: pilot['plan']['arrival'],
                        count: 1
                    });
                }
            }
        });

        airportList.sort((a, b) => b.count - a.count);

        return airportList.slice(0,10);
    }
}

module.exports = DataHandler;
