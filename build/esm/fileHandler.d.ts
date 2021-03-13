/// <reference types="node" />
declare const EventEmitter: any;
interface Status {
    data: {
        v3: Array<string>;
    };
    user: Array<string>;
    metar: Array<string>;
}
declare class FileHandler extends EventEmitter {
    constructor();
    updateTimer: NodeJS.Timeout;
    shouldUpdate(): Promise<boolean>;
    update(): Promise<any>;
    initialUpdate(): Promise<void>;
    downloadFile(): Promise<any>;
    getUrls(): Promise<Status>;
    loadFile(): Promise<any>;
}
export default FileHandler;
