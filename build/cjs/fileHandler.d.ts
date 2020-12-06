/// <reference types="node" />
declare const EventEmitter: any;
declare class FileHandler extends EventEmitter {
    constructor();
    updateTimer: NodeJS.Timeout;
    shouldUpdate(): Promise<boolean>;
    update(): Promise<any>;
    initialUpdate(): Promise<void>;
    downloadFile(): Promise<any>;
    loadFile(): Promise<any>;
}
export default FileHandler;
