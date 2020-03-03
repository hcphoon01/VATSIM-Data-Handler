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

const handler = new DataHandler();
const fileHandler = new FileHandler();
const json = path.basename('../vatsimData.json');

describe('#json handling', () => {
	var check = function(done){
		if (fs.existsSync(json)) done();
		else (setTimeout( () => {
			check(done);
		}, 100));
	};

	before((done) => {
		check(done);
	});
	
    it('should create vatsimData.json', async () => {
        fileHandler.initialUpdate().then(() => {
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