"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request");
const EventEmitter = require("events");
class FileHandler extends EventEmitter {
    constructor() {
        super();
        this.updateTimer = setInterval(this.update.bind(this), 60000);
        this.shouldUpdate.bind(this);
    }
    shouldUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs.existsSync("vatsimData.json"))
                yield this.initialUpdate();
            const file = fs.readFileSync("vatsimData.json");
            const parsed = JSON.parse(file.toString());
            const oldDT = Date.parse(parsed.updated_date);
            const dateDifference = Date.now() - oldDT;
            const minutes = Math.floor(dateDifference / 60000);
            if (minutes >= 1)
                yield this.update();
            return false;
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            fs.copyFile("vatsimData.json", "oldData.json", (err) => {
                if (err)
                    console.log(err);
            });
            let parsedJSON = yield this.downloadFile();
            parsedJSON.updated_date = new Date();
            const json = JSON.stringify(parsedJSON);
            fs.writeFileSync("vatsimData.json", json);
            const oldFile = fs.readFileSync("oldData.json");
            const newFile = fs.readFileSync("vatsimData.json");
            const oldParsed = JSON.parse(oldFile.toString());
            const newParsed = JSON.parse(newFile.toString());
            const pilotDiff = compareJson.map(oldParsed.pilots, newParsed.pilots);
            const controllerDiff = compareJson.map(oldParsed.controllers, newParsed.controllers);
            const result = {};
            for (const { type, data } of Object.values(pilotDiff)) {
                if (result[type]) {
                    result[type].push(data);
                }
                else {
                    result[type] = [data];
                }
            }
            for (const { type, data } of Object.values(controllerDiff)) {
                if (result[type]) {
                    result[type].push(data);
                }
                else {
                    result[type] = [data];
                }
            }
            if (result.created) {
                var newPilots = [];
                var newControllers = [];
                for (let i = 0; i < result.created.length; i++) {
                    const client = result.created[i];
                    if (client.altitude) {
                        newPilots.push(client);
                    }
                    else {
                        newControllers.push(client);
                    }
                }
                if (newControllers.length > 0) {
                    process.emit("newController", newControllers);
                }
                if (newPilots.length > 0) {
                    process.emit("newPilot", newPilots);
                }
            }
        });
    }
    initialUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            let parsedJSON = yield this.downloadFile();
            parsedJSON.updated_date = new Date();
            const json = JSON.stringify(parsedJSON);
            fs.writeFileSync("vatsimData.json", json);
        });
    }
    downloadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let urls = yield this.getUrls();
            const url = urls.data.v3[Math.floor(Math.random() * urls.data.v3.length)];
            return new Promise((resolve, reject) => {
                request.get({ url: url, json: true }, (error, response, body) => {
                    if (error)
                        reject(error);
                    if (response.statusCode !== 200) {
                        reject("Invalid status code <" + response.statusCode + ">");
                    }
                    resolve(body);
                });
            });
        });
    }
    getUrls() {
        return new Promise((resolve, reject) => {
            request.get({ url: "https://status.vatsim.net/status.json", json: true }, (error, response, body) => {
                if (error)
                    reject(error);
                if (response.statusCode !== 200) {
                    reject("Invalid status code <" + response.statusCode + ">");
                }
                resolve(body);
            });
        });
    }
    loadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.shouldUpdate();
            return JSON.parse(fs.readFileSync("vatsimData.json", { encoding: "utf-8" }));
        });
    }
}
var compareJson = (function () {
    return {
        VALUE_CREATED: "created",
        VALUE_UPDATED: "updated",
        VALUE_DELETED: "deleted",
        VALUE_UNCHANGED: "unchanged",
        map: function (obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                console.log("Invalid argument. Function given, object expected.");
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                return {
                    type: this.compareValues(obj1, obj2),
                    data: obj1 === undefined ? obj2 : obj1,
                };
            }
            var diff = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }
                var value2 = undefined;
                if (obj2[key] !== undefined) {
                    value2 = obj2[key];
                }
                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
                    continue;
                }
                diff[key] = this.map(undefined, obj2[key]);
            }
            return diff;
        },
        compareValues: function (value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) &&
                this.isDate(value2) &&
                value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if (value1 === undefined) {
                return this.VALUE_CREATED;
            }
            if (value2 === undefined) {
                return this.VALUE_DELETED;
            }
            return this.VALUE_UPDATED;
        },
        isFunction: function (x) {
            return Object.prototype.toString.call(x) === "[object Function]";
        },
        isArray: function (x) {
            return Object.prototype.toString.call(x) === "[object Array]";
        },
        isDate: function (x) {
            return Object.prototype.toString.call(x) === "[object Date]";
        },
        isObject: function (x) {
            return Object.prototype.toString.call(x) === "[object Object]";
        },
        isValue: function (x) {
            return !this.isObject(x) && !this.isArray(x);
        },
    };
})();
exports.default = FileHandler;
