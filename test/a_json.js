const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(require('chai-json'));
chai.use(chaiAsPromised);
chai.should();

const DataHandler = require('../src/methods');
const FileHandler = require('../src/fileHandler');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');

const fileHandler = new FileHandler();
const json = path.basename('../vatsimData.json');

describe('#json handling', () => {

	before(() => {
		return new Promise(async (resolve) => {
			if (fs.statSync(json)) { resolve(); }
			else {
				await fileHandler.initialUpdate();
				if (fs.statSync(json)) resolve();
			}
		});
	});
	
    it('should create vatsimData.json', async () => {
        fileHandler.shouldUpdate().then(() => {
			expect(json).to.be.a.jsonFile();
		});
	});
	
    it('should store the last update date in the json file', () => {
        const file = fs.readFileSync(json);
        const parsed = JSON.parse(file);
        expect(new Date(parsed.updated_date)).to.be.below(new Date());
	});
	
    it('should contain the connected pilots and controllers', () => {
        const file = fs.readFileSync(json);
        const parsed = JSON.parse(file);
        expect(parsed).to.include.all.keys('pilots', 'controllers');
	});
	
	it('should check to see if the json file needs updating', () => {
		expect(fileHandler.shouldUpdate()).to.eventually.equal(false);
	});
});