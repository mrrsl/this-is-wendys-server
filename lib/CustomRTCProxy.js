import { WebSocket, WebSocketServer } from "ws";
import { SocketGroup } from "./WSInstance.js";

const sessionCountLimit = 2;
const orderingField = "meetingPriority";

class Meeting {
    /** Number of meeting participants. */
    clientCount;
    /** First client to the meeting. */
    firstConnected;
    /** Second client to the meeting. */
    secondConnected;
    
    constructor(ws) {
        this.firstConnected = (ws) ? ws : null;
        this.secondConnected = null;
        this.clientCount = this.firstConnected ? 1 : 0;
    }

    /**
     * 
     * @param {WebSocket} ws 
     * @returns 
     */
    addParticipant(ws) {
        if (this.firstConnected) {
            this.secondConnected = ws;
            this.clientCount = 2;
            ws[orderingField] = "secondConnected";
        } else {
            if (this.clientCount == 2) {
                ws.send("Too many trying to negotiate");
                ws.terminate();
                return;
            } else {
                this.firstConnected = ws;
                ws[orderingField] = "firstConnected";
            }
        }
        ws.on("close", this.closeHandler.bind(this, ws));
        ws.on("message", this.messageHandler.bind(this, ws));
    }

    /**
     * 
     * @param {CloseEvent} close 
     */
    closeHandler(ws, close) {
        this[ws[orderingField]] = null;
        this.clientCount--;
    }

    /**
     * 
     * @param {WebSocket} ws 
     * @param {MessageEvent} msgev 
     */
    messageHandler(ws, msgev) {
        let data = JSON.parse(msgev.data);

    }
}

export const SignalServer = class {

    meetings;

    constructor() {
        this.meetings = {};
    }
    
    addSocket(ws, meetingId) {

    }
};