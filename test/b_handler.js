const DataHandler = require('../build/cjs/methods');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

const fs = require('fs');
const path = require('path');
const handler = new DataHandler.default();

const jsonFile = path.basename('../vatsimData.json');

const controller = {
	"callsign": "EGLL_SUP",
	"cid": "9999999",
	"realname": "Test User",
	"clienttype": "ATC",
	"frequency": 199.998,
	"latitude": -4.67434,
	"longitude": 55.52184,
	"altitude": 0,
	"groundspeed": 0,
	"planned_aircraft": null,
	"planned_tascruise": null,
	"planned_depairport": null,
	"planned_altitude": null,
	"planned_destairport": null,
	"server": "UK-1",
	"protrevision": 100,
	"rating": 11,
	"transponder": 0,
	"facilitytype": 0,
	"visualrange": 300,
	"planned_revision": null,
	"planned_flighttype": null,
	"planned_deptime": null,
	"planned_actdeptime": null,
	"planned_hrsenroute": null,
	"planned_minenroute": null,
	"planned_hrsfuel": null,
	"planned_minfuel": null,
	"planned_altairport": null,
	"planned_remarks": null,
	"planned_route": null,
	"planned_depairport_lat": 0,
	"planned_depairport_lon": 0,
	"planned_destairport_lat": 0,
	"planned_destairport_lon": 0,
	"atis_message": "Heathrow Supervisor",
	"time_last_atis_received": "2020-04-06T00:54:36.0769604Z",
	"time_logon": "2020-04-06T00:54:36.0769602Z",
	"heading": 0,
	"qnh_i_hg": 0,
	"qnh_mb": 0
};

const pilot = {
    "callsign": "VATSIMTEST1",
    "cid": "1234567",
    "realname": "TEST USER",
    "clienttype": "PILOT",
    "frequency": null,
	"latitude": -4.67434,
	"longitude": 55.52184,
	"altitude": 100,
	"groundspeed": 0,
    "planned_aircraft": "A320/M",
    "planned_tascruise": "480",
    "planned_depairport": "EGLL",
    "planned_altitude": "6000",
    "planned_destairport": "EGLL",
    "server": "UK-1",
    "protrevision": 100,
    "rating": 1,
    "transponder": 1234,
    "facilitytype": 0,
    "visualrange": 0,
    "planned_revision": "1",
    "planned_flighttype": "I",
    "planned_deptime": "1030",
    "planned_actdeptime": "0",
    "planned_hrsenroute": "1",
    "planned_minenroute": "00",
    "planned_hrsfuel": "4",
    "planned_minfuel": "00",
    "planned_altairport": "EGLL",
    "planned_remarks": "/v/",
    "planned_route": "DCT",
    "planned_depairport_lat": 0,
    "planned_depairport_lon": 0,
    "planned_destairport_lat": 0,
    "planned_destairport_lon": 0,
    "atis_message": null,
    "time_last_atis_received": "2020-04-05T14:00:38.8546725Z",
    "time_logon": "2020-04-05T14:00:38.8546724Z",
    "heading": 360,
    "qnh_i_hg": 29.92,
    "qnh_mb": 1013
};

describe('#Data Handling', () => {
	before(() => {
		const file = fs.readFileSync(jsonFile);
		const parsed = JSON.parse(file);
		
		parsed.clients.push(controller);
		parsed.clients.push(pilot);

		const json = JSON.stringify(parsed);

		fs.writeFileSync('vatsimData.json', json);
	});

    describe(`getCount('all')`, () => {
        it('should get all clients', () => {
            (handler.getCount('all')).should.eventually.be.above(0);
        });
    });

    describe(`getCount('pilots')`, () => {
        it('should get all pilots', () => {
            (handler.getCount('pilots')).should.eventually.be.above(0);
        });
    });

    describe(`getCount('controllers')`, () => {
        it('should get all controllers', () => {
            (handler.getCount('controllers')).should.eventually.be.above(0);
        });
	});
	
	describe(`getCount('test')`, () => {
        it('should return undefined when a random type is inputted', () => {
            (handler.getCount('test')).should.eventually.be.undefined;
        });
    });

    describe('getAirportInfo()', () => {
        it('should get airport information for a given airport, EGLL', () => {
            (handler.getAirportInfo('EGLL')).should.eventually.be.an('object').that.is.not.empty;
        });

        it('should return an empty array when no airport is given', () => {
            (handler.getAirportInfo()).should.eventually.be.undefined;
		});
		
		it('should not include users with the frequency of 199.998', () =>{
			(handler.getAirportInfo('EGLL')).should.eventually.be.an('object').that.does.not.include(controller);
		});
    });

    describe('getPopularAirports()', () => {
        it('should get a list of the 10 most popular airports', () => {
            (handler.getPopularAirports()).should.eventually.be.an('array').to.have.lengthOf(10);
        });
	});

	describe('getFlightInfo(callsign)', () => {
		it('should get the flight infrmation for a connected callsign, VATSIMTEST1', () => {
			(handler.getFlightInfo('VATSIMTEST1')).should.eventually.be.an('object').that.is.not.empty;
		});
		it('should return undefined for a non connected callsign', () => {
			(handler.getClientDetails('THISISAMADEUPCALLSIGN')).should.eventually.be.undefined;
		});
	});

	describe('getClients()', () => {
		it('should return a list of all clients', () => {
			(handler.getClients()).should.eventually.be.an('array').that.is.not.empty;
		});
	});
	
	describe('getClientDetails(cid)', () => {
		it('should get flight information for a connected CID, 1234567', () => {
			(handler.getClientDetails(1234567)).should.eventually.be.an('object').that.is.not.empty;
		});
		it('should return undefined for a non connected CID', () => {
			(handler.getClientDetails(999999)).should.eventually.be.undefined;
		});
	});

	describe('getSupervisors()', () => {
		it('should return a list of supervisors connected to the VATSIM network, including a test supervisor', () => {
			(handler.getSupervisors()).should.eventually.be.an('array').that.is.not.empty;
		});
	});

	describe('getControllers()', () => {
		it('should return a list of all controllers connected to the VATSIM network', () => {
			(handler.getControllers()).should.eventually.be.an('array').that.is.not.empty;
		});
	});

	after(() => {
		fs.unlinkSync('vatsimData.json');
		fs.unlinkSync('oldData.json');
	});
});