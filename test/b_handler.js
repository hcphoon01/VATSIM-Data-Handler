const DataHandler = require('../src/methods');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

const fs = require('fs');
const path = require('path');
const handler = new DataHandler();

const jsonFile = path.basename('../vatsimData.json');

const controller = {
	"server": "UK-1",
	"callsign": "EGLL_SUP",
	"member": {
		"cid": 9999999,
		"name": "Test User"
	},
	"rating": 11,
	"frequency": 99998,
	"facility": 0,
	"range": 300,
	"latitude": -4.67434,
	"longitude": 55.52184
};

const pilot = {
	"server": "UK-1",
	"callsign": "VATSIMTEST1",
	"member": {
		"cid": 1234567,
		"name": "TEST USER"
	},
	"latitude": -4.67434,
	"longitude": 55.52184,
	"altitude": 100,
	"speed": 0,
	"heading": 107,
	"plan": {
		"flight_rules": "I",
		"aircraft": "A320",
		"cruise_speed": "480",
		"departure": "EGLL",
		"arrival": "EGLL",
		"altitude": "6000",
		"alternate": "EGLL",
	"route": "DCT",
	"time": {
		"departure": "1030",
		"hours_enroute": "1",
		"minutes_enroute": "00",
		"hours_fuel": "4",
		"minutes_fuel": "00"
	},
	"remarks": " /v/"
	},
};

describe('#Data Handling', () => {
	var check = function(done){
		if (fs.existsSync(jsonFile)) done();
		else (setTimeout( () => {
			check(done);
		}, 100));
	};
	before((done) => {
		check(done);
	});

	before(() => {
		const file = fs.readFileSync(jsonFile);
		const parsed = JSON.parse(file);
		
		parsed.controllers.push(controller);
		parsed.pilots.push(pilot);

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
			(handler.getFlightInfo('VATSIMTEST1')).should.eventually.be.an('object').that.includes(pilot);
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
			(handler.getClientDetails(1234567)).should.eventually.be.an('object').that.includes(pilot);
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
		const file = fs.readFileSync(jsonFile);
		const parsed = JSON.parse(file);

		parsed.controllers.splice(-1,1);
		parsed.pilots.splice(-1, 1);

		const json = JSON.stringify(parsed);
		fs.writeFileSync('vatsimData.json', json);
	});
});