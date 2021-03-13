const { handler } = require("../build/cjs/methods");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

const fs = require("fs");
const path = require("path");

const jsonFile = path.basename("../vatsimData.json");

const controller = {
  cid: 9999999,
  name: "Test User",
  callsign: "EGLL_SUP",
  frequency: 199.998,
  facility: 0,
  rating: 11,
  server: "UK-1",
  visual_range: 300,
  text_atis: ["Heathrow Supervisor", "This is the test"],
  last_updated: "2020-04-06T00:54:36.0769604Z",
  logon_time: "2020-04-06T00:54:36.0769602Z",
};

const pilot = {
  cid: 1234567,
  name: "TEST USER",
  callsign: "VATSIMTEST1",
  server: "UK-1",
  pilot_rating: 1,
  latitude: -4.67434,
  longitude: 55.52184,
  altitude: 100,
  groundspeed: 0,
  transponder: "1234",
  heading: 360,
  qnh_i_hg: 29.92,
  qnh_mb: 1013,
  flight_plan: {
    flight_rules: "I",
    aircraft: "A320/MA320/M-SDE2FGHIRWXY/LB1",
    aircraft_faa: "A320/L",
    aircraft_short: "A320",
    departure: "EGLL",
    arrival: "EGLL",
    alternate: "EGLL",
    cruise_tas: "480",
    altitude: "6000",
    deptime: "1030",
    enroute_time: "0100",
    fuel_time: "0400",
    remarks: "/v/",
    route: "DCT",
  },
  last_updated: "2020-04-05T14:00:38.8546725Z",
  logon_time: "2020-04-05T14:00:38.8546724Z",
};

describe("#Data Handling", () => {
  before(() => {
    const file = fs.readFileSync(jsonFile);
    const parsed = JSON.parse(file);

    parsed.controllers.push(controller);
    parsed.pilots.push(pilot);

    const json = JSON.stringify(parsed);

    fs.writeFileSync("vatsimData.json", json);
  });

  describe(`getCount('all')`, () => {
    it("should get all clients", () => {
      handler.getCount("all").should.eventually.be.above(0);
    });
  });

  describe(`getCount('pilots')`, () => {
    it("should get all pilots", () => {
      handler.getCount("pilots").should.eventually.be.above(0);
    });
  });

  describe(`getCount('controllers')`, () => {
    it("should get all controllers", () => {
      handler.getCount("controllers").should.eventually.be.above(0);
    });
  });

  describe(`getCount('test')`, () => {
    it("should return undefined when a random type is inputted", () => {
      handler.getCount("test").should.eventually.be.undefined;
    });
  });

  describe("getAirportInfo()", () => {
    it("should get airport information for a given airport, EGLL", () => {
      handler.getAirportInfo("EGLL").should.eventually.be.an("object").that.is
        .not.empty;
    });

    it("should return an empty array when no airport is given", () => {
      handler.getAirportInfo().should.eventually.be.undefined;
    });

    it("should not include users with the frequency of 199.998", () => {
      handler
        .getAirportInfo("EGLL")
        .should.eventually.be.an("object")
        .that.does.not.include(controller);
    });
  });

  describe("getPopularAirports()", () => {
    it("should get a list of the 10 most popular airports", () => {
      handler
        .getPopularAirports()
        .should.eventually.be.an("array")
        .to.have.lengthOf(10);
    });
  });

  describe("getFlightInfo(callsign)", () => {
    it("should get the flight infrmation for a connected callsign, VATSIMTEST1", () => {
      handler.getFlightInfo("VATSIMTEST1").should.eventually.be.an("object")
        .that.is.not.empty;
    });
    it("should return undefined for a non connected callsign", () => {
      handler.getClientDetails("THISISAMADEUPCALLSIGN").should.eventually.be
        .undefined;
    });
  });

  describe("getClients()", () => {
    it("should return a list of all clients", () => {
      handler.getClients().should.eventually.be.an("array").that.is.not.empty;
    });
  });

  describe("getClientDetails(cid)", () => {
    it("should get flight information for a connected CID, 1234567", () => {
      handler.getClientDetails(1234567).should.eventually.be.an("object").that
        .is.not.empty;
    });
    it("should return undefined for a non connected CID", () => {
      handler.getClientDetails(999999).should.eventually.be.undefined;
    });
  });

  describe("getSupervisors()", () => {
    it("should return a list of supervisors connected to the VATSIM network, including a test supervisor", () => {
      handler.getSupervisors().should.eventually.be.an("array").that.is.not
        .empty;
    });
  });

  describe("getControllers()", () => {
    it("should return a list of all controllers connected to the VATSIM network", () => {
      handler.getControllers().should.eventually.be.an("array").that.is.not
        .empty;
    });
  });

  after(() => {
    fs.unlinkSync("vatsimData.json");
    fs.unlinkSync("oldData.json");
  });
});
