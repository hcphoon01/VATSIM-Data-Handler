const DataHandler = require('../src/methods');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

const fs = require('fs');
const path = require('path');
const handler = new DataHandler();

const jsonFile = path.basename('../vatsimData.json');

const obj = {
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
		
		parsed.controllers.push(obj);
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
			(handler.getAirportInfo('EGLL')).should.eventually.be.an('object').that.does.not.include(obj);
		});
    });

    describe('getPopularAirports()', () => {
        it('should get a list of the 10 most popular airports', () => {
            (handler.getPopularAirports()).should.eventually.be.an('array').to.have.lengthOf(10);
        });
	});

	describe('getClients()', () => {
		it('should return a list of all clients', () => {
			(handler.getClients()).should.eventually.be.an('array').that.is.not.empty;
		});
	});
	
	describe('getClientDetails(cid)', () => {
		it('should return undefined for a non connected CID', () => {
			(handler.getClientDetails(999999)).should.eventually.be.undefined;
		});
	});

	describe('getSupervisors()', () => {
		it('should return a list of supervisors connected to the VATSIM network, including a test supervisor', () => {
			(handler.getSupervisors()).should.eventually.be.an('array').that.is.not.empty;
		});
	});

	after(() => {
		const file = fs.readFileSync(jsonFile);
		const parsed = JSON.parse(file);

		parsed.controllers.splice(-1,1);

		const json = JSON.stringify(parsed);
		fs.writeFileSync('vatsimData.json', json);
	});
});