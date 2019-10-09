const DataHandler = require('../handler');
const expect = require('chai').expect;
const handler = new DataHandler();

describe('#Data Handling', () => {
    describe('getClientCount()', () => {
        it('should get all clients', () => {
            expect(handler.getClientCount()).to.be.above(0);
        });
    });

    describe('getPilotCount()', () => {
        it('should get all pilots', () => {
            expect(handler.getPilotCount()).to.be.above(0);
        });
    });

    describe('getControllerCount()', () => {
        it('should get all controllers', () => {
            expect(handler.getControllerCount()).to.be.above(0);
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
});