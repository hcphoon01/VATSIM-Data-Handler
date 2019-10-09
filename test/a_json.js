const chai = require('chai');
chai.use(require('chai-json'));
const DataHandler = require('../handler');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');

let handler;
const json = path.basename('../vatsimData.json');

describe('#json handling', () => {
    it('should create vatsimData.json', async () => {
        handler = new DataHandler(overwrite = true);
        await handler.update();
        expect(json).to.be.a.jsonFile();
    });

    it('should store the last update date in the json file', () => {
        const file = fs.readFileSync(json);
        const parsed = JSON.parse(file);
        expect(new Date(parsed['updated_date'])).to.be.below(new Date());
    });

    it('should contain the connected pilots and controllers', () => {
        const file = fs.readFileSync(json);
        const parsed = JSON.parse(file);
        expect(parsed).to.include.all.keys('pilots', 'controllers');
    });
});
