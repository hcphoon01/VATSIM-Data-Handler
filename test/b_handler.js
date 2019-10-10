const DataHandler = require('../handler');
const expect = require('chai').expect;
const handler = new DataHandler();

describe('#Data Handling', () => {
    describe(`getCount('all')`, () => {
        it('should get all clients', () => {
            expect(handler.getCount('all')).to.be.above(0);
        });
    });

    describe(`getCount('pilots')`, () => {
        it('should get all pilots', () => {
            expect(handler.getCount('pilots')).to.be.above(0);
        });
    });

    describe(`getCount('controllers')`, () => {
        it('should get all controllers', () => {
            expect(handler.getCount('controllers')).to.be.above(0);
        });
	});
	
	describe(`getCount('test')`, () => {
        it('should return undefined when a random type is inputted', () => {
            expect(handler.getCount('test')).to.be.undefined; //jshint ignore:line
        });
    });

    describe('getAirportInfo()', () => {
        it('should get airport information for a given airport, EGLL', () => {
            expect(handler.getAirportInfo('EGLL')).to.be.an('array').that.is.not.empty; // jshint ignore:line
        });

        it('should return an empty array when no airport is given', () => {
            expect(handler.getAirportInfo()).to.be.an('array').that.is.empty; // jshint ignore:line
        });
    });

    describe('getPopularAirports()', () => {
        it('should get a list of the 10 most popular airports', () => {
            expect(handler.getPopularAirports()).to.be.an('array').to.have.lengthOf(10);
        });
	});
	
	describe('getClientDetails(cid)', () => {
		it('should return undefined for a non connected CID', () => {
			expect(handler.getClientDetails(999999)).to.be.undefined; //jshint ignore:line
		});
	});
});