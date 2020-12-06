const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
var chaiFiles = require('chai-files');
chai.use(chaiFiles);
chai.use(require('chai-json'));
chai.use(chaiAsPromised);
chai.should();

const DataHandler = require('../build/cjs/methods');
const FileHandler = require('../build/cjs/fileHandler');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');

const fileHandler = new FileHandler.default();
const json = path.basename('../vatsimData.json');

describe('#json handling', () => {

	before(() => {
		return new Promise(async (resolve) => {
			try {
				fs.statSync(json);
				resolve();
			} catch (err) {
				await fileHandler.initialUpdate();
				resolve();
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

	it('should contain the clients, prefiles and servers', () => {
		const file = fs.readFileSync(json);
		const parsed = JSON.parse(file);
		expect(parsed).to.include.all.keys('clients', 'prefiles', 'servers');
	});

	it('should update the json file', () => {
		fs.createReadStream('vatsimData.json').pipe(fs.createWriteStream('oldVatsimData.json'));
		fileHandler.update().then(() => {
			expect(json).to.equal(file('oldVatsimData.json'))
		})
	});

	it('should check to see if the json file needs updating', () => {
		expect(fileHandler.shouldUpdate()).to.eventually.equal(false);
	});

	after(() => {
		return new Promise(async (resolve) => {
			try {
				fs.unlinkSync('oldVatsimData.json')
				resolve();
			} catch (err) {
				console.error(err);
			}
		})
	})
});