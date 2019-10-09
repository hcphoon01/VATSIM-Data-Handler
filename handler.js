const fs = require('fs');
const request = require('request');

class DataHandler{
    
    constructor(overwrite = null){
        if(this.shouldUpdate() && !overwrite) {this.update()};
    }

    shouldUpdate(){
        if(!fs.existsSync("vatsimData.json")) {return true};

        const file = fs.readFileSync("vatsimData.json");
        const parsed = JSON.parse(file)
        const oldDT = Date.parse(parsed['updated_date']);
        
        const dateDifference = Date.now() - oldDT;
        const minutes = Math.floor(dateDifference / 60000);

        if (minutes > 2) {return true};
    }
    
    async update(){
        const body = await this.downloadFile();
        const parsedJSON = JSON.parse(body);
        parsedJSON['updated_date'] = new Date();
        const json = JSON.stringify(parsedJSON);
        fs.writeFileSync("vatsimData.json", json);
    }

    downloadFile(){
        return new Promise((resolve, reject) => {
            request("http://us.data.vatsim.net/vatsim-data.json", (error, response, body) => {
                if (error) reject(error);
                if (response.statusCode != 200) {
                    reject('Invalid status code <' + response.statusCode + '>');
                }
                resolve(body);
            });
        });
    }

    getClientCount(){
        const file = fs.readFileSync("vatsimData.json");
        const parsed = JSON.parse(file);
        
        return(parsed['pilots'].length + parsed['controllers'].length)
    }

    getPilotCount(){
        const file = fs.readFileSync("vatsimData.json");
        const parsed = JSON.parse(file);

        return(parsed['pilots'].length)
    }

    getControllerCount(){
        const file = fs.readFileSync("vatsimData.json");
        const parsed = JSON.parse(file);

        return(parsed['controllers'].length)
    }

    getAirportInfo(airport = null){
        const file = fs.readFileSync("vatsimData.json");
        const parsed = JSON.parse(file);
        let airportInfo = [];

        parsed['pilots'].forEach(pilot => {
            if(pilot['plan']['departure'] == airport || pilot['plan']['arrival'] == airport){
                airportInfo[airportInfo.length] = pilot;
            }
        });

        parsed['controllers'].forEach(controller => {
            if(controller['callsign'].includes(airport) && controller['frequency'] != 99998){
                airportInfo[airportInfo.length] = controller;
            }
        })
        
        return(airportInfo);
    }

    getPopularAirports(){
        const file = fs.readFileSync("vatsimData.json");
        const parsed = JSON.parse(file);
        let airportList = [];
        let newAirport;

        parsed['pilots'].forEach(pilot => {
            if (pilot.plan.departure != ''){
                newAirport = true;
                for(var i = 0; i < airportList.length; i++) {
                    if (airportList[i].id == pilot.plan.departure) {
                        airportList[i].count += 1
                        newAirport = false; 
                    }
                }
                if (newAirport == true){
                    airportList.push({
                        id: pilot['plan']['departure'],
                        count: 1
                    })     
                }
            }
            if (pilot.plan.arrival != ''){
                newAirport = true;
                for(var i = 0; i < airportList.length; i++) {
                    if (airportList[i].id == pilot.plan.arrival) {
                        airportList[i].count += 1
                        newAirport = false; 
                    }
                }
                if (newAirport == true){
                    airportList.push({
                        id: pilot['plan']['arrival'],
                        count: 1
                    })     
                }
            }
        })
        airportList.sort(function(a, b){
            return b.count-a.count
        });
        return(airportList.slice(0,10))
    }
}

module.exports = DataHandler;