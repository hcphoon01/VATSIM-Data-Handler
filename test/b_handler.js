const DataHandler = require('../handler');
const expect = require('chai').expect;
const handler = new DataHandler();

describe('#Data Handling', function(){
    it('should get all clients', function(){
        expect(handler.getClientCount()).to.be.above(0)
    })
    it('should get all pilots', function(){
        expect(handler.getPilotCount()).to.be.above(0)
    })
    it('should get all pilots', function(){
        expect(handler.getControllerCount()).to.be.above(0)
    })
    it('should get airport information for a given airport, EGLL', function(){
        expect(handler.getAirportInfo('EGLL')).to.be.an('array').that.is.not.empty
    })
    it('should get a list of the 10 most popular airports', function(){
        expect(handler.getPopularAirports()).to.be.an('array').to.have.lengthOf(10)
    })
})